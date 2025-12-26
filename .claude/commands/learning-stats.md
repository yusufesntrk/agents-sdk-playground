# Learning Stats Command

Zeigt Nutzungsstatistiken für Agents und Skills.

## Usage

```
/learning-stats              # Übersicht aller Statistiken
/learning-stats --detailed   # Mit einzelnen Sessions
/learning-stats --agent X    # Nur Agent X
```

## Workflow

### 1. Lade Sessions

```bash
cat .claude/learnings/sessions.jsonl
```

### 2. Aggregiere Daten

Pro Agent/Skill:
- Gesamtaufrufe
- Aufrufe letzte 7 Tage
- Aufrufe letzte 30 Tage
- Durchschnittliche Dauer (wenn geloggt)
- Erfolgsrate

### 3. Zeige Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Learning Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Sessions: {N}
Total Corrections: {M}
Overall Success Rate: {X}%

📈 Top Agents (by usage):

| Agent              | Total | 7d  | 30d | Corrections |
|--------------------|-------|-----|-----|-------------|
| frontend-agent     | 45    | 12  | 38  | 3           |
| backend-agent      | 32    | 8   | 28  | 1           |
| test-agent         | 28    | 5   | 20  | 0           |

📈 Top Skills (by usage):

| Skill              | Total | 7d  | 30d |
|--------------------|-------|-----|-----|
| orchestrate        | 15    | 4   | 12  |
| ui-review          | 10    | 3   | 8   |
| debug              | 8     | 2   | 6   |

🔄 Recent Activity (last 5):

1. 2025-12-21 10:30 - frontend-agent: "Add TaskList component"
2. 2025-12-21 10:25 - backend-agent: "Create tasks migration"
3. 2025-12-21 10:20 - orchestrate: "Tasks System"
4. 2025-12-20 16:45 - test-agent: "E2E tests for candidates"
5. 2025-12-20 16:30 - ui-review: "CandidateDetail.tsx"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Flags

| Flag | Beschreibung |
|------|--------------|
| `--detailed` | Zeige einzelne Sessions |
| `--agent NAME` | Nur bestimmten Agent |
| `--skill NAME` | Nur bestimmten Skill |
| `--days N` | Nur letzte N Tage (default: 30) |
| `--json` | Output als JSON |

## Beispiel: Detailed

```
/learning-stats --detailed --agent frontend-agent

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 frontend-agent Statistics
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total Calls: 45
Corrections: 3 (6.7%)
Avg Duration: 2m 34s

Sessions:
┌────────────────────┬─────────────────────────────────┬─────────┐
│ Timestamp          │ Task                            │ Outcome │
├────────────────────┼─────────────────────────────────┼─────────┤
│ 2025-12-21 10:30   │ Add TaskList component          │ ✅      │
│ 2025-12-21 09:15   │ Add NotesSection with autoSave  │ ⚠️      │
│ 2025-12-20 16:20   │ Create CandidateCard            │ ✅      │
│ ...                │ ...                             │ ...     │
└────────────────────┴─────────────────────────────────┴─────────┘

Corrections:
1. 2025-12-21 09:20 - "autoSave prop vergessen"
2. 2025-12-19 14:30 - "Icon-Größe falsch (h-3 statt h-4)"
3. 2025-12-18 11:15 - "autoSave prop vergessen"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
