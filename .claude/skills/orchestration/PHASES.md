# Orchestration Phases - Detailed Reference

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
3. UI Review → Code-Pattern Check → Auto-Fix Loop
3.5. Design Review → Visual/UX Check → Auto-Fix Loop
4. Tests → Auto-Fix Loop
5. Final QA
```

**User-Approval holen bevor Implementierung!**

---

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

---

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

---

## Phase 3: UI Review + Auto-Fix

### Schritt 1: UI Review Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der UI Review Agent.

    ## Aufgabe
    1. Navigiere zu http://localhost:5173/[route] (headless: true)
    2. Mache Screenshot mit Playwright MCP:
       - mcp__playwright__playwright_navigate
       - mcp__playwright__playwright_screenshot (downloadsDir: ".screenshots", savePng: true)
    3. Analysiere den Screenshot
    4. Prüfe Code-Patterns

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

### Schritt 2: Bei FAIL → Auto-Fix

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der UI Fix Agent.
    ## Issues zu fixen: [aus Review]
    Fixe JEDEN Issue mit Edit-Tool.
```

### Schritt 3: Re-Review Agent spawnen → Loop (max 3x)

---

## Phase 3.5: Design Review + Auto-Fix

### Schritt 1: Design Review Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Design Review Agent.

    ## Aufgabe
    1. Navigiere zu http://localhost:5173/[route] (headless: true)
    2. Mache Screenshot mit Playwright MCP:
       - mcp__playwright__playwright_navigate
       - mcp__playwright__playwright_screenshot (downloadsDir: ".screenshots", savePng: true)
    3. Analysiere den Screenshot visuell

    ## Prüfe VISUELL
    - Text-Vollständigkeit (Truncation? Abgeschnitten?)
    - Card-Höhen konsistent in Grid-Reihen?
    - Footer-Elemente (Bewerbungen, Buttons) auf gleicher Höhe?
    - Layout-Alignment korrekt?
    - Responsive Breakpoints sinnvoll?

    ## Code-Checks
    - line-clamp zu aggressiv?
    - flex-col + mt-auto für Footer-Alignment?
    - auto-rows-fr für Grid-Konsistenz?

    ## Output Format
    ### Status: ✅ PASS | ❌ FAIL
    ### Visual Issues (wenn FAIL):
    - problem: [was ist visuell falsch]
    - file: [path]
    - line: [number]
    - fix: [CSS/Tailwind Lösung]
```

### Schritt 2: Bei FAIL → Auto-Fix

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Design Fix Agent.
    ## Visual Issues zu fixen: [aus Review]
    Fixe JEDEN Issue mit Edit-Tool.
    Typische Fixes:
    - line-clamp entfernen
    - flex flex-col + mt-auto für Footer
    - auto-rows-fr auf Grid
```

### Schritt 3: Re-Review Agent spawnen → Loop (max 3x)

---

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

---

## Phase 5: Final QA mit User Journey Testing

**⚠️ KRITISCH: Nicht nur Initial-State testen!**

### Schritt 1: QA Agent spawnen (User Journey Testing)

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der QA Agent.

    ## Aufgabe
    Führe User Journey Testing für [FEATURE] durch.

    ## User Journey
    Feature: [NAME]
    Route: http://localhost:5173/[ROUTE]

    ## Schritt-für-Schritt mit Playwright MCP

    1. **Navigate + Screenshot:**
       - mcp__playwright__playwright_navigate (url, headless: true)
       - mcp__playwright__playwright_screenshot (name: "qa-step-1", downloadsDir: ".screenshots", savePng: true)

    2. **Interaktion + Screenshot:**
       - mcp__playwright__playwright_click (selector)
       - mcp__playwright__playwright_screenshot (name: "qa-step-2-after-click")

    3. **Console Logs prüfen:**
       - mcp__playwright__playwright_console_logs (type: "error")

    4. **Mobile Viewport testen:**
       - mcp__playwright__playwright_resize (device: "iPhone SE")
       - Gleiche Journey nochmal durchspielen
       - mcp__playwright__playwright_screenshot (name: "qa-mobile")

    ## Für JEDEN Screenshot prüfen
    - Text-Overflow? (Text über Container-Rand)
    - Buttons abgeschnitten?
    - Layout broken?
    - Console Errors?
    - Keine "undefined" oder "null" sichtbar?

    ## Output Format
    ### User Journey Tested:
    1. ✅ Navigate - OK
    2. ❌ Click Popup - TEXT OVERFLOW!

    ### Visual Issues:
    - Screenshot: qa-step-2-after-click.png
    - Problem: [Beschreibung]
    - Fix: [Lösung]

    ### Console Errors: [ja/nein + Details]
    ### Mobile Check: [PASS/FAIL]
    ### Status: ✅ PASS | ❌ FAIL
    ### fix_required: true/false
```

### Schritt 2: Bei FAIL → Fix → Re-Test Journey

Bei Problemen spawne Fix-Agent, dann QA-Agent erneut (macht neue Screenshots).

Bei Problemen → Zurück zur zuständigen Phase.

---

## Phase 6: Feedback sammeln

**WICHTIG: Diese Phase läuft IMMER am Ende!**

### Warum Feedback?

- Explizites statt implizites Learning
- Strukturierte Daten für `/improve-agents`
- Identifiziert welcher Agent Probleme verursachte

### Feedback Agent spawnen

```
Task:
  subagent_type: "general-purpose"
  prompt: |
    Du bist der Feedback Agent.

    ## Kontext
    Feature: [NAME]
    Status: [SUCCESS/PARTIAL/FAILED]
    Agents: backend, frontend, ui-review, tests, qa
    Fix-Loops: Phase 3: 2, Phase 4: 1

    ## Aufgabe
    1. Frage User nach Zufriedenheit (1-5)
    2. Frage ob manuelle Fixes nötig waren
    3. Wenn ja: Was musste korrigiert werden?
    4. Logge in .claude/learnings/sessions.jsonl
    5. Bei Issues: Logge in corrections.jsonl
```

### Feedback Format

```json
{
  "ts": "2025-12-26T...",
  "type": "orchestration_feedback",
  "feature": "Tasks System",
  "rating": 4,
  "manual_fixes_needed": true,
  "issues": ["autoSave prop fehlte"],
  "agents_used": ["backend-agent", "frontend-agent"],
  "fix_loops": {"ui-review": 2}
}
```

### Output

```markdown
## FEEDBACK COLLECTED

### Rating: ⭐⭐⭐⭐ (4/5)
### Manual Fixes: Ja (1 Issue)
### Logged: .claude/learnings/sessions.jsonl

Tipp: `/improve-agents` zeigt Verbesserungsvorschläge.
```
