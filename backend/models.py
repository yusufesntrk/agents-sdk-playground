"""
Pydantic Models für die SDLC API.
"""

from pydantic import BaseModel
from typing import Optional
from enum import Enum


class TaskStatus(str, Enum):
    """Task Status."""
    TODO = "todo"
    PLANNING = "planning"
    BUILDING = "building"
    REVIEWING = "reviewing"
    SHIPPED = "shipped"
    FAILED = "failed"


class CreateTaskRequest(BaseModel):
    """Request zum Erstellen einer Task."""
    title: str
    description: str


class MoveTaskRequest(BaseModel):
    """Request zum Verschieben einer Task."""
    stage: str  # plan, build, review


class TaskResponse(BaseModel):
    """Task Response."""
    id: str
    title: str
    description: str
    status: TaskStatus
    spec: Optional[str] = None
    files_modified: list[str] = []
    files_created: list[str] = []
    review_status: Optional[str] = None
    review_summary: Optional[str] = None
    created_at: str
    updated_at: str
    error: Optional[str] = None


class WebSocketMessage(BaseModel):
    """WebSocket Message Format."""
    type: str
    agent: Optional[str] = None
    event: Optional[str] = None
    data: Optional[dict] = None
    task: Optional[TaskResponse] = None
