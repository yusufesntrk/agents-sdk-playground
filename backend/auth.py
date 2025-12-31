"""
GitHub Authentication für das Agent Control Panel.

Unterstützt zwei Modi:
1. GITHUB_TOKEN env var → Auto-Login ohne OAuth (empfohlen)
2. OAuth Flow → Falls kein Token gesetzt

Token von `gh auth token` holen.
"""

import os
import secrets
import httpx
from typing import Optional
from dataclasses import dataclass, field
from datetime import datetime

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse

# Token aus Environment
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN', '')


@dataclass
class User:
    """Authenticated User."""
    id: int
    login: str
    name: str
    email: str
    avatar_url: str
    access_token: str
    created_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "login": self.login,
            "name": self.name,
            "email": self.email,
            "avatar_url": self.avatar_url,
        }


# In-Memory User Storage (Session ID -> User)
user_sessions: dict[str, User] = {}

# Cached token user (für Auto-Login)
_token_user: Optional[User] = None


async def fetch_github_user(token: str) -> User:
    """Holt User-Info von GitHub API mit Token."""
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
        }

        # User Info
        resp = await client.get("https://api.github.com/user", headers=headers)
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Invalid GitHub token")

        user_data = resp.json()

        # E-Mail holen
        email = user_data.get('email')
        if not email:
            emails_resp = await client.get("https://api.github.com/user/emails", headers=headers)
            if emails_resp.status_code == 200:
                emails = emails_resp.json()
                primary_email = next((e for e in emails if e.get('primary')), None)
                email = primary_email['email'] if primary_email else f"{user_data['login']}@github.local"
            else:
                email = f"{user_data['login']}@github.local"

        return User(
            id=user_data['id'],
            login=user_data['login'],
            name=user_data.get('name') or user_data['login'],
            email=email,
            avatar_url=user_data['avatar_url'],
            access_token=token,
        )


async def get_token_user() -> Optional[User]:
    """Holt den User für GITHUB_TOKEN (cached)."""
    global _token_user

    if not GITHUB_TOKEN:
        return None

    if _token_user is None:
        try:
            _token_user = await fetch_github_user(GITHUB_TOKEN)
            print(f"✅ Auto-Login: {_token_user.login}")
        except Exception as e:
            print(f"❌ GitHub Token invalid: {e}")
            return None

    return _token_user


def get_current_user(request: Request) -> Optional[User]:
    """Holt den aktuellen User aus der Session."""
    session_id = request.session.get("session_id")
    if not session_id:
        return None
    return user_sessions.get(session_id)


def require_auth(request: Request) -> User:
    """Erfordert authentifizierten User, sonst 401."""
    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user


# Router für Auth Endpoints
router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login")
async def login(request: Request):
    """
    Login - nutzt GITHUB_TOKEN wenn vorhanden.
    """
    # Bereits eingeloggt?
    if get_current_user(request):
        return RedirectResponse(url="/")

    # Token-basierter Auto-Login
    token_user = await get_token_user()
    if token_user:
        session_id = secrets.token_urlsafe(32)
        user_sessions[session_id] = token_user
        request.session["session_id"] = session_id
        return RedirectResponse(url="/")

    # Kein Token → Fehler (OAuth entfernt für Simplizität)
    raise HTTPException(
        status_code=400,
        detail="GITHUB_TOKEN nicht gesetzt. Run: gh auth token"
    )


@router.get("/callback")
async def auth_callback(request: Request):
    """OAuth Callback - nicht mehr benötigt."""
    return RedirectResponse(url="/")


@router.get("/logout")
async def logout(request: Request):
    """Logout - Session löschen."""
    session_id = request.session.get("session_id")
    if session_id and session_id in user_sessions:
        del user_sessions[session_id]

    request.session.clear()
    return RedirectResponse(url="/")


@router.get("/me")
async def get_me(request: Request):
    """Aktueller User Info."""
    user = get_current_user(request)
    if not user:
        return {"user": None}
    return {"user": user.to_dict()}
