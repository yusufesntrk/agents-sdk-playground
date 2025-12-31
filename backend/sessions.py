"""
Session Manager - Verwaltet Chat-Sessions pro Repo.

Jedes Repo kann mehrere parallele Chat-Sessions haben.
Jede Session hat eine eigene Chat-Historie und einen zugeordneten Agent.
"""

from dataclasses import dataclass, field
from datetime import datetime
from uuid import uuid4
from enum import Enum
from typing import Callable, Any


class SessionStatus(Enum):
    """Status einer Chat-Session."""
    ACTIVE = "active"      # Session ist aktiv, Agent läuft evtl.
    IDLE = "idle"          # Session ist idle, kein Agent aktiv
    ARCHIVED = "archived"  # Session wurde archiviert


@dataclass
class ChatMessage:
    """Eine einzelne Chat-Nachricht."""
    id: str
    role: str  # "user" | "assistant" | "system"
    content: str
    timestamp: datetime
    agent_id: str | None = None
    tool_calls: list[dict] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "agent_id": self.agent_id,
            "tool_calls": self.tool_calls,
        }


@dataclass
class ChatSession:
    """Eine Chat-Session."""
    id: str
    repo_id: str
    name: str
    status: SessionStatus
    messages: list[ChatMessage] = field(default_factory=list)
    agent_id: str | None = None
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "repo_id": self.repo_id,
            "name": self.name,
            "status": self.status.value,
            "messages": [m.to_dict() for m in self.messages],
            "agent_id": self.agent_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "message_count": len(self.messages),
        }


class SessionManager:
    """
    Verwaltet Chat-Sessions pro Repo.

    Features:
    - Mehrere Sessions pro Repo
    - Chat-Historie pro Session
    - Agent-Zuordnung pro Session
    """

    def __init__(self):
        self.sessions: dict[str, ChatSession] = {}  # session_id → Session
        self.repo_sessions: dict[str, list[str]] = {}  # repo_id → [session_ids]
        self._session_counter: dict[str, int] = {}  # repo_id → counter für Namen
        self._on_change: Callable[[ChatSession, str], Any] | None = None

    def on_change(self, callback: Callable[[ChatSession, str], Any]) -> None:
        """Registriert Callback für Session-Änderungen."""
        self._on_change = callback

    def _emit_change(self, session: ChatSession, event: str) -> None:
        """Emittiert Change-Event."""
        if self._on_change:
            self._on_change(session, event)

    def create_session(self, repo_id: str, name: str | None = None) -> ChatSession:
        """
        Erstellt eine neue Chat-Session für ein Repo.

        Args:
            repo_id: ID des Repos
            name: Optionaler Name (sonst "Chat 1", "Chat 2", etc.)

        Returns:
            Neue ChatSession
        """
        session_id = str(uuid4())[:8]

        # Auto-Name generieren
        if not name:
            counter = self._session_counter.get(repo_id, 0) + 1
            self._session_counter[repo_id] = counter
            name = f"Chat {counter}"

        session = ChatSession(
            id=session_id,
            repo_id=repo_id,
            name=name,
            status=SessionStatus.IDLE,
        )

        self.sessions[session_id] = session

        # Repo-Sessions tracken
        if repo_id not in self.repo_sessions:
            self.repo_sessions[repo_id] = []
        self.repo_sessions[repo_id].append(session_id)

        self._emit_change(session, "created")
        return session

    def get_session(self, session_id: str) -> ChatSession | None:
        """Holt eine Session by ID."""
        return self.sessions.get(session_id)

    def get_repo_sessions(self, repo_id: str) -> list[ChatSession]:
        """Holt alle Sessions für ein Repo."""
        session_ids = self.repo_sessions.get(repo_id, [])
        return [
            self.sessions[sid]
            for sid in session_ids
            if sid in self.sessions
        ]

    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        agent_id: str | None = None,
        tool_calls: list[dict] | None = None
    ) -> ChatMessage | None:
        """
        Fügt eine Nachricht zur Session hinzu.

        Args:
            session_id: Session ID
            role: "user" | "assistant" | "system"
            content: Nachrichteninhalt
            agent_id: Optional Agent ID
            tool_calls: Optional Tool-Calls

        Returns:
            Die erstellte Nachricht oder None
        """
        session = self.sessions.get(session_id)
        if not session:
            return None

        message = ChatMessage(
            id=str(uuid4())[:8],
            role=role,
            content=content,
            timestamp=datetime.now(),
            agent_id=agent_id,
            tool_calls=tool_calls or [],
        )

        session.messages.append(message)
        session.updated_at = datetime.now()

        self._emit_change(session, "message_added")
        return message

    def append_to_last_message(self, session_id: str, content: str) -> bool:
        """
        Hängt Content an die letzte Nachricht an (für Streaming).

        Args:
            session_id: Session ID
            content: Content zum Anhängen

        Returns:
            True wenn erfolgreich
        """
        session = self.sessions.get(session_id)
        if not session or not session.messages:
            return False

        last_message = session.messages[-1]
        last_message.content += content
        session.updated_at = datetime.now()

        return True

    def set_agent(self, session_id: str, agent_id: str | None) -> bool:
        """
        Setzt den aktiven Agent für eine Session.

        Args:
            session_id: Session ID
            agent_id: Agent ID (oder None zum Entfernen)

        Returns:
            True wenn erfolgreich
        """
        session = self.sessions.get(session_id)
        if not session:
            return False

        session.agent_id = agent_id
        session.status = SessionStatus.ACTIVE if agent_id else SessionStatus.IDLE
        session.updated_at = datetime.now()

        self._emit_change(session, "agent_changed")
        return True

    def set_status(self, session_id: str, status: SessionStatus) -> bool:
        """Setzt den Status einer Session."""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session.status = status
        session.updated_at = datetime.now()

        self._emit_change(session, "status_changed")
        return True

    def rename_session(self, session_id: str, name: str) -> bool:
        """Benennt eine Session um."""
        session = self.sessions.get(session_id)
        if not session:
            return False

        session.name = name
        session.updated_at = datetime.now()

        self._emit_change(session, "renamed")
        return True

    def archive_session(self, session_id: str) -> bool:
        """Archiviert eine Session."""
        return self.set_status(session_id, SessionStatus.ARCHIVED)

    def delete_session(self, session_id: str) -> bool:
        """
        Löscht eine Session.

        Args:
            session_id: Session ID

        Returns:
            True wenn erfolgreich
        """
        session = self.sessions.get(session_id)
        if not session:
            return False

        # Aus sessions entfernen
        del self.sessions[session_id]

        # Aus repo_sessions entfernen
        repo_id = session.repo_id
        if repo_id in self.repo_sessions:
            self.repo_sessions[repo_id] = [
                sid for sid in self.repo_sessions[repo_id]
                if sid != session_id
            ]

        self._emit_change(session, "deleted")
        return True

    def clear_repo_sessions(self, repo_id: str) -> int:
        """
        Löscht alle Sessions eines Repos.

        Returns:
            Anzahl gelöschter Sessions
        """
        session_ids = self.repo_sessions.get(repo_id, []).copy()
        count = 0

        for sid in session_ids:
            if self.delete_session(sid):
                count += 1

        return count

    @property
    def count(self) -> int:
        """Gesamtzahl aller Sessions."""
        return len(self.sessions)

    @property
    def active_count(self) -> int:
        """Anzahl aktiver Sessions."""
        return sum(1 for s in self.sessions.values() if s.status == SessionStatus.ACTIVE)


# Globale Instanz
session_manager = SessionManager()
