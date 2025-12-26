# Improve Agents Command

Analysiert Learnings und schlägt Verbesserungen für Agents und Skills vor.

## Usage

```
/improve-agents              # Volle Analyse + Vorschläge
/improve-agents --stats      # Nur Statistiken anzeigen
/improve-agents --apply      # Vorschläge direkt anwenden (mit Bestätigung)
```

## Workflow

### 1. Lade Learnings

Lies die folgenden Dateien:
- `.claude/learnings/sessions.jsonl` - Alle Agent/Skill-Aufrufe
- `.claude/learnings/corrections.jsonl` - Erkannte Korrekturen
- `.claude/learnings/patterns.json` - Bisherige Patterns

### 2. Aggregiere Statistiken

Zähle pro Agent/Skill:
- Anzahl Aufrufe
- Anzahl Korrekturen
- Korrektur-Rate (Korrekturen / Aufrufe)

### 3. Erkenne Patterns

**Agent-Issues (Schwelle: 3x gleiche Korrektur):**
```
IF gleiche correction.description >= 3x für einen Agent
THEN → Agent SKILL.md sollte erweitert werden
```

**Skill-Kandidaten (Schwelle: 5x ähnlicher Task):**
```
IF ähnlicher task >= 5x ohne existierenden Skill
THEN → Neuer Skill sollte erstellt werden
```

**Unused Agents (Schwelle: 30 Tage):**
```
IF Agent nicht in sessions.jsonl der letzten 30 Tage
THEN → Archivierung vorschlagen
```

### 4. Generiere Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Learning Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzed: {N} sessions, {M} corrections
Time Range: {start} - {end}

📈 Agent Usage:
  {agent-name}    {calls} calls  ({corrections} corrections)
  ...

⚠️ Issues Found: {count}

{für jedes Issue:}
1. {agent}: "{correction_description}" ({count}x)
   → Suggested fix available

💡 Skill Candidates: {count}

{für jeden Kandidaten:}
1. "{skill-name}" pattern ({count} occurrences)
   → Could be a reusable skill

🗑️ Unused Agents: {count}
  {agent-names}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 5. Zeige Vorschläge (wenn nicht --stats)

Für jedes Issue, zeige konkreten Diff:

```markdown
## Vorschlag {N}: {agent} verbessern

**Problem:** "{description}" ({count}x)

**Änderung für SKILL.md:**

```diff
+ ### ⚠️ {Issue Title} - LEARNED
+
+ **Problem:** {description}
+
+ **Regel:** {konkrete Anweisung}
```

[Anwenden] [Überspringen]
```

### 6. Wende Änderungen an (nach Bestätigung)

1. Edit die SKILL.md des betroffenen Agents
2. Oder erstelle neuen Skill-Ordner
3. Update patterns.json mit `status: "applied"`

## Beispiel

```
User: /improve-agents

Agent: Ich analysiere die Learnings...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Learning Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzed: 45 sessions, 5 corrections
Time Range: 2025-12-14 - 2025-12-21

📈 Agent Usage:
  frontend-agent    18 calls  (3 corrections)
  backend-agent     12 calls  (1 correction)
  test-agent        10 calls  (0 corrections)
  orchestrator       5 calls  (1 correction)

⚠️ Issues Found: 1

1. frontend-agent: "autoSave prop vergessen" (3x)
   → Suggested fix available

💡 Skill Candidates: 0

🗑️ Unused Agents: 0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Soll ich den Verbesserungsvorschlag für frontend-agent zeigen?
```

## Flags

| Flag | Beschreibung |
|------|--------------|
| `--stats` | Nur Statistiken, keine Vorschläge |
| `--apply` | Nach Vorschlag direkt fragen ob anwenden |
| `--agent NAME` | Nur bestimmten Agent analysieren |
| `--days N` | Nur letzte N Tage analysieren (default: 30) |
