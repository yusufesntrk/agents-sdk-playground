"""
Repository Management für das Agent Control Panel.

Verwaltet GitHub Repos: Listen, Clonen, Pull, Push.
Mit JSON-Persistenz für verbundene Repos.
"""

import asyncio
import json
import shutil
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Optional
from uuid import uuid4

from github import Github, Auth
from fastapi import APIRouter, Request, HTTPException

from .auth import require_auth
from .models import GitHubRepo, ConnectedRepo, ConnectRepoRequest

# Base Directory für geclonte Repos
REPOS_DIR = Path.home() / ".agent-panel" / "repos"
REPOS_DIR.mkdir(parents=True, exist_ok=True)

# Persistenz-Datei für verbundene Repos
REPOS_FILE = Path.home() / ".agent-panel" / "connected_repos.json"


def _load_repos() -> dict[str, ConnectedRepo]:
    """Lädt verbundene Repos aus JSON-Datei."""
    if not REPOS_FILE.exists():
        return {}

    try:
        with open(REPOS_FILE) as f:
            data = json.load(f)

        repos = {}
        for repo_id, repo_data in data.items():
            # Prüfen ob lokaler Pfad noch existiert
            local_path = repo_data.get("local_path", "")
            if local_path and not Path(local_path).exists():
                print(f"Skipping repo {repo_id}: path {local_path} no longer exists")
                continue

            repos[repo_id] = ConnectedRepo(
                id=repo_data["id"],
                github_id=repo_data["github_id"],
                name=repo_data["name"],
                full_name=repo_data["full_name"],
                local_path=local_path,
                status=repo_data.get("status", "ready"),
                error=repo_data.get("error"),
                is_linked=repo_data.get("is_linked", False),
            )
        return repos
    except (json.JSONDecodeError, KeyError) as e:
        print(f"Warning: Failed to load repos file: {e}")
        return {}


def _save_repos() -> None:
    """Speichert verbundene Repos in JSON-Datei."""
    data = {}
    for repo_id, repo in connected_repos.items():
        data[repo_id] = {
            "id": repo.id,
            "github_id": repo.github_id,
            "name": repo.name,
            "full_name": repo.full_name,
            "local_path": repo.local_path,
            "status": repo.status,
            "error": repo.error,
            "is_linked": repo.is_linked,
        }

    REPOS_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(REPOS_FILE, "w") as f:
        json.dump(data, f, indent=2)


# In-Memory Storage für verbundene Repos (geladen aus JSON)
connected_repos: dict[str, ConnectedRepo] = _load_repos()


def get_github_client(access_token: str) -> Github:
    """Erstellt einen authentifizierten GitHub Client."""
    auth = Auth.Token(access_token)
    return Github(auth=auth)


async def list_github_repos(access_token: str) -> list[GitHubRepo]:
    """
    Listet alle GitHub Repos des Users auf.

    Läuft in Thread Pool da PyGithub synchron ist.
    """
    def _list_repos():
        g = get_github_client(access_token)
        repos = []

        for repo in g.get_user().get_repos(sort='updated'):
            repos.append(GitHubRepo(
                id=repo.id,
                name=repo.name,
                full_name=repo.full_name,
                url=repo.html_url,
                description=repo.description,
                private=repo.private,
            ))

        g.close()
        return repos

    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _list_repos)


async def clone_repo(full_name: str, access_token: str) -> Path:
    """
    Clont ein GitHub Repo lokal.

    Args:
        full_name: z.B. "user/repo"
        access_token: GitHub Access Token

    Returns:
        Pfad zum geclonten Repo
    """
    # Lokaler Pfad (ersetze / durch _)
    local_name = full_name.replace("/", "_")
    local_path = REPOS_DIR / local_name

    # Falls schon existiert, löschen
    if local_path.exists():
        shutil.rmtree(local_path)

    # Clone URL mit Token
    clone_url = f"https://{access_token}@github.com/{full_name}.git"

    # Git Clone ausführen
    process = await asyncio.create_subprocess_exec(
        "git", "clone", clone_url, str(local_path),
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise Exception(f"Git clone failed: {stderr.decode()}")

    return local_path


async def pull_repo(local_path: Path) -> bool:
    """Pulled neueste Änderungen."""
    process = await asyncio.create_subprocess_exec(
        "git", "-C", str(local_path), "pull",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    await process.communicate()
    return process.returncode == 0


async def push_repo(local_path: Path, message: str = "Agent changes") -> bool:
    """Pushed Änderungen zum Remote."""
    # Add all changes
    await asyncio.create_subprocess_exec(
        "git", "-C", str(local_path), "add", "-A"
    )

    # Commit
    await asyncio.create_subprocess_exec(
        "git", "-C", str(local_path), "commit", "-m", message
    )

    # Push
    process = await asyncio.create_subprocess_exec(
        "git", "-C", str(local_path), "push",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    await process.communicate()
    return process.returncode == 0


# ==================== API Router ====================

router = APIRouter(prefix="/api/repos", tags=["repos"])


@router.get("/github")
async def get_github_repos(request: Request) -> list[GitHubRepo]:
    """
    Listet alle GitHub Repos des eingeloggten Users.
    """
    user = require_auth(request)
    repos = await list_github_repos(user.access_token)
    return repos


@router.get("")
async def get_connected_repos(request: Request) -> list[ConnectedRepo]:
    """
    Listet alle verbundenen (geclonten) Repos.
    """
    require_auth(request)
    return list(connected_repos.values())


@router.post("/connect")
async def connect_repo(request: Request, data: ConnectRepoRequest) -> ConnectedRepo:
    """
    Verbindet ein GitHub Repo.

    Wenn local_path angegeben → Link zu existierendem lokalen Repo
    Sonst → Clone von GitHub
    """
    user = require_auth(request)

    # Check ob schon verbunden
    existing = next(
        (r for r in connected_repos.values() if r.github_id == data.github_id),
        None
    )
    if existing:
        raise HTTPException(status_code=400, detail="Repo already connected")

    repo_id = str(uuid4())[:8]

    # Option 1: Lokales Repo verlinken
    if data.local_path:
        local_path = Path(data.local_path).expanduser().resolve()

        # Prüfen ob Pfad existiert und ein Git Repo ist
        if not local_path.exists():
            raise HTTPException(status_code=400, detail=f"Path does not exist: {local_path}")
        if not (local_path / ".git").exists():
            raise HTTPException(status_code=400, detail=f"Not a git repository: {local_path}")

        repo = ConnectedRepo(
            id=repo_id,
            github_id=data.github_id,
            name=data.full_name.split("/")[-1],
            full_name=data.full_name,
            local_path=str(local_path),
            status="linked",
            is_linked=True
        )
        connected_repos[repo_id] = repo
        _save_repos()  # Persistieren
        return repo

    # Option 2: Von GitHub clonen
    repo = ConnectedRepo(
        id=repo_id,
        github_id=data.github_id,
        name=data.full_name.split("/")[-1],
        full_name=data.full_name,
        local_path="",
        status="cloning",
        is_linked=False
    )
    connected_repos[repo_id] = repo

    try:
        local_path = await clone_repo(data.full_name, user.access_token)
        repo.local_path = str(local_path)
        repo.status = "ready"
    except Exception as e:
        repo.status = "error"
        repo.error = str(e)

    _save_repos()  # Persistieren
    return repo


@router.delete("/{repo_id}")
async def disconnect_repo(request: Request, repo_id: str):
    """
    Trennt ein Repo.

    - Geclonte Repos: Lokaler Clone wird gelöscht
    - Verlinkte Repos: Nur Referenz wird entfernt (Dateien bleiben!)
    """
    require_auth(request)

    if repo_id not in connected_repos:
        raise HTTPException(status_code=404, detail="Repo not found")

    repo = connected_repos[repo_id]

    # Nur geclonte Repos löschen, NICHT verlinkte!
    if not repo.is_linked and repo.local_path:
        local_path = Path(repo.local_path)
        if local_path.exists():
            shutil.rmtree(local_path)

    del connected_repos[repo_id]
    _save_repos()  # Persistieren
    return {"status": "disconnected", "files_deleted": not repo.is_linked}


@router.post("/{repo_id}/pull")
async def pull_connected_repo(request: Request, repo_id: str):
    """
    Pulled neueste Änderungen für ein verbundenes Repo.
    """
    require_auth(request)

    if repo_id not in connected_repos:
        raise HTTPException(status_code=404, detail="Repo not found")

    repo = connected_repos[repo_id]

    if repo.status != "ready":
        raise HTTPException(status_code=400, detail="Repo not ready")

    success = await pull_repo(Path(repo.local_path))

    if success:
        return {"status": "pulled"}
    else:
        raise HTTPException(status_code=500, detail="Pull failed")


def _check_git_repo(path: Path, github_names: dict) -> dict | None:
    """Prüft ob ein Verzeichnis ein GitHub Repo ist und gibt Info zurück."""
    git_dir = path / ".git"
    if not git_dir.exists():
        return None

    config_file = git_dir / "config"
    if not config_file.exists():
        return None

    try:
        import re
        config_text = config_file.read_text()
        match = re.search(r'url = .*github\.com[:/](.+?)(?:\.git)?$', config_text, re.MULTILINE)
        if match:
            remote_name = match.group(1).strip().lower()
            if remote_name in github_names:
                github_repo = github_names[remote_name]
                return {
                    "github_id": github_repo.id,
                    "full_name": github_repo.full_name,
                    "name": github_repo.name,
                    "local_path": str(path),
                    "private": github_repo.private,
                }
    except Exception:
        pass
    return None


@router.get("/detect-local")
async def detect_local_repos(request: Request):
    """
    Scannt nach lokalen Git Repos die zu GitHub Repos matchen.

    Sucht in:
    - Aktuelles Verzeichnis (direkt)
    - Parent-Verzeichnis (für Geschwister-Repos)
    - ~/Developer, ~/Projects, ~/Code, ~/repos, ~/github
    """
    user = require_auth(request)

    cwd = Path.cwd()

    # Verzeichnisse zum Scannen (für Unterverzeichnisse)
    scan_dirs = [
        cwd.parent,  # Parent für Geschwister-Repos
        Path.home() / "Developer",
        Path.home() / "Projects",
        Path.home() / "Code",
        Path.home() / "repos",
        Path.home() / "github",
    ]

    # GitHub Repos des Users holen
    github_repos = await list_github_repos(user.access_token)
    github_names = {r.full_name.lower(): r for r in github_repos}

    detected = []
    seen_paths = set()

    # Zuerst: Aktuelles Verzeichnis direkt prüfen
    result = _check_git_repo(cwd, github_names)
    if result:
        detected.append(result)
        seen_paths.add(str(cwd))

    # Dann: Unterverzeichnisse der scan_dirs durchsuchen
    for scan_dir in scan_dirs:
        if not scan_dir.exists():
            continue

        for item in scan_dir.iterdir():
            if not item.is_dir():
                continue
            if str(item) in seen_paths:
                continue

            result = _check_git_repo(item, github_names)
            if result:
                detected.append(result)
                seen_paths.add(str(item))

    return {
        "detected": detected,
        "scanned_dirs": [str(cwd)] + [str(d) for d in scan_dirs if d.exists()]
    }
