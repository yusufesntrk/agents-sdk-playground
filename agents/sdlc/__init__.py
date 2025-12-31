"""
Micro SDLC System - Multi-Agent Orchestration with Fix-Loops.

Key Features:
- 7 Specialized Agents: Planner, Builder, Reviewer, UIReviewer, Tester, QA, Debugger
- Fix-Loops: Review → Fix → Re-Review (max 3x per phase)
- Parallel Features: Process independent features concurrently
- Parallel Validation: 2x gleiche Agents parallel für redundante Prüfung
- Autonomous Decisions: No user questions, pattern inference from codebase

Agent Chain:
  Plan → Build → Review (2x parallel) → UI Review (2x parallel)
       → Test (2x parallel) → QA (2x parallel) → Ship

Parallel Validation:
  Alle Prüf-Phasen spawnen 2 Agent-Instanzen parallel.
  Findings werden gemerged und dedupliziert.
  Vorteil: Ein Agent findet evtl. was der andere übersieht.
"""

from .orchestrator import SDLCOrchestrator, Task, TaskStatus, FixLoopResult, FixLoopStats
from .feature_orchestrator import FeatureOrchestrator, FeatureResult, FeatureStatus, PhaseResult
from .parallel_validator import ParallelValidator, MergedResult
from .agents import (
    PlannerAgent, BuilderAgent, ReviewerAgent,
    UIReviewerAgent, TesterAgent, QAAgent, DebuggerAgent,
    Finding, ReviewStatus, TestStatus, QAStatus, DebugStatus
)

__all__ = [
    # Orchestrators
    "SDLCOrchestrator",
    "FeatureOrchestrator",
    # Parallel Validation
    "ParallelValidator",
    "MergedResult",
    # Task Types
    "Task",
    "TaskStatus",
    "FixLoopResult",
    "FixLoopStats",
    "FeatureResult",
    "FeatureStatus",
    "PhaseResult",
    # Agents
    "PlannerAgent",
    "BuilderAgent",
    "ReviewerAgent",
    "UIReviewerAgent",
    "TesterAgent",
    "QAAgent",
    "DebuggerAgent",
    # Types
    "Finding",
    "ReviewStatus",
    "TestStatus",
    "QAStatus",
    "DebugStatus",
]
