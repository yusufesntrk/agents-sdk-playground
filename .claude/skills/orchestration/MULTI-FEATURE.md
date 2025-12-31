# Multi-Feature Orchestration - Reference

## Wann Multi-Feature?

Bei 2+ **unabhängigen** Features die parallel entwickelt werden können.

**Unabhängig bedeutet:**
- Keine gemeinsamen Dateien
- Keine DB-Dependencies
- Keine Import-Überschneidungen

---

## Parallel Execution Pattern

```
Task 1 (run_in_background: true):
  subagent_type: "general-purpose"
  prompt: |
    Implementiere Feature A komplett:
    - Backend: [specs]
    - Frontend: [specs]
    - Tests: [specs]

    Führe die komplette Agent-Chain durch.
    Gib am Ende einen Summary-Report.

Task 2 (run_in_background: true):
  subagent_type: "general-purpose"
  prompt: |
    Implementiere Feature B komplett:
    - Backend: [specs]
    - Frontend: [specs]
    - Tests: [specs]

    Führe die komplette Agent-Chain durch.
    Gib am Ende einen Summary-Report.

# Warten auf Ergebnisse
TaskOutput(task_id_1)
TaskOutput(task_id_2)
```

---

## Dependency Check

Vor Parallelisierung prüfen:

```bash
# Gemeinsame Dateien finden
Grep "[Feature A Pattern]" src/ | cut -d: -f1 > /tmp/files_a.txt
Grep "[Feature B Pattern]" src/ | cut -d: -f1 > /tmp/files_b.txt
comm -12 /tmp/files_a.txt /tmp/files_b.txt
```

Wenn Überschneidungen → **SEQUENTIELL** statt parallel!

---

## Parallel vs Sequential

### Parallel (unabhängig)
```
Feature A: Tasks System
Feature B: Notifications System
→ Keine gemeinsamen Komponenten
→ PARALLEL OK
```

### Sequential (abhängig)
```
Feature A: User Profiles
Feature B: User Settings (braucht Profiles)
→ Settings braucht Profile-Hook
→ SEQUENTIELL
```

---

## Output Aggregation

Nach Parallel-Execution:

```markdown
## MULTI-FEATURE ORCHESTRATION COMPLETE

### Feature A: Tasks System
- Status: ✅ SUCCESS
- Files: 5 created
- Tests: 4/4 passed

### Feature B: Notifications System
- Status: ⚠️ PARTIAL
- Files: 4 created
- Tests: 3/4 passed (1 flaky)

### Total
- Features: 2
- Success: 1
- Partial: 1
- Failed: 0
```

---

## Conflict Resolution

Falls Merge-Konflikte nach Parallel-Execution:

1. **Identifiziere Konflikte**
   ```bash
   git status | grep "both modified"
   ```

2. **Löse Konflikte**
   - Meist in shared files (Router, Index)
   - Beide Imports behalten
   - Routes kombinieren

3. **Re-Run Tests**
   ```bash
   npx playwright test
   ```

---

## Best Practices

1. **Maximal 3 Features parallel**
   - Mehr → Context-Overload
   - Besser: Batches von 2-3

2. **Unabhängigkeit validieren**
   - Vor Start: Dependency Check
   - Im Zweifel: Sequentiell

3. **Aggregate Reports**
   - Warte auf ALLE TaskOutputs
   - Kombinierter Summary

4. **Rollback-Strategie**
   - Git Branch pro Feature
   - Bei Konflikt: Cherry-Pick
