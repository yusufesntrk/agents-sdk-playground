"""
WebSocket Handler für Real-time Updates.
"""

import asyncio
import json
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect


class ConnectionManager:
    """Verwaltet WebSocket Connections."""

    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self._lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket) -> None:
        """Neue Connection akzeptieren."""
        await websocket.accept()
        async with self._lock:
            self.active_connections.add(websocket)

    async def disconnect(self, websocket: WebSocket) -> None:
        """Connection entfernen."""
        async with self._lock:
            self.active_connections.discard(websocket)

    async def broadcast(self, message: dict) -> None:
        """Nachricht an alle Clients senden."""
        if not self.active_connections:
            return

        json_message = json.dumps(message, default=str)
        disconnected = set()

        for connection in self.active_connections.copy():
            try:
                await connection.send_text(json_message)
            except Exception:
                disconnected.add(connection)

        # Disconnected Connections entfernen
        if disconnected:
            async with self._lock:
                self.active_connections -= disconnected

    async def send_to(self, websocket: WebSocket, message: dict) -> None:
        """Nachricht an spezifischen Client senden."""
        try:
            await websocket.send_text(json.dumps(message, default=str))
        except Exception:
            await self.disconnect(websocket)

    @property
    def connection_count(self) -> int:
        """Anzahl aktiver Connections."""
        return len(self.active_connections)


# Globaler Manager
manager = ConnectionManager()
