# Optimize Skills Command

Analysiert die aktuelle Konversation, findet Stellen wo Claude falsch lag und der User korrigiert hat, und optimiert entsprechende Skills, Agents oder Commands.

## Usage

```
/optimize-skills              # Analysiert Konversation, zeigt Vorschläge
/optimize-skills --apply      # Wendet Vorschläge nach Bestätigung an
/optimize-skills --last N     # Nur die letzten N Nachrichten analysieren
```

## Workflow

### 1. Konversation analysieren

Durchsuche die Konversation nach Korrektur-Patterns:

**Direkte Korrekturen:**
- "Nein, mach stattdessen X"
- "Das ist falsch, richtig wäre Y"
- "Nicht so, sondern so"
- "Du hast X vergessen"
- "Das fehlt noch: ..."

**Implizite Korrekturen:**
- Claude macht etwas → User lehnt ab → Claude macht anders
- User wiederholt Anweisung mit mehr Details
- User zeigt Frustration ("nochmal", "wie gesagt", "ich meinte")

**Nachträgliche Anpassungen:**
- "Ändere X zu Y"
- "Füge noch Z hinzu"
- "Entferne das wieder"

### 2. Korrekturen kategorisieren

Für jede erkannte Korrektur, bestimme:

```
{
  "trigger": "Was Claude gemacht hat",
  "correction": "Was der User korrigiert hat",
  "correct_behavior": "Was Claude hätte tun sollen",
  "category": "skill" | "agent" | "command" | "claude_md" | "style_guide",
  "target_file": "Pfad zur Datei die geändert werden sollte",
  "severity": "high" | "medium" | "low"
}
```

**Kategorisierung:**

| Korrektur-Typ | Ziel |
|---------------|------|
| UI/Design-Fehler | `.claude/skills/leyaltech-style-guide/SKILL.md` |
| Agent-Verhalten | `.claude/agents/{agent}/SKILL.md` |
| Workflow-Fehler | `.claude/commands/{command}.md` |
| Generelle Regeln | `CLAUDE.md` |
| Code-Style | Skills oder CLAUDE.md |

### 3. Report erstellen

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Conversation Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzed: {N} messages
Corrections found: {M}

📋 Corrections Detected:

{für jede Korrektur:}
┌─────────────────────────────────────────
│ #{N} [{severity}] {kurze Beschreibung}
├─────────────────────────────────────────
│ ❌ Claude: {was Claude gemacht hat}
│ ✅ User:   {was richtig gewesen wäre}
│ 📁 Target: {ziel-datei}
└─────────────────────────────────────────

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 4. Vorschläge generieren

Für jede Korrektur, generiere konkrete Änderung:

```markdown
## Vorschlag #{N}: {Target-Datei}

**Problem:** {Beschreibung}

**Änderung:**

```diff
+ ### ⚠️ {Regel-Titel}
+
+ **Kontext:** {Wann tritt das auf}
+
+ **Regel:** {Konkrete Anweisung}
+
+ **Beispiel:**
+ - ❌ FALSCH: {was Claude tat}
+ - ✅ RICHTIG: {was korrekt wäre}
```

Soll ich diese Änderung anwenden? [Ja] [Nein] [Anpassen]
```

### 5. User-Entscheidung einholen

Für jeden Vorschlag, frage mit AskUserQuestion:
- **Anwenden** - Änderung direkt in die Datei schreiben
- **Anpassen** - User kann die Formulierung ändern
- **Überspringen** - Diese Korrektur ignorieren
- **Alle anwenden** - Restliche Vorschläge ohne Nachfrage anwenden

### 6. Änderungen durchführen

Nach Bestätigung:
1. Lies die Ziel-Datei
2. Füge die neue Regel an passender Stelle ein
3. Schreibe die Datei
4. Bestätige was geändert wurde

## Beispiel

```
User: /optimize-skills

Claude: Ich analysiere unsere Konversation...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 Conversation Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Analyzed: 47 messages
Corrections found: 2

📋 Corrections Detected:

┌─────────────────────────────────────────
│ #1 [medium] Hover-Scale bei Tab-Cards
├─────────────────────────────────────────
│ ❌ Claude: hover:scale-105 bei Cards unter Tabs
│ ✅ User:   "Das überlappt, nimm das weg"
│ 📁 Target: CLAUDE.md (UI/UX Regeln)
└─────────────────────────────────────────

┌─────────────────────────────────────────
│ #2 [high] Playwright Screenshots nicht ausgeführt
├─────────────────────────────────────────
│ ❌ Claude: Sub-Agent gab nur Text aus, kein Tool-Call
│ ✅ User:   "Der Screenshot existiert nicht!"
│ 📁 Target: CLAUDE.md (Sub-Agent Regeln)
└─────────────────────────────────────────

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Vorschlag #1: CLAUDE.md

**Problem:** hover:scale bei Cards unter Tabs/Navigation

**Änderung:**

```diff
+ ### 5. Hover-Effekte
+ **KEIN `hover:scale-*` bei Cards unter Tabs/Navigation!**
+ - Scale verursacht Überlappung mit darüberliegenden Elementen
+ - Stattdessen: `hover:border-white/30 hover:bg-white/10`
```

Soll ich diese Änderung anwenden?

User: Ja

Claude: ✅ Regel zu CLAUDE.md hinzugefügt (Zeile 45-48)

Weiter mit Vorschlag #2?
```

## Intelligente Erkennung

### Pattern-Matching für Korrekturen

```
CORRECTION_PATTERNS = [
  # Direkte Ablehnung
  /^(nein|falsch|nicht so|stop)/i,

  # Anweisungs-Wiederholung
  /wie (ich sagte|gesagt|bereits erwähnt)/i,

  # Frustration
  /(nochmal|wieder|erneut|schon wieder)/i,

  # Explizite Korrektur
  /(stattdessen|statt|anstatt|besser|richtig wäre)/i,

  # Fehlend
  /(fehlt|vergessen|missing|hast du nicht)/i,

  # Entfernen
  /(entferne|lösche|weg damit|nimm .* raus)/i
]
```

### Kontext-Analyse

Nicht jede Korrektur ist ein Skill-Issue:
- **Einmalige Präferenz** → Nicht speichern
- **Projekt-spezifisch** → In CLAUDE.md des Projekts
- **Allgemeingültig** → In Skill/Agent/globale CLAUDE.md

Frage bei Unsicherheit den User!

## Flags

| Flag | Beschreibung |
|------|--------------|
| `--apply` | Vorschläge nach Bestätigung anwenden |
| `--last N` | Nur letzte N Nachrichten analysieren |
| `--target TYPE` | Nur bestimmten Typ analysieren (skill/agent/command/claude_md) |
| `--dry-run` | Nur zeigen, nichts ändern |

## Wichtig

- **Nicht alles speichern!** Nur wiederholbare Patterns, keine einmaligen Präferenzen
- **User entscheidet** - Jeder Vorschlag braucht Bestätigung
- **Kontext beachten** - Manche Korrekturen sind situationsabhängig
- **Diffs zeigen** - User muss sehen was geändert wird bevor er zustimmt
