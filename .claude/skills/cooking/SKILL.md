---
name: cooking
description: |
  Autonome App-Entwicklung über mehrere Features hinweg.
  Triggers: "/cook", "bau mir eine app", "erstelle komplette app",
  "24h autonom", "ohne unterbrechung bauen"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, TodoWrite, AskUserQuestion, mcp__playwright__*, mcp__supabase__*
model: claude-opus-4-5-20251101
version: 1.0.0
---

# Cooking Skill - Autonome App-Entwicklung

## Kernprinzip

```
Hauptkontext = Koordination (schlank!)
Background Tasks = Implementation (eigener Context)
```

---

## Phase 1: Discovery

### 1.1 Feature-Extraktion

Aus User-Input extrahieren:

| Priorität | Features |
|-----------|----------|
| **Must-Have** | Core-Funktionalität |
| **Should-Have** | UX-Verbesserungen |
| **Could-Have** | Nice-to-Have |

### 1.2 Fragen-Checkliste (ALLE jetzt stellen!)

```markdown
## Auth
- [ ] Magic Link / Email+Password / Social?

## Datenmodell
- [ ] Welche Entitäten?
- [ ] Multi-Tenancy?

## UI/UX
- [ ] Dark Mode?
- [ ] Mobile-First?

## Integrationen
- [ ] Externe APIs?
- [ ] File-Uploads?

## Scope
- [ ] MVP oder Feature-Complete?
```

**Nach Discovery: KEINE Fragen mehr!**

### 1.3 User-Approval

```
📋 Features: [Anzahl]
🔄 Ablauf: Feature 1 → 2 → 3 → ... → Done

Bereit? [Start Cooking] [Fragen ergänzen]
```

---

## Phase 2: Cooking Loop

### TodoWrite für Status-Tracking

```
TodoWrite([
  {"content": "Auth System", "status": "pending", "activeForm": "Building Auth System"},
  {"content": "Dashboard", "status": "pending", "activeForm": "Building Dashboard"},
  {"content": "Settings", "status": "pending", "activeForm": "Building Settings"}
])
```

### Feature-Loop (KEIN User-Input!)

```python
for feature in features:
    # 1. Status: in_progress
    TodoWrite([...update feature to in_progress...])

    # 2. Feature als Task (BLOCKING - warte auf Result)
    result = Task(
        subagent_type="general-purpose",
        run_in_background=False,  # Warte auf Completion
        prompt=f"""
        Implementiere: {feature.name}

        Kontext:
        - App: {app_name}
        - Bereits fertig: {completed}

        Führe VOLLSTÄNDIGEN Orchestration-Workflow aus:
        @.claude/skills/orchestration/SKILL.md

        Output am Ende (PFLICHT):
        ```json
        {{
          "status": "PASS" | "PARTIAL" | "FAIL",
          "files": ["path/file1.ts", "path/file2.tsx"],
          "notes": "Optional: Was nicht geklappt hat"
        }}
        ```
        """
    )

    # 3. Result verarbeiten
    if result.status == "PASS":
        TodoWrite([...mark completed...])
    elif result.status == "FAIL":
        # 1 Retry
        retry = Task(subagent_type="general-purpose", prompt=f"Fix: {result.notes}")
        if retry.status != "PASS":
            # Als PARTIAL markieren, WEITER zum nächsten Feature
            TodoWrite([...mark as partial...])

    # 4. SOFORT nächstes Feature (KEIN Stopp!)
```

### Parallele Features (Optional)

Wenn Features KEINE gemeinsamen Dateien ändern:

```python
# Starte parallel
task_1 = Task(subagent_type="general-purpose", run_in_background=True, prompt="Feature 1...")
task_2 = Task(subagent_type="general-purpose", run_in_background=True, prompt="Feature 2...")

# Sammle Results
result_1 = TaskOutput(task_1.id, block=True)
result_2 = TaskOutput(task_2.id, block=True)
```

**Max 3 parallele Tasks** (Context-Impact begrenzen)

---

## Phase 3: Serving (Final Report)

```markdown
# 🍳 COOK COMPLETE

## Summary
- **App:** [Name]
- **Features:** [X/Y completed]

## Status

| Feature | Status | Files |
|---------|--------|-------|
| Auth | ✅ | 5 |
| Dashboard | ✅ | 8 |
| Settings | ⚠️ PARTIAL | 4 |

## Issues (falls vorhanden)

### Settings
- Problem: Test flaky
- Fix needed: Update selector

## Quick Start

```bash
npm run dev
```
```

---

## Kritische Regeln

### DO
- ✅ ALLE Fragen in Phase 1
- ✅ TodoWrite für Status-Tracking
- ✅ `subagent_type="general-purpose"` (einziger erlaubter Type!)
- ✅ Bei FAIL: 1 Retry, dann PARTIAL, weiter
- ✅ Orchestration-Workflow pro Feature

### DON'T
- ❌ User fragen während Cooking
- ❌ Bei FAIL komplett stoppen
- ❌ `subagent_type="backend-agent"` (existiert nicht!)
- ❌ Subagent spawnt Subagent (unmöglich!)
- ❌ Mehr als 3 parallele Tasks

---

## Context-Effizienz

```
Hauptkontext:
  ✅ Auth - DONE (5 files)
  🔄 Dashboard - IN PROGRESS
  ⏳ Settings - PENDING

  (NUR Status - keine Code-Details!)

Task-Context (isoliert):
  - Voller Orchestration-Workflow
  - Code-Änderungen
  - Tests
  - Wird nach Task gelöscht
```
