"""
FastAPI Backend für das Agent Control Panel.

Features:
- GitHub OAuth Authentication
- Repo Management (Clone, Pull, Push)
- SDLC Multi-Agent System
- Real-time WebSocket Updates

Usage:
    uv run python -m backend.main
"""

import asyncio
import os
from pathlib import Path
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from starlette.middleware.sessions import SessionMiddleware
import uvicorn

from .models import (
    CreateTaskRequest, MoveTaskRequest, TaskResponse,
    AgentCreateRequest, AgentResponse, AgentTreeResponse, AgentTreeNode, AgentStatsModel,
    AgentStatus as ModelAgentStatus,
    ScanResultResponse, ScannedIssueResponse, ScannedTaskResponse, ImportTasksRequest,
    # Planner Models
    QuestionModel, CodeSpecModel, PlanSectionModel, TaskPlanResponse,
    SubmitAnswersRequest, ExecutionStepModel, ExecutionProgressResponse,
    FileLockModel, FileLockStatusResponse,
    # Chat Models
    ChatRequest, ChatResponse,
)
from .websocket import manager
from .auth import router as auth_router, get_current_user
from .repos import router as repos_router
from .agents import registry, spawner, broker, AgentStatus
from .repos import connected_repos
from .scanner import scanner_service, ScanStatus
from .planner import (
    autonomous_planner, init_planner,
    question_collector, file_lock_manager, execution_engine,
    PlannerPhase, QuestionType,
)
from agents.sdlc.orchestrator import SDLCOrchestrator

# Load environment variables
load_dotenv()


# Orchestrator mit Working Directory
WORKING_DIR = os.getcwd()
orchestrator = SDLCOrchestrator(WORKING_DIR)

# Autonomous Planner initialisieren
planner = init_planner(WORKING_DIR)


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


# Agent Management Callbacks
async def on_agent_registry_change(agent, event_type: str):
    """Broadcast agent registry changes via WebSocket."""
    await manager.broadcast({
        "type": "agent_registry",
        "event": event_type,
        "agent": agent.to_dict()
    })


async def on_agent_spawner_message(agent_id: str, event_type: str, data):
    """Broadcast agent spawner messages via WebSocket."""
    await manager.broadcast({
        "type": "agent_output",
        "agent_id": agent_id,
        "event": event_type,
        "data": data
    })


async def on_agent_complete(agent_id: str, success: bool, error: str = None):
    """Broadcast agent completion via WebSocket."""
    await manager.broadcast({
        "type": "agent_complete",
        "agent_id": agent_id,
        "success": success,
        "error": error
    })


# Register agent management callbacks
registry.on_change(on_agent_registry_change)
spawner.on_message(on_agent_spawner_message)
spawner.on_complete(on_agent_complete)


# Scanner Callbacks
async def on_scanner_progress(repo_id: str, status: ScanStatus, message: str = None):
    """Broadcast scanner progress via WebSocket."""
    await manager.broadcast({
        "type": "scan_progress",
        "repo_id": repo_id,
        "status": status.value,
        "message": message
    })


# Register scanner callbacks
scanner_service.on_progress(on_scanner_progress)


# Planner Callbacks
async def on_planner_phase_change(task_id: str, phase: PlannerPhase):
    """Broadcast planner phase change via WebSocket."""
    await manager.broadcast({
        "type": "planner_phase_change",
        "task_id": task_id,
        "phase": phase.value
    })


async def on_planner_progress(task_id: str, message: str, data: dict = None):
    """Broadcast planner progress via WebSocket."""
    await manager.broadcast({
        "type": "planner_progress",
        "task_id": task_id,
        "message": message,
        "data": data or {}
    })


# Register planner callbacks
planner.on_phase_change(on_planner_phase_change)
planner.on_progress(on_planner_progress)


def agent_to_response(agent) -> AgentResponse:
    """Convert internal AgentInfo to response model."""
    return AgentResponse(
        id=agent.id,
        name=agent.name,
        status=ModelAgentStatus(agent.status.value),
        parent_id=agent.parent_id,
        children_ids=agent.children_ids,
        created_at=agent.created_at.isoformat(),
        updated_at=agent.updated_at.isoformat(),
        stats=AgentStatsModel(
            messages_sent=agent.stats.messages_sent,
            messages_received=agent.stats.messages_received,
            tool_calls=agent.stats.tool_calls,
            errors=agent.stats.errors,
            total_duration_ms=agent.stats.total_duration_ms,
        ),
        system_prompt=agent.system_prompt,
        allowed_tools=agent.allowed_tools,
        error=agent.error,
        repo_id=agent.repo_id,
        repo_name=agent.repo_name,
    )


def tree_node_from_dict(data: dict) -> AgentTreeNode:
    """Convert tree dict to AgentTreeNode."""
    return AgentTreeNode(
        id=data["id"],
        name=data["name"],
        status=ModelAgentStatus(data["status"]),
        parent_id=data.get("parent_id"),
        children_ids=data.get("children_ids", []),
        created_at=data["created_at"],
        updated_at=data["updated_at"],
        stats=AgentStatsModel(**data["stats"]),
        system_prompt=data.get("system_prompt"),
        allowed_tools=data.get("allowed_tools"),
        error=data.get("error"),
        repo_id=data.get("repo_id"),
        repo_name=data.get("repo_name"),
        children=[tree_node_from_dict(c) for c in data.get("children", [])],
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application Lifecycle."""
    print(f"🚀 Agent Control Panel starting...")
    print(f"📁 Working Directory: {WORKING_DIR}")
    print(f"🔐 GitHub OAuth: {'Configured' if os.getenv('GITHUB_CLIENT_ID') else 'Not configured'}")
    yield
    print("👋 Shutting down...")


app = FastAPI(
    title="Agent Control Panel",
    description="GitHub Repos + Multi-Agent Orchestration",
    version="2.0.0",
    lifespan=lifespan
)

# Session Middleware für OAuth
SESSION_SECRET = os.getenv("SESSION_SECRET", "dev-secret-change-in-production")
app.add_middleware(SessionMiddleware, secret_key=SESSION_SECRET)

# Auth Router
app.include_router(auth_router)

# Repos Router
app.include_router(repos_router)

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


# ==================== Agent Management API ====================

@app.get("/api/agents", response_model=AgentTreeResponse)
async def get_agents():
    """Get all agents as a tree structure."""
    tree = await registry.get_tree()
    return AgentTreeResponse(
        agents=[tree_node_from_dict(node) for node in tree],
        total_count=registry.count,
        running_count=registry.running_count,
    )


@app.post("/api/agents", response_model=AgentResponse)
async def create_agent(request: AgentCreateRequest):
    """Create and start a new agent."""
    try:
        # Determine working directory from repo if specified
        cwd = WORKING_DIR
        repo_name = None

        if request.repo_id and request.repo_id in connected_repos:
            repo = connected_repos[request.repo_id]
            if repo.local_path:
                cwd = repo.local_path
                repo_name = repo.name

        # Spawn agent (registers and starts it)
        agent = await spawner.spawn_agent(
            name=request.name,
            prompt=request.prompt,
            system_prompt=request.system_prompt,
            parent_id=request.parent_id,
            allowed_tools=request.allowed_tools,
            cwd=cwd,
            repo_id=request.repo_id,
            repo_name=repo_name,
        )
        return agent_to_response(agent)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")


@app.get("/api/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(agent_id: str):
    """Get agent details by ID."""
    agent = await registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent_to_response(agent)


@app.post("/api/agents/{agent_id}/start", response_model=AgentResponse)
async def start_agent(agent_id: str, prompt: str = "Continue your work"):
    """Start or resume an agent with a new prompt."""
    agent = await registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.status == AgentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Agent is already running")

    try:
        # Spawn a new execution for the existing agent
        updated_agent = await spawner.spawn_agent(
            name=agent.name,
            prompt=prompt,
            system_prompt=agent.system_prompt,
            parent_id=agent.parent_id,
            allowed_tools=agent.allowed_tools,
            cwd=WORKING_DIR,
        )
        return agent_to_response(updated_agent)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start agent: {str(e)}")


@app.post("/api/agents/{agent_id}/stop")
async def stop_agent(agent_id: str):
    """Stop a running agent."""
    agent = await registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if agent.status != AgentStatus.RUNNING:
        raise HTTPException(status_code=400, detail="Agent is not running")

    success = await spawner.stop_agent(agent_id)
    if success:
        agent = await registry.get_agent(agent_id)
        return {"status": "stopped", "agent": agent.to_dict() if agent else None}
    else:
        raise HTTPException(status_code=500, detail="Failed to stop agent")


@app.delete("/api/agents/{agent_id}")
async def delete_agent(agent_id: str, recursive: bool = True):
    """Delete an agent and optionally its children."""
    agent = await registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    # Stop agent if running
    if agent.status == AgentStatus.RUNNING:
        await spawner.stop_agent(agent_id)

    # Cleanup and unregister
    success = await spawner.cleanup(agent_id)
    if success:
        await manager.broadcast({
            "type": "agent_deleted",
            "agent_id": agent_id,
        })
        return {"status": "deleted"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete agent")


@app.get("/api/agents/{agent_id}/children", response_model=list[AgentResponse])
async def get_agent_children(agent_id: str):
    """Get direct children of an agent."""
    children = await registry.get_children(agent_id)
    return [agent_to_response(child) for child in children]


@app.get("/api/agents/{agent_id}/descendants", response_model=list[AgentResponse])
async def get_agent_descendants(agent_id: str):
    """Get all descendants (children, grandchildren, etc.) of an agent."""
    descendants = await registry.get_descendants(agent_id)
    return [agent_to_response(desc) for desc in descendants]


@app.post("/api/agents/{agent_id}/message")
async def send_agent_message(agent_id: str, to_id: str, content: dict):
    """Send a message from one agent to another."""
    from_agent = await registry.get_agent(agent_id)
    to_agent = await registry.get_agent(to_id)

    if not from_agent:
        raise HTTPException(status_code=404, detail="Source agent not found")
    if not to_agent:
        raise HTTPException(status_code=404, detail="Target agent not found")

    message = await broker.send_message(agent_id, to_id, content)
    return {"status": "sent", "message": message.to_dict()}


@app.post("/api/agents/{agent_id}/broadcast")
async def broadcast_agent_message(agent_id: str, content: dict):
    """Broadcast a message from an agent to all other agents."""
    agent = await registry.get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    messages = await broker.broadcast(agent_id, content)
    return {"status": "broadcast", "message_count": len(messages)}


# ==================== Chat API ====================

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a chat message. Spawns a master agent that orchestrates sub-agents.
    Responses are streamed via WebSocket.
    """
    from uuid import uuid4

    # Validate repo
    if request.repo_id not in connected_repos:
        raise HTTPException(status_code=404, detail="Repository not found")

    repo = connected_repos[request.repo_id]
    if repo.status != "ready":
        raise HTTPException(status_code=400, detail="Repository not ready")

    session_id = str(uuid4())[:8]

    # Create master agent system prompt
    master_system_prompt = """You are an AI coding assistant with access to a multi-agent system.

IMPORTANT RULES:
- NEVER use emojis in your responses
- Be concise and professional
- Output plain text only

When given a task, you should:
1. ANALYZE the request to understand what needs to be done
2. PLAN the implementation by breaking it into steps
3. IMPLEMENT using your tools (Read, Write, Edit, Bash, etc.)
4. VERIFY your changes work correctly

You work in the repository and can modify files directly.
Be thorough and complete the task fully before responding."""

    # Spawn master agent in background
    asyncio.create_task(_run_chat_agent(
        session_id=session_id,
        message=request.message,
        cwd=repo.local_path,
        repo_id=request.repo_id,
        repo_name=repo.name,
        system_prompt=master_system_prompt,
    ))

    return ChatResponse(status="processing", session_id=session_id)


async def _run_chat_agent(
    session_id: str,
    message: str,
    cwd: str,
    repo_id: str,
    repo_name: str,
    system_prompt: str,
):
    """Run the chat agent and stream responses via WebSocket."""
    try:
        # Spawn master agent
        agent = await spawner.spawn_agent(
            name="master",
            prompt=message,
            system_prompt=system_prompt,
            parent_id=None,
            allowed_tools=None,  # Full access
            cwd=cwd,
            repo_id=repo_id,
            repo_name=repo_name,
        )

        # Broadcast agent spawned
        await manager.broadcast({
            "type": "agent_spawned",
            "agent": agent.to_dict(),
        })

        # The spawner handles streaming via registry callbacks
        # Wait for completion by polling agent status
        while True:
            current = await registry.get_agent(agent.id)
            if not current or current.status in [AgentStatus.STOPPED, AgentStatus.ERROR]:
                break
            if current.status != AgentStatus.RUNNING:
                break
            await asyncio.sleep(0.5)

        # Send completion
        final_agent = await registry.get_agent(agent.id)
        await manager.broadcast({
            "type": "chat_complete",
            "session_id": session_id,
            "success": final_agent.status != AgentStatus.ERROR if final_agent else False,
            "error": final_agent.error if final_agent else None,
        })

        # Cleanup: Remove completed agent from registry after 5 seconds
        await asyncio.sleep(5)
        await spawner.cleanup(agent.id)

    except Exception as e:
        await manager.broadcast({
            "type": "error",
            "session_id": session_id,
            "message": str(e),
        })


# ==================== Scanner API ====================

@app.post("/api/scanner/scan/{repo_id}")
async def scan_repo(repo_id: str, request: Request) -> ScanResultResponse:
    """
    Startet Scan für ein verbundenes Repo.

    Scannt GitHub Issues und Repo-Dateien nach Tasks.
    """
    from .auth import get_current_user

    # User für GitHub Token holen
    user = get_current_user(request)
    github_token = user.access_token if user else None

    # Repo-Info holen
    if repo_id not in connected_repos:
        raise HTTPException(status_code=404, detail="Repo not found")

    repo = connected_repos[repo_id]

    if repo.status != "ready":
        raise HTTPException(status_code=400, detail="Repo not ready")

    # Scan starten (async)
    result = await scanner_service.scan_repo(
        repo_id=repo_id,
        repo_path=repo.local_path,
        repo_full_name=repo.full_name,
        github_token=github_token
    )

    # Response erstellen
    return ScanResultResponse(
        repo_id=result.repo_id,
        repo_name=result.repo_name,
        status=result.status.value,
        issues=[
            ScannedIssueResponse(
                id=issue.id,
                number=issue.number,
                title=issue.title,
                body=issue.body,
                state=issue.state,
                labels=issue.labels,
                url=issue.url,
                created_at=issue.created_at.isoformat() if issue.created_at else "",
                assignee=issue.assignee,
                milestone=issue.milestone,
            )
            for issue in result.issues
        ],
        file_tasks=[
            ScannedTaskResponse(
                id=task.id,
                title=task.title,
                description=task.description,
                source_file=task.source_file,
                line_number=task.line_number,
                status=task.status,
                priority=task.priority,
                tags=task.tags,
            )
            for task in result.file_tasks
        ],
        scanned_at=result.scanned_at.isoformat() if result.scanned_at else None,
        error=result.error,
        total_count=result.total_count,
        todo_count=result.todo_count,
    )


@app.get("/api/scanner/results/{repo_id}")
async def get_scan_results(repo_id: str) -> ScanResultResponse:
    """
    Holt Scan-Ergebnisse für ein Repo.
    """
    result = scanner_service.get_result(repo_id)

    if not result:
        raise HTTPException(status_code=404, detail="No scan results found")

    return ScanResultResponse(
        repo_id=result.repo_id,
        repo_name=result.repo_name,
        status=result.status.value,
        issues=[
            ScannedIssueResponse(
                id=issue.id,
                number=issue.number,
                title=issue.title,
                body=issue.body,
                state=issue.state,
                labels=issue.labels,
                url=issue.url,
                created_at=issue.created_at.isoformat() if issue.created_at else "",
                assignee=issue.assignee,
                milestone=issue.milestone,
            )
            for issue in result.issues
        ],
        file_tasks=[
            ScannedTaskResponse(
                id=task.id,
                title=task.title,
                description=task.description,
                source_file=task.source_file,
                line_number=task.line_number,
                status=task.status,
                priority=task.priority,
                tags=task.tags,
            )
            for task in result.file_tasks
        ],
        scanned_at=result.scanned_at.isoformat() if result.scanned_at else None,
        error=result.error,
        total_count=result.total_count,
        todo_count=result.todo_count,
    )


@app.get("/api/scanner/results")
async def get_all_scan_results() -> list[ScanResultResponse]:
    """
    Holt alle Scan-Ergebnisse.
    """
    results = scanner_service.get_all_results()

    return [
        ScanResultResponse(
            repo_id=result.repo_id,
            repo_name=result.repo_name,
            status=result.status.value,
            issues=[
                ScannedIssueResponse(
                    id=issue.id,
                    number=issue.number,
                    title=issue.title,
                    body=issue.body,
                    state=issue.state,
                    labels=issue.labels,
                    url=issue.url,
                    created_at=issue.created_at.isoformat() if issue.created_at else "",
                    assignee=issue.assignee,
                    milestone=issue.milestone,
                )
                for issue in result.issues
            ],
            file_tasks=[
                ScannedTaskResponse(
                    id=task.id,
                    title=task.title,
                    description=task.description,
                    source_file=task.source_file,
                    line_number=task.line_number,
                    status=task.status,
                    priority=task.priority,
                    tags=task.tags,
                )
                for task in result.file_tasks
            ],
            scanned_at=result.scanned_at.isoformat() if result.scanned_at else None,
            error=result.error,
            total_count=result.total_count,
            todo_count=result.todo_count,
        )
        for result in results
    ]


@app.post("/api/scanner/import")
async def import_tasks(request: ImportTasksRequest) -> list[TaskResponse]:
    """
    Importiert ausgewählte gescannte Items als Tasks.

    Erstellt neue Tasks aus ausgewählten GitHub Issues und/oder File-Tasks.
    """
    result = scanner_service.get_result(request.repo_id)

    if not result:
        raise HTTPException(status_code=404, detail="No scan results found")

    imported_tasks = []

    # Issues importieren
    for issue_id in request.issue_ids:
        issue = next((i for i in result.issues if i.id == issue_id), None)
        if issue:
            task = orchestrator.create_task(
                title=f"[#{issue.number}] {issue.title}",
                description=f"{issue.body or ''}\n\n---\nImported from: {issue.url}"
            )
            imported_tasks.append(TaskResponse(**task.to_dict()))

    # File-Tasks importieren
    for task_id in request.task_ids:
        file_task = next((t for t in result.file_tasks if t.id == task_id), None)
        if file_task:
            task = orchestrator.create_task(
                title=file_task.title,
                description=f"{file_task.description}\n\n---\nSource: {file_task.source_file}:{file_task.line_number}"
            )
            imported_tasks.append(TaskResponse(**task.to_dict()))

    # Broadcast neue Tasks
    for task in imported_tasks:
        await manager.broadcast({
            "type": "task_created",
            "task": task.model_dump()
        })

    return imported_tasks


@app.post("/api/scanner/auto-scan/{repo_id}")
async def toggle_auto_scan(repo_id: str, enabled: bool = True):
    """
    Toggle Auto-Scan für ein Repo.

    Wenn aktiviert, wird das Repo bei Änderungen automatisch gescannt.
    """
    if repo_id not in connected_repos:
        raise HTTPException(status_code=404, detail="Repo not found")

    scanner_service.toggle_auto_scan(repo_id, enabled)

    return {
        "repo_id": repo_id,
        "auto_scan_enabled": scanner_service.is_auto_scan_enabled(repo_id)
    }


@app.delete("/api/scanner/results/{repo_id}")
async def clear_scan_results(repo_id: str):
    """
    Löscht Scan-Ergebnisse für ein Repo.
    """
    scanner_service.clear_result(repo_id)
    return {"status": "cleared", "repo_id": repo_id}


# WebSocket

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket für Real-time Updates."""
    await manager.connect(websocket)

    # Initial State senden
    tasks = orchestrator.get_all_tasks()
    agents = await registry.get_all()
    agent_tree = await registry.get_tree()

    await manager.send_to(websocket, {
        "type": "init",
        "tasks": [t.to_dict() for t in tasks],
        "agents": [a.to_dict() for a in agents],
        "agent_tree": agent_tree,
        "agent_count": registry.count,
        "running_agent_count": registry.running_count,
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
        "tasks": len(orchestrator.tasks),
        "agents": registry.count,
        "running_agents": registry.running_count,
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
