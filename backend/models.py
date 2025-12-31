"""
Pydantic Models für das Agent Control Panel.
"""

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum


# ==================== Agent Models ====================

class AgentStatus(str, Enum):
    """Agent Status."""
    IDLE = "idle"
    RUNNING = "running"
    STOPPED = "stopped"
    ERROR = "error"


class AgentStatsModel(BaseModel):
    """Agent statistics."""
    messages_sent: int = 0
    messages_received: int = 0
    tool_calls: int = 0
    errors: int = 0
    total_duration_ms: int = 0


class AgentInfo(BaseModel):
    """Agent information response."""
    id: str
    name: str
    status: AgentStatus
    parent_id: Optional[str] = None
    children_ids: List[str] = []
    created_at: str
    updated_at: str
    stats: AgentStatsModel
    system_prompt: Optional[str] = None
    allowed_tools: Optional[List[str]] = None
    error: Optional[str] = None


class AgentCreateRequest(BaseModel):
    """Request to create a new agent."""
    name: str
    prompt: str
    system_prompt: Optional[str] = None
    parent_id: Optional[str] = None
    allowed_tools: Optional[List[str]] = None
    repo_id: Optional[str] = None  # ID of connected repo to work in


class AgentResponse(BaseModel):
    """Response for single agent operations."""
    id: str
    name: str
    status: AgentStatus
    parent_id: Optional[str] = None
    children_ids: List[str] = []
    created_at: str
    updated_at: str
    stats: AgentStatsModel
    system_prompt: Optional[str] = None
    allowed_tools: Optional[List[str]] = None
    error: Optional[str] = None
    repo_id: Optional[str] = None
    repo_name: Optional[str] = None


class AgentTreeNode(BaseModel):
    """Agent tree node with nested children."""
    id: str
    name: str
    status: AgentStatus
    parent_id: Optional[str] = None
    children_ids: List[str] = []
    created_at: str
    updated_at: str
    stats: AgentStatsModel
    system_prompt: Optional[str] = None
    allowed_tools: Optional[List[str]] = None
    error: Optional[str] = None
    repo_id: Optional[str] = None
    repo_name: Optional[str] = None
    children: List["AgentTreeNode"] = []


class AgentTreeResponse(BaseModel):
    """Response containing agent hierarchy tree."""
    agents: List[AgentTreeNode]
    total_count: int
    running_count: int


class AgentMessageEvent(BaseModel):
    """WebSocket event for agent messages."""
    type: str  # agent_message, agent_status, agent_error
    agent_id: str
    event: str  # text, tool_call, tool_result, stats, error
    data: Any


# ==================== Chat Models ====================

class ChatRequest(BaseModel):
    """Request to send a chat message."""
    message: str
    repo_id: str
    session_id: Optional[str] = None  # Optional: existierende Session nutzen


class ChatResponse(BaseModel):
    """Response from chat endpoint."""
    status: str
    session_id: str


# ==================== Session Models ====================

class SessionStatus(str, Enum):
    """Session Status."""
    ACTIVE = "active"
    IDLE = "idle"
    ARCHIVED = "archived"


class ChatMessageResponse(BaseModel):
    """Eine Chat-Nachricht."""
    id: str
    role: str
    content: str
    timestamp: str
    agent_id: Optional[str] = None
    tool_calls: List[Dict[str, Any]] = []


class SessionResponse(BaseModel):
    """Eine Chat-Session."""
    id: str
    repo_id: str
    name: str
    status: SessionStatus
    messages: List[ChatMessageResponse] = []
    agent_id: Optional[str] = None
    created_at: str
    updated_at: str
    message_count: int = 0


class CreateSessionRequest(BaseModel):
    """Request zum Erstellen einer Session."""
    repo_id: str
    name: Optional[str] = None


class RenameSessionRequest(BaseModel):
    """Request zum Umbenennen einer Session."""
    name: str


class SessionListResponse(BaseModel):
    """Liste von Sessions."""
    sessions: List[SessionResponse]
    total_count: int
    active_count: int


# ==================== Repository Models ====================

class GitHubRepo(BaseModel):
    """GitHub Repository Info."""
    id: int
    name: str
    full_name: str
    url: str
    description: Optional[str] = None
    private: bool = False


class ConnectedRepo(BaseModel):
    """Lokal verbundenes Repository."""
    id: str
    github_id: int
    name: str
    full_name: str
    local_path: str
    status: str = "cloning"  # cloning, ready, error, linked
    error: Optional[str] = None
    is_linked: bool = False  # True wenn lokales Repo verlinkt, False wenn geclont


class ConnectRepoRequest(BaseModel):
    """Request zum Verbinden eines Repos."""
    full_name: str
    github_id: int
    local_path: Optional[str] = None  # Optional: existierendes lokales Repo verlinken


# ==================== Task Models ====================


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


# ==================== Scanner Models ====================


class ScannedIssueResponse(BaseModel):
    """Gescanntes GitHub Issue."""
    id: int
    number: int
    title: str
    body: Optional[str] = None
    state: str
    labels: List[str]
    url: str
    created_at: str
    assignee: Optional[str] = None
    milestone: Optional[str] = None


class ScannedTaskResponse(BaseModel):
    """Aus Dateien gescannter Task."""
    id: str
    title: str
    description: str
    source_file: str
    line_number: int
    status: str  # todo, in_progress, done
    priority: Optional[str] = None  # high, medium, low
    tags: List[str] = []


class ScanResultResponse(BaseModel):
    """Ergebnis eines Repo-Scans."""
    repo_id: str
    repo_name: str
    status: str  # idle, scanning, completed, error
    issues: List[ScannedIssueResponse]
    file_tasks: List[ScannedTaskResponse]
    scanned_at: Optional[str] = None
    error: Optional[str] = None
    total_count: int = 0
    todo_count: int = 0


class ImportTasksRequest(BaseModel):
    """Request zum Importieren von gescannten Items als Tasks."""
    repo_id: str
    issue_ids: List[int] = []
    task_ids: List[str] = []


class ScanProgressEvent(BaseModel):
    """WebSocket Event für Scan-Progress."""
    type: str = "scan_progress"
    repo_id: str
    status: str
    message: Optional[str] = None


# ==================== Planner Models ====================


class QuestionTypeEnum(str, Enum):
    """Frage-Typ für den Autonomous Planner."""
    CHOICE = "choice"
    TEXT = "text"
    CONFIRM = "confirm"
    MULTI = "multi"


class QuestionModel(BaseModel):
    """Eine Frage an den User."""
    id: str
    text: str
    type: QuestionTypeEnum
    options: List[str] = []
    required: bool = True
    answer: Optional[str] = None
    default: Optional[str] = None
    context: Optional[str] = None


class CodeSpecModel(BaseModel):
    """Code-Level Specification für eine Änderung."""
    file_path: str
    action: str
    description: str
    dependencies: List[str] = []
    estimated_lines: int = 0
    priority: int = 0


class PlanSectionModel(BaseModel):
    """Ein Abschnitt des Plans."""
    id: str
    name: str
    specs: List[CodeSpecModel]
    parallel: bool = False
    requires_sections: List[str] = []


class TaskPlanResponse(BaseModel):
    """Response für einen TaskPlan."""
    task_id: str
    title: str
    description: str
    phase: str
    sections: List[PlanSectionModel]
    questions: List[QuestionModel]
    answers: Dict[str, Any]
    analysis_summary: str = ""
    created_at: str
    updated_at: str
    error: Optional[str] = None
    total_files: int = 0
    estimated_complexity: str = "low"


class SubmitAnswersRequest(BaseModel):
    """Request zum Submitten von Antworten."""
    answers: Dict[str, str]


class ExecutionStepModel(BaseModel):
    """Ein Schritt im Execution Plan."""
    id: str
    name: str
    agent_type: str
    prompt: str = ""
    status: str
    input_data: Dict[str, Any] = {}
    output_data: Dict[str, Any] = {}
    error: Optional[str] = None
    attempts: int = 0
    max_attempts: int = 3
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    duration_ms: int = 0


class ExecutionProgressResponse(BaseModel):
    """Response für Execution Progress."""
    task_id: str
    current_step: int
    total_steps: int
    status: str
    progress_percent: int = 0
    steps: List[ExecutionStepModel]


class FileLockModel(BaseModel):
    """Ein File Lock."""
    file_path: str
    agent_id: str
    locked_at: str


class FileLockStatusResponse(BaseModel):
    """Status aller File Locks."""
    lock_count: int
    locks: List[FileLockModel]


class PlannerPhaseChangeEvent(BaseModel):
    """WebSocket Event für Planner Phase Change."""
    type: str = "planner_phase_change"
    task_id: str
    phase: str


class PlannerProgressEvent(BaseModel):
    """WebSocket Event für Planner Progress."""
    type: str = "planner_progress"
    task_id: str
    message: str
    data: Dict[str, Any] = {}


class PlannerQuestionEvent(BaseModel):
    """WebSocket Event für Planner Questions."""
    type: str = "planner_question"
    task_id: str
    questions: List[QuestionModel]
