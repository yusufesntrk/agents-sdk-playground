# Features - Agent Control Panel

## Vision

Ein zentrales Dashboard zur Verwaltung autonomer AI-Agenten, die in verschiedenen GitHub-Repos arbeiten, sich untereinander austauschen und Tasks vollautomatisch abarbeiten.

---

## Phase 1 - Foundation ✅

### 1.1 GitHub OAuth Integration ✅
- [x] OAuth App Setup (GitHub Developer Settings)
- [x] Login Flow implementieren (`/auth/login`, `/auth/callback`)
- [x] Token Storage (In-Memory mit Session)
- [x] Repo-Liste abrufen (via PyGithub)

**Implementiert in:**
- `backend/auth.py` - OAuth Handler mit Authlib

### 1.2 Repo Management ✅
- [x] Repos verbinden (aus Liste auswählen)
- [x] Lokales Clonen (in `~/.agent-panel/repos/`)
- [x] Pull Operationen
- [ ] Push Operationen (vorbereitet, nicht im UI)
- [ ] Branch-Handling (main direkt)

**Implementiert in:**
- `backend/repos.py` - RepoManager mit Clone/Pull/Push

### 1.3 Basic Dashboard UI ✅
- [x] Sidebar mit Repo-Liste
- [x] Connect Button + Modal
- [x] Login/Logout mit User Avatar
- [x] GitHub Dark Theme

**Implementiert in:**
- `frontend/index.html` - Sidebar + Modal
- `frontend/app.js` - AgentControlPanel Klasse
- `frontend/style.css` - Vollständiges Styling

---

## Phase 2 - Agent System ✅

### 2.1 Agent Control Panel ✅
- [x] Agent-Baum Visualisierung (Master → Sub → Sub-Sub)
- [x] Live-Logs pro Agent (WebSocket Stream)
- [x] Agent Start/Stop Controls
- [x] Resource-Monitoring (API Calls)

**Implementiert in:**
- `backend/agents/registry.py` - AgentRegistry mit Hierarchie-Support
- `backend/agents/spawner.py` - AgentSpawner via claude_code_sdk
- `backend/agents/broker.py` - MessageBroker für Peer-to-Peer
- `frontend/app.js` - Agent-Tree, Live-Logs, Controls
- `frontend/style.css` - Agent UI Styling

**Features:**
- Hierarchie: Unbegrenzt tief (Agent → Sub-Agent → Sub-Sub-Agent → ...)
- Kommunikation: Peer-to-Peer (Agenten können sich direkt ansprechen)
- Persistenz: In-Memory (kein Restart-Recovery nötig)
- UI: Collapsible Tree, Tabs für Logs, Start/Stop/Delete Buttons

### 2.2 Task Scanner
- [ ] GitHub Issues importieren
- [ ] Repo-Dateien scannen (TASKS.md, TODO, FEATURES.md)
- [ ] Dashboard Task-Queue
- [ ] Auto-Start bei neuen Tasks

### 2.3 Autonomous Planner Agent ⏳
- [ ] Question Phase (alle Fragen am Anfang sammeln)
- [ ] Code-Level Planning (Dateien/Funktionen identifizieren)
- [ ] Parallelisierung planen + optimieren
- [ ] Execution Loop mit Agent-Kette
- [ ] Auto-Fix Loop (unbegrenzt bei Failures)

**Geplante Architektur:**
- **AutonomousPlanner**: Hauptagent, erstellt Code-Level Specs
- **QuestionCollector**: Sammelt alle Fragen VOR dem Start
- **ExecutionEngine**: Führt Plan aus, koordiniert Agenten
- **FileLockManager**: Verhindert parallele Edits derselben Datei

**Agent-Kette pro Feature-Abschnitt:**
```
Builder(s) → Test-Agent → Debug-Agent → UI-Review → Design-Review
     ↑                                                      │
     └──────────────── Auto-Fix Loop ───────────────────────┘
```

**Erweiterte Agenten-Typen:**
- Builder: Code schreiben
- Test-Agent: E2E + API Tests, Console prüfen
- Debug-Agent: Fehler analysieren und fixen
- UI-Review: Visuelle Prüfung, Playwright Screenshots
- Design-Review: Style-Guide Compliance

**Geklärte Anforderungen:**
- Fragen: Am Anfang alle sammeln, dann voll autonom
- Testing: Kontinuierlich nach jedem Abschnitt (nicht erst am Ende)
- Console: Muss bei jedem Test geprüft werden
- Plan-Detail: Code-Level (Datei/Funktion spezifiziert)
- Parallelisierung: Geplant + Agent kann optimieren
- Konflikte: File-Level Locking
- Approval: Nicht nötig, voll autonom

---

## Phase 3 - Advanced Features

### 3.1 Multi-Repo Parallel
- [ ] Mehrere Repos gleichzeitig aktiv
- [ ] Cross-Repo Kommunikation (optional)
- [ ] Shared Agents (wiederverwendbar)

### 3.2 Full Monitoring Dashboard
- [ ] Agent-Baum + Live-Logs
- [ ] Repo-Status (Branch, Commits, Diffs)
- [ ] Resource-Monitoring (Token Usage, Kosten)
- [ ] Task-Board (Kanban)

---

## Technologie-Stack

| Komponente | Technologie | Status |
|------------|-------------|--------|
| Backend | FastAPI + Python | ✅ |
| Agent SDK | claude-code-sdk | ✅ |
| Frontend | Vanilla JS | ✅ |
| Auth | GitHub OAuth (Authlib) | ✅ |
| GitHub API | PyGithub | ✅ |
| Real-time | WebSocket | ✅ |
| Storage | In-Memory | ✅ |
| Deployment | Lokal (Mac) | ✅ |
