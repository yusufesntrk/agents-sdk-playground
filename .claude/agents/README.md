# Claude Code Agents für ShortSelect ATS

**Architektur:** Claude (Hauptagent) orchestriert Worker-Agents via `general-purpose` Subagenten.

---

## Wichtige Architektur-Regeln

### 1. Claude = Orchestrator

Der Hauptagent (Claude) koordiniert ALLES. Kein separater "Orchestrator-Agent".

### 2. Nur `general-purpose` als subagent_type

```
Task:
  subagent_type: "general-purpose"  ← NUR DAS ERLAUBT!
  prompt: |
    Du bist der Frontend Agent...
```

**NICHT erlaubt:**
- `subagent_type: "backend-agent"` ❌
- `subagent_type: "frontend-agent"` ❌

### 3. Subagenten spawnen NICHTS

Subagenten können KEINE anderen Subagenten spawnen. Das ist eine fundamentale Einschränkung von Claude Code.

### 4. Agents = Prompt-Templates

Die SKILL.md Dateien hier sind **Instruktionen/Templates**, die der Hauptagent verwendet, um Prompts für `general-purpose` Subagenten zu formulieren.

---

## Verfügbare Worker-Agents

| Agent | Beschreibung |
|-------|--------------|
| **backend-agent** | DB-Design, Migrations, RLS, Hooks |
| **frontend-agent** | React Components, Pages, Forms |
| **ui-review-agent** | Pattern Validation, Screenshot-Analyse |
| **test-agent** | E2E Tests, Test Execution |
| **qa-agent** | Live Browser Validation, Runtime Errors |
| **debug-agent** | Browser Debugging, Root Cause Analysis |

---

## Orchestration

Die Orchestration-Logik ist in einem **Skill** (nicht Agent):

```
.claude/skills/orchestration/SKILL.md
```

Dieser Skill beschreibt, wie Claude die Agent-Chain koordiniert.

---

## Workflow

```
User: "/orchestrate Tasks Feature"
│
└─► Claude (Hauptagent):
    │
    ├── 1. Task(general-purpose) mit Backend-Prompt
    │   └── Subagent erstellt Migration + Hook
    │
    ├── 2. Task(general-purpose) mit Frontend-Prompt
    │   └── Subagent erstellt Component
    │
    ├── 3. Claude macht Screenshot (Playwright MCP)
    │
    ├── 4. Task(general-purpose) mit UI-Review-Prompt
    │   └── Subagent analysiert Screenshot + Code
    │
    ├── 5. Bei Issues: Fix-Loop
    │
    └── 6. Task(general-purpose) mit Test-Prompt
        └── Subagent erstellt + führt Tests aus
```

---

## Verzeichnisstruktur

```
.claude/
├── agents/                    # Worker-Agent Prompt-Templates
│   ├── backend-agent/
│   │   └── SKILL.md
│   ├── frontend-agent/
│   │   └── SKILL.md
│   ├── ui-review-agent/
│   │   └── SKILL.md
│   ├── test-agent/
│   │   └── SKILL.md
│   ├── qa-agent/
│   │   └── SKILL.md
│   ├── debug-agent/
│   │   └── SKILL.md
│   └── README.md              # Diese Datei
│
├── skills/
│   └── orchestration/
│       └── SKILL.md           # Orchestration-Anleitung für Claude
│
└── commands/
    └── orchestrate.md         # /orchestrate Command
```

---

## Warum diese Architektur?

Die vorherige Architektur versuchte, Subagenten andere Subagenten spawnen zu lassen - das funktioniert nicht in Claude Code.

**Vorher (funktionierte nicht):**
```
Orchestrator-Agent (Subagent)
  └── spawnt Backend-Agent (Subagent)  ❌ NICHT MÖGLICH
```

**Jetzt (funktioniert):**
```
Claude (Hauptagent)
  ├── spawnt Backend-Worker (general-purpose)  ✅
  ├── spawnt Frontend-Worker (general-purpose)  ✅
  └── spawnt Review-Worker (general-purpose)  ✅
```

---

**Version:** 2.0.0 (Architektur-Umbau)
**Letzte Aktualisierung:** 2025-12-24
