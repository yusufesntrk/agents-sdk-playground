# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a playground for building custom AI agents using the Claude Code SDK (`claude-code-sdk`). It demonstrates three patterns:
1. **Single-agent with system prompt override** (Pong)
2. **Single-agent with custom model** (Echo)
3. **Multi-agent orchestration** (SDLC)

## Commands

```bash
# Install dependencies
uv sync

# Run individual agents
uv run python -m agents.pong.agent "any message"    # Always responds "pong"
uv run python -m agents.echo.agent "text to echo"   # Text transformations

# Start SDLC web UI (FastAPI + WebSocket)
uv run python -m backend.main
# Then open http://localhost:8000
```

## Architecture

### Agent Pattern

All agents follow this structure:
```
agents/<name>/
├── agent.py           # Entry point with query() loop
├── prompts/system.md  # System prompt loaded at runtime
└── tools.py           # Optional: custom tool definitions
```

Agents use `claude_code_sdk.query()` which yields messages asynchronously. Key options:
- `system_prompt`: Override default behavior (loaded from prompts/system.md)
- `allowed_tools`: Restrict available tools (e.g., `["Read", "Glob"]`)
- `model`: Override model (e.g., `claude-haiku-4-5-20251001`)
- `cwd`: Working directory for file operations

### SDLC Multi-Agent System

The SDLC system demonstrates agent orchestration with three specialized agents:

```
agents/sdlc/
├── orchestrator.py           # Coordinates the pipeline
├── agents/
│   ├── planner.py           # Read-only: creates specs
│   ├── builder.py           # Read+Write: implements code
│   └── reviewer.py          # Read-only: reviews changes
└── prompts/
    ├── planner.md
    ├── builder.md
    └── reviewer.md
```

**Workflow**: Task → Planner (spec) → Builder (implement) → Reviewer (approve/reject) → Ship/Failed

**Tool restrictions by role**:
- Planner: `Read, Glob, Grep` (exploration only)
- Builder: `Read, Write, Edit, Bash` (full access)
- Reviewer: `Read, Grep, Bash` (read-only verification)

### Backend (FastAPI)

The backend (`backend/main.py`) provides:
- REST API for task CRUD (`/api/tasks`)
- WebSocket at `/ws` for real-time streaming of agent events
- Static file serving for the Kanban-style frontend

### Frontend

Vanilla JS Kanban board in `frontend/` that connects via WebSocket to display:
- Task cards moving through stages (TODO → Planning → Building → Reviewing → Shipped)
- Real-time agent output streaming

## Environment

**Authentication (choose one):**

1. **Claude Max/Pro (recommended):** Run `claude login` - SDK uses your subscription automatically
2. **Long-lived token:** Run `claude setup-token`, then `export CLAUDE_CODE_OAUTH_TOKEN="token"`
3. **API Key:** `export ANTHROPIC_API_KEY="sk-..."`

**Important:** If `ANTHROPIC_API_KEY` is set, it takes priority over your Max subscription. Use `unset ANTHROPIC_API_KEY` to use your subscription instead.

**Optional:** `CLAUDE_MODEL` to override default model.
