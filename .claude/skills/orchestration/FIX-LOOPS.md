# Fix-Loop Logic - Reference

## Kernprinzip

```
NIEMALS:  Review → Report → STOPP ❌
IMMER:    Review → FAIL? → Fix → Re-Review → Loop bis PASS ✅
```

**Agents sind KEINE isolierten Tools!** Sie sind eine verbundene Kette mit Fix-Loops.

---

## Fix-Loop Algorithmus

```python
def run_phase_with_fix_loop(phase_name, max_attempts=3):
    for attempt in range(max_attempts):
        result = spawn_agent(phase_name)

        if result.status == "PASS":
            return SUCCESS

        if result.fix_required:
            # Fix-Agent spawnen
            fix_result = spawn_fix_agent(
                phase_name,
                result.issues
            )
            # Loop zurück zum Check
            continue

    # Nach 3 Versuchen: PARTIAL_SUCCESS
    return PARTIAL_SUCCESS
```

---

## Fix-Loop pro Phase

### Phase 1 (Backend)
```
Backend Agent → FAIL?
  ↓
Fix-Agent mit: Migration Syntax, RLS Policy, Hook Error
  ↓
Re-Run Backend Agent (validate_fix: true)
  ↓
Loop max 3x
```

### Phase 2 (Frontend)
```
Frontend Agent → FAIL?
  ↓
Fix-Agent mit: Component Error, Type Error, Import Error
  ↓
Re-Run Frontend Agent (validate_fix: true)
  ↓
Loop max 3x
```

### Phase 3 (UI Review)
```
UI Review Agent
  ↓
FAIL?
  ↓
Frontend Fix-Agent mit UI Issues
  ↓
UI Review Agent (validate_fix: true)
  ↓
Loop max 3x
```

### Phase 3.5 (Design Review)
```
Design Review Agent
  ↓
FAIL?
  ↓
Frontend Fix-Agent mit Visual Issues
  ↓
Design Review Agent (validate_fix: true)
  ↓
Loop max 3x
```

### Phase 4 (Tests)
```
Test Agent → Tests erstellen + ausführen
  ↓
FAIL? (Tests failed)
  ↓
Analyse: Welcher Agent fixt?
  - UI Bug → Frontend Agent
  - API Error → Backend Agent
  ↓
Fix-Agent spawnen
  ↓
Test Agent: Re-Run Tests
  ↓
Loop max 3x
```

### Phase 5 (QA)
```
QA Agent (Console Logs prüfen)
  ↓
Probleme gefunden?
  ↓
JA: Zurück zur zuständigen Phase
  - UI Problem → Phase 3
  - Runtime Error → Phase 2 oder 1
  ↓
QA Agent (validate_fix: true)
  ↓
Loop bis PASS
```

---

## Fix-Agent Mapping

| Issue Type | Fix Agent | Phase |
|------------|-----------|-------|
| Migration Syntax | backend-agent | 1 |
| RLS Policy Error | backend-agent | 1 |
| Hook Error | backend-agent | 1 |
| Component Error | frontend-agent | 2 |
| Type Error | frontend-agent | 2 |
| Import Error | frontend-agent | 2 |
| hover:scale | frontend-agent | 3 |
| Spacing Issue | frontend-agent | 3 |
| Icon Size | frontend-agent | 3 |
| Truncation | frontend-agent | 3.5 |
| Grid Alignment | frontend-agent | 3.5 |
| Test Selector | test-agent | 4 |
| Flaky Test | test-agent | 4 |
| Runtime Error | frontend-agent | 5 |
| API Error | backend-agent | 5 |

---

## Escalation bei max Loops

Nach 3 Loops ohne PASS:

1. **Dokumentiere Status:** PARTIAL_SUCCESS
2. **Liste offene Issues**
3. **Frage User:** Weiter oder manuell fixen?

```markdown
## ESCALATION

### Phase: UI Review
### Loops: 3/3
### Status: ⚠️ PARTIAL_SUCCESS

### Verbleibende Issues:
- ui-003: hover:scale in nested component (schwer zu finden)

### Optionen:
1. User fixt manuell
2. Weitermachen, Issue dokumentieren
3. Neuer Ansatz versuchen
```

---

## Tracking im Output

Jeder Agent MUSS im Output enthalten:

```markdown
### fix_required: true/false
### fix_loop_count: 0  # Inkrement bei jedem Loop
```

Der Orchestrator trackt:

```markdown
### Agent-Chain:
1. ✅ Backend - PASS (0 loops)
2. ✅ Frontend - PASS (1 loop)
3. ✅ UI Review - PASS (2 loops)
3.5. ✅ Design Review - PASS (0 loops)
4. ⚠️ Tests - PARTIAL (3 loops, 1 flaky)
5. ✅ QA - PASS
```
