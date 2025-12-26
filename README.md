# Custom Agents mit Claude Code SDK

Dieses Projekt demonstriert die Erstellung von Custom Agents mit dem Claude Code SDK.

## Agents

### 1. Pong Agent
Einfacher Agent, der die Macht des System Prompts demonstriert. Antwortet immer mit "pong".

```bash
uv run python -m agents.pong.agent
uv run python -m agents.pong.agent "Was auch immer du fragst..."
```

### 2. Echo Agent
Agent mit Custom Tool und In-Memory MCP Server. Kann Text transformieren (reverse, uppercase, repeat).

```bash
uv run python -m agents.echo.agent
uv run python -m agents.echo.agent --follow-up
```

### 3. Micro SDLC System
Multi-Agent Orchestration System mit Web-UI:
- **Planner Agent** - Erstellt Specs aus Tasks
- **Builder Agent** - Implementiert Code
- **Reviewer Agent** - Prüft Code-Qualität

```bash
uv run python -m backend.main
```

Dann http://localhost:8000 öffnen.

## Setup

```bash
# Dependencies installieren
uv sync

# API Key setzen
export ANTHROPIC_API_KEY=your-key
```

## Projektstruktur

```
agents-sdk-playground/
├── agents/
│   ├── pong/          # Pong Agent
│   ├── echo/          # Echo Agent mit Custom Tools
│   └── sdlc/          # Multi-Agent SDLC System
├── backend/           # FastAPI + WebSocket
└── frontend/          # Kanban Board UI
```
