"""
FastAPI Backend für das SDLC Multi-Agent System.

Startet den Server und stellt die API + WebSocket bereit.

Usage:
    uv run python -m backend.main
"""

import asyncio
import os
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

from .models import CreateTaskRequest, MoveTaskRequest, TaskResponse
from .websocket import manager
from agents.sdlc.orchestrator import SDLCOrchestrator


# Orchestrator mit Working Directory
WORKING_DIR = os.getcwd()
orchestrator = SDLCOrchestrator(WORKING_DIR)


# Event Handlers für WebSocket Broadcasting
def on_status_change(task):
    """Broadcast Task Status Changes."""
    asyncio.create_task(manager.broadcast({
        "type": "task_update",
        "task": task.to_dict()
    }))


def on_agent_message(agent: str, event_type: str, data):
    """Broadcast Agent Messages."""
    asyncio.create_task(manager.broadcast({
        "type": "agent_message",
        "agent": agent,
        "event": event_type,
        "data": str(data)[:1000]  # Truncate für Performance
    }))


# Orchestrator Callbacks registrieren
orchestrator.on_status_change(on_status_change)
orchestrator.on_agent_message(on_agent_message)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application Lifecycle."""
    print(f"🚀 SDLC Multi-Agent System starting...")
    print(f"📁 Working Directory: {WORKING_DIR}")
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="SDLC Multi-Agent System",
    description="Plan → Build → Review → Ship",
    version="1.0.0",
    lifespan=lifespan
)


# Static Files (Frontend)
frontend_path = Path(__file__).parent.parent / "frontend"
if frontend_path.exists():
    app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")


# Routes

@app.get("/")
async def root():
    """Serve Frontend."""
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"message": "SDLC Multi-Agent System API", "docs": "/docs"}


@app.get("/api/tasks")
async def get_tasks() -> list[TaskResponse]:
    """Alle Tasks abrufen."""
    tasks = orchestrator.get_all_tasks()
    return [TaskResponse(**t.to_dict()) for t in tasks]


@app.get("/api/tasks/{task_id}")
async def get_task(task_id: str) -> TaskResponse:
    """Einzelne Task abrufen."""
    task = orchestrator.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return TaskResponse(**task.to_dict())


@app.post("/api/tasks")
async def create_task(request: CreateTaskRequest) -> TaskResponse:
    """Neue Task erstellen."""
    task = orchestrator.create_task(request.title, request.description)
    return TaskResponse(**task.to_dict())


@app.patch("/api/tasks/{task_id}/move")
async def move_task(task_id: str, request: MoveTaskRequest) -> TaskResponse:
    """Task zu Stage verschieben und Processing starten."""
    task = orchestrator.get_task(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Async Processing starten
    asyncio.create_task(process_task_async(task_id, request.stage))

    return TaskResponse(**task.to_dict())


async def process_task_async(task_id: str, stage: str):
    """Verarbeitet Task asynchron und broadcastet Updates."""
    try:
        if stage == "plan":
            async for event in orchestrator.stream_process(task_id):
                await manager.broadcast(event)
        else:
            task = await orchestrator.move_to_stage(task_id, stage)
            await manager.broadcast({
                "type": "task_update",
                "task": task.to_dict()
            })
    except Exception as e:
        await manager.broadcast({
            "type": "error",
            "task_id": task_id,
            "message": str(e)
        })


@app.delete("/api/tasks/{task_id}")
async def delete_task(task_id: str):
    """Task löschen."""
    if task_id in orchestrator.tasks:
        del orchestrator.tasks[task_id]
        await manager.broadcast({
            "type": "task_deleted",
            "task_id": task_id
        })
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Task not found")


# WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket für Real-time Updates."""
    await manager.connect(websocket)

    # Initial State senden
    tasks = orchestrator.get_all_tasks()
    await manager.send_to(websocket, {
        "type": "init",
        "tasks": [t.to_dict() for t in tasks],
        "connection_count": manager.connection_count
    })

    try:
        while True:
            # Client Messages empfangen
            data = await websocket.receive_text()
            # Hier könnten Client-Commands verarbeitet werden
    except WebSocketDisconnect:
        await manager.disconnect(websocket)


# Health Check

@app.get("/health")
async def health():
    """Health Check."""
    return {
        "status": "healthy",
        "connections": manager.connection_count,
        "tasks": len(orchestrator.tasks)
    }


def main():
    """Entry Point."""
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )


if __name__ == "__main__":
    main()
