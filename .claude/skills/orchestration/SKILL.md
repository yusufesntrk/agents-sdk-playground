---
name: orchestration
description: Feature-Entwicklung mit Connected Agent Chain orchestrieren. Verwende diesen Skill wenn mehrere Agents koordiniert werden muessen (Backend, Frontend, UI Review, Tests, QA). Triggerwoerter: orchestrate, implementiere Feature, baue Feature, entwickle Feature, Agent-Chain, Multi-Step Implementation.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, mcp__playwright__*, mcp__supabase__*
version: 1.0.0
---

# Feature Orchestration

Du bist der Hauptagent (Claude). **DU orchestrierst** - kein Subagent.

## Kernprinzip: Connected Agent Chain

```
NIEMALS:  Review → Report → STOPP ❌
IMMER:    Review → FAIL? → Fix → Re-Review → Loop bis PASS ✅
```

**Agents sind KEINE isolierten Tools!** Sie sind eine verbundene Kette mit Fix-Loops.

## Agent-Chain Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                 DU (Claude = Orchestrator)                  │
│                                                             │
│  Phase 0: Vorbereitung                                      │
│    → Dev-Server prüfen, Plan erstellen, User-Approval      │
│                                                             │
│  Phase 1: Backend (wenn nötig)                              │
│    → Task(general-purpose) → Backend-Arbeit                │
│    → FAIL? → Fix-Loop (max 3x)                             │
│                                                             │
│  Phase 2: Frontend                                          │
│    → Task(general-purpose) → Frontend-Arbeit               │
│    → FAIL? → Fix-Loop (max 3x)                             │
│                                                             │
│  Phase 3: UI Review + Auto-Fix                              │
│    → DU machst Screenshot (Playwright MCP)                 │
│    → Task(general-purpose) → UI Review                     │
│    → FAIL? → Fix → Re-Screenshot → Re-Review (max 3x)      │
│                                                             │
│  Phase 4: Tests + Auto-Fix                                  │
│    → Task(general-purpose) → Tests erstellen + ausführen   │
│    → FAIL? → Fix → Re-Run (max 3x)                         │
│                                                             │
│  Phase 5: Final QA                                          │
│    → DU machst Screenshot + Console Logs                   │
│    → Probleme? → Zurück zur zuständigen Phase              │
└─────────────────────────────────────────────────────────────┘
```

## Kritische Regeln

1. **NUR `general-purpose`** als subagent_type - keine custom Agent-Namen!
2. **DU machst Screenshots** mit Playwright MCP - nicht Subagenten
3. **Fix-Loops sind PFLICHT** - max 3 Versuche pro Phase
4. **Warte auf Results** bevor nächste Phase startet
5. **Subagenten spawnen NICHTS** - nur du koordinierst

## Phase 0: Vorbereitung

### Dev-Server prüfen
```bash
lsof -i :5173 | grep LISTEN
```
Falls nicht läuft: `npm run dev` im Hintergrund starten.

### Plan erstellen
```markdown
## PLAN: [Feature Name]

### Scope
- [ ] Backend: [ja/nein] - [was]
- [ ] Frontend: [ja/nein] - [was]
- [ ] Tests: [ja/nein]

### Agent-Chain
1. Backend Agent → [spezifische Aufgabe]
2. Frontend Agent → [spezifische Aufgabe]
3. UI Review → Auto-Fix Loop
4. Tests → Auto-Fix Loop
5. Final QA
```

### User-Approval holen bevor Implementierung!

## Phase 1: Backend

### Backend Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Backend Agent.

    ## Aufgabe
    Erstelle Datenbank-Infrastruktur für: [FEATURE]

    ## Was erstellen
    - Migration in supabase/migrations/
    - RLS Policies (tenant_id Isolation!)
    - Hook in src/hooks/use[Feature].ts

    ## Regeln
    - IMMER tenant_id Column
    - IMMER RLS aktivieren
    - IMMER ?? [] Fallback in Hooks

    ## Output Format
    ### Status: ✅ SUCCESS | ❌ FAIL
    ### Erstellte Dateien: [liste]
    ### Probleme: [falls vorhanden]
```

### Bei FAIL → Fix-Loop
```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Backend Fix Agent.
    ## Problem: [aus vorherigem Result]
    ## Aufgabe: Fixe das Problem.
```

## Phase 2: Frontend

### Frontend Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Frontend Agent.

    ## Aufgabe
    Erstelle React-Komponenten für: [FEATURE]

    ## Was erstellen
    - Component(s) in src/components/[feature]/
    - Integration in bestehende Page ODER neue Page

    ## Regeln
    - TypeScript Props typisieren
    - shadcn/ui Komponenten verwenden
    - Tailwind CSS (keine Inline-Styles)
    - Hook von Phase 1 verwenden

    ## Output Format
    ### Status: ✅ SUCCESS | ❌ FAIL
    ### Erstellte Dateien: [liste]
    ### Probleme: [falls vorhanden]
```

## Phase 3: UI Review + Auto-Fix

### Schritt 1: DU machst Screenshot

```
mcp__playwright__playwright_navigate:
  url: "http://localhost:5173/[route]"
  headless: true

mcp__playwright__playwright_screenshot:
  name: "ui-review-[feature]"
  fullPage: true
  savePng: true
  downloadsDir: ".screenshots"
```

### Schritt 2: UI Review Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der UI Review Agent.

    ## Screenshot
    Analysiere: .screenshots/ui-review-[feature].png

    ## Prüfe
    - Text-Vollständigkeit (nichts abgeschnitten?)
    - Layout & Alignment
    - Spacing-Konsistenz
    - Keine hover:scale-* bei Cards
    - Korrekte Icon-Größen (h-4 w-4)

    ## Output Format
    ### Status: ✅ PASS | ❌ FAIL
    ### Issues (wenn FAIL):
    - file: [path]
    - line: [number]
    - problem: [beschreibung]
    - fix: [lösung]
```

### Schritt 3: Bei FAIL → Auto-Fix

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der UI Fix Agent.
    ## Issues zu fixen: [aus Review]
    Fixe JEDEN Issue mit Edit-Tool.
```

### Schritt 4: Re-Screenshot → Re-Review → Loop (max 3x)

## Phase 4: Tests + Auto-Fix

### Test Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Test Agent.

    ## Aufgabe
    Erstelle E2E Test für: [FEATURE]
    Datei: tests/[feature].spec.ts

    ## Was testen
    - Feature ist sichtbar
    - CRUD Operationen
    - Error States

    ## Nach Erstellung
    Ausführen: npx playwright test tests/[feature].spec.ts --reporter=list

    ## Output Format
    ### Status: ✅ PASS | ❌ FAIL
    ### Tests: [liste mit status]
    ### Failures: [details wenn vorhanden]
```

### Bei Test-Failures → Auto-Fix → Re-Run (max 3x)

## Phase 5: Final QA

**DU machst:**

1. Final Screenshot
2. Console Logs prüfen: `mcp__playwright__playwright_console_logs: type="error"`
3. Ergebnis analysieren

Bei Problemen → Zurück zur zuständigen Phase.

## Output Format (Final)

```markdown
## ORCHESTRATION COMPLETE

### Feature: [Name]
### Status: ✅ SUCCESS | ⚠️ PARTIAL | ❌ FAILED

### Erstellte Dateien:
- supabase/migrations/[date]_[feature].sql
- src/hooks/use[Feature].ts
- src/components/[feature]/[Component].tsx
- tests/[feature].spec.ts

### Agent-Chain:
1. ✅ Backend - Migration + Hook erstellt
2. ✅ Frontend - Component erstellt
3. ✅ UI Review - PASS (X Issues gefixt)
4. ✅ Tests - X/X passed
5. ✅ QA - PASS

### Fix-Loops:
- Phase 3: X Loop(s)
- Phase 4: X Loop(s)
```

## Multi-Feature Modus

Bei 2+ unabhängigen Features parallel mit `run_in_background: true`:

```
Task 1 (run_in_background: true):
  subagent_type: "general-purpose"
  prompt: "Implementiere Feature A komplett..."

Task 2 (run_in_background: true):
  subagent_type: "general-purpose"
  prompt: "Implementiere Feature B komplett..."

TaskOutput(task_id_1)
TaskOutput(task_id_2)
```

**Nur parallel wenn Features KEINE gemeinsamen Dateien ändern!**

## NIEMALS

- ❌ Review machen und bei FAIL stoppen ohne Fix
- ❌ `subagent_type: "backend-agent"` (existiert nicht!)
- ❌ Subagent spawnen der andere Subagenten spawnt
- ❌ Tests überspringen
- ❌ "PASS" ohne Re-Validierung nach Fix

## IMMER

- ✅ Bei FAIL → Auto-Fix → Re-Validate → Loop
- ✅ Max 3 Loops pro Phase
- ✅ Screenshots SELBST machen (Playwright MCP)
- ✅ Auf Subagent-Results warten
- ✅ Klares Output-Format
