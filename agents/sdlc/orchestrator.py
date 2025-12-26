"""
SDLC Orchestrator - Koordiniert die Multi-Agent Pipeline.

Verwaltet den Workflow: Plan → Build → Review → Ship
"""

import asyncio
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum
from typing import AsyncGenerator, Callable, Any
from uuid import uuid4

from .agents import PlannerAgent, BuilderAgent, ReviewerAgent
from .agents.reviewer import ReviewStatus


class TaskStatus(Enum):
    """Task Status im SDLC Workflow."""
    TODO = "todo"
    PLANNING = "planning"
    BUILDING = "building"
    REVIEWING = "reviewing"
    SHIPPED = "shipped"
    FAILED = "failed"


@dataclass
class Task:
    """Repräsentiert eine Task im SDLC System."""
    id: str
    title: str
    description: str
    status: TaskStatus = TaskStatus.TODO
    spec: str = ""
    files_modified: list[str] = field(default_factory=list)
    files_created: list[str] = field(default_factory=list)
    review_status: ReviewStatus | None = None
    review_summary: str = ""
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    error: str | None = None

    def to_dict(self) -> dict:
        """Konvertiert Task zu Dict für JSON."""
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "spec": self.spec,
            "files_modified": self.files_modified,
            "files_created": self.files_created,
            "review_status": self.review_status.value if self.review_status else None,
            "review_summary": self.review_summary,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "error": self.error
        }


class SDLCOrchestrator:
    """
    Orchestriert den SDLC Multi-Agent Workflow.

    Koordiniert Planner, Builder und Reviewer Agents
    und verwaltet den Task-Lifecycle.
    """

    def __init__(self, working_dir: str = "."):
        self.working_dir = working_dir
        self.tasks: dict[str, Task] = {}

        # Agents initialisieren
        self.planner = PlannerAgent(working_dir)
        self.builder = BuilderAgent(working_dir)
        self.reviewer = ReviewerAgent(working_dir)

        # Event Callbacks
        self._on_status_change: Callable[[Task], None] | None = None
        self._on_agent_message: Callable[[str, str, Any], None] | None = None

    def on_status_change(self, callback: Callable[[Task], None]) -> None:
        """Registriert Callback für Status-Änderungen."""
        self._on_status_change = callback

    def on_agent_message(self, callback: Callable[[str, str, Any], None]) -> None:
        """Registriert Callback für Agent-Messages."""
        self._on_agent_message = callback

    def _emit_status(self, task: Task) -> None:
        """Emittiert Status-Change Event."""
        task.updated_at = datetime.now()
        if self._on_status_change:
            self._on_status_change(task)

    def _emit_message(self, agent: str, event_type: str, data: Any) -> None:
        """Emittiert Agent-Message Event."""
        if self._on_agent_message:
            self._on_agent_message(agent, event_type, data)

    def create_task(self, title: str, description: str) -> Task:
        """Erstellt eine neue Task."""
        task = Task(
            id=str(uuid4())[:8],
            title=title,
            description=description
        )
        self.tasks[task.id] = task
        self._emit_status(task)
        return task

    def get_task(self, task_id: str) -> Task | None:
        """Holt eine Task by ID."""
        return self.tasks.get(task_id)

    def get_all_tasks(self) -> list[Task]:
        """Holt alle Tasks."""
        return list(self.tasks.values())

    async def process_task(self, task_id: str) -> Task:
        """
        Verarbeitet eine Task durch die komplette Pipeline.

        Plan → Build → Review → Ship/Failed
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        try:
            # Phase 1: Planning
            task.status = TaskStatus.PLANNING
            self._emit_status(task)

            plan_result = await self.planner.plan(
                task.description,
                on_message=lambda m: self._emit_message("planner", "message", m)
            )

            if not plan_result.success:
                raise Exception(f"Planning failed: {plan_result.error}")

            task.spec = plan_result.spec
            task.files_modified = plan_result.files_to_modify
            task.files_created = plan_result.files_to_create

            # Phase 2: Building
            task.status = TaskStatus.BUILDING
            self._emit_status(task)

            build_result = await self.builder.build(
                task.spec,
                on_message=lambda m: self._emit_message("builder", "message", m)
            )

            if not build_result.success:
                raise Exception(f"Building failed: {build_result.error}")

            task.files_modified = build_result.files_modified
            task.files_created = build_result.files_created

            # Phase 3: Reviewing
            task.status = TaskStatus.REVIEWING
            self._emit_status(task)

            review_result = await self.reviewer.review(
                task.spec,
                task.files_modified,
                task.files_created,
                on_message=lambda m: self._emit_message("reviewer", "message", m)
            )

            if not review_result.success:
                raise Exception(f"Review failed: {review_result.error}")

            task.review_status = review_result.status
            task.review_summary = review_result.summary

            # Final Status
            if review_result.status == ReviewStatus.APPROVED:
                task.status = TaskStatus.SHIPPED
            else:
                task.status = TaskStatus.FAILED
                task.error = "Review found issues: " + "; ".join(review_result.issues)

            self._emit_status(task)
            return task

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            self._emit_status(task)
            return task

    async def stream_process(self, task_id: str) -> AsyncGenerator[dict, None]:
        """
        Streamt den kompletten Prozess.

        Yields Events für jeden Schritt im Workflow.
        """
        task = self.tasks.get(task_id)
        if not task:
            yield {"type": "error", "message": f"Task {task_id} not found"}
            return

        try:
            # Phase 1: Planning
            task.status = TaskStatus.PLANNING
            yield {"type": "status", "task": task.to_dict()}

            spec_parts = []
            async for event in self.planner.stream_plan(task.description):
                yield {"type": "planner", **event}
                if event.get("type") == "text":
                    spec_parts.append(event.get("content", ""))

            task.spec = "".join(spec_parts)

            # Phase 2: Building
            task.status = TaskStatus.BUILDING
            yield {"type": "status", "task": task.to_dict()}

            async for event in self.builder.stream_build(task.spec):
                yield {"type": "builder", **event}
                if event.get("type") == "tool_call":
                    tool = event.get("tool", "")
                    if tool in ["Write", "Edit"]:
                        path = event.get("input", {}).get("file_path", "")
                        if path:
                            if tool == "Write":
                                task.files_created.append(path)
                            else:
                                task.files_modified.append(path)

            # Phase 3: Reviewing
            task.status = TaskStatus.REVIEWING
            yield {"type": "status", "task": task.to_dict()}

            review_text = []
            async for event in self.reviewer.stream_review(
                task.spec,
                list(set(task.files_modified)),
                list(set(task.files_created))
            ):
                yield {"type": "reviewer", **event}
                if event.get("type") == "text":
                    review_text.append(event.get("content", ""))

            full_review = "".join(review_text)
            task.review_summary = full_review

            if "APPROVED" in full_review.upper():
                task.review_status = ReviewStatus.APPROVED
                task.status = TaskStatus.SHIPPED
            else:
                task.review_status = ReviewStatus.NEEDS_CHANGES
                task.status = TaskStatus.FAILED
                task.error = "Review requires changes"

            yield {"type": "status", "task": task.to_dict()}
            yield {"type": "complete", "task": task.to_dict()}

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            yield {"type": "error", "message": str(e), "task": task.to_dict()}

    async def move_to_stage(self, task_id: str, stage: str) -> Task:
        """
        Bewegt Task zu einem bestimmten Stage und startet Processing.

        Args:
            task_id: Task ID
            stage: Target Stage (plan, build, review)

        Returns:
            Updated Task
        """
        task = self.tasks.get(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")

        if stage == "plan":
            # Starte kompletten Workflow
            return await self.process_task(task_id)
        elif stage == "build":
            # Nur Build + Review
            if not task.spec:
                raise ValueError("No spec available - run planning first")
            task.status = TaskStatus.BUILDING
            self._emit_status(task)
            # ... build logic
        elif stage == "review":
            # Nur Review
            if not task.files_modified and not task.files_created:
                raise ValueError("No files to review - run build first")
            task.status = TaskStatus.REVIEWING
            self._emit_status(task)
            # ... review logic

        return task
