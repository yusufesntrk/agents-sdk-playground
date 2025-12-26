---
name: frontmatter-validator
description: Validates Skills and Agents frontmatter format against official Claude Code documentation. Use when creating new agents/skills, before commits, or when user says "validate frontmatter", "check agents", "prüfe skills".
---

# Frontmatter Validator

Prüft Skills und Agents auf korrektes Format laut offizieller Claude Code Dokumentation.

## Wann verwenden

- Vor Git Commits die Agents/Skills ändern
- Nach Erstellen neuer Agents/Skills
- Bei "validate", "prüfe format", "check frontmatter"

## Validierungs-Regeln

### 1. tools/allowed-tools Format

```yaml
# ✅ KORREKT - komma-separiert
tools: Read, Grep, Glob, mcp__playwright__*

# ❌ FALSCH - YAML-Array
tools: ["Read", "Grep", "Glob"]
```

**Regex zum Finden:**
```
tools: \["
allowed-tools: \["
```

### 2. name Format (kebab-case)

```yaml
# ✅ KORREKT
name: my-agent-name

# ❌ FALSCH
name: My Agent Name
name: myAgentName
```

**Regex zum Finden:**
```
^name: [A-Z]
```

### 3. Nur dokumentierte Felder

**Erlaubt für Agents:**
- name, description, tools, model, permissionMode, skills

**Erlaubt für Skills:**
- name, description, allowed-tools, version

**NICHT erlaubt (werden ignoriert):**
- chain_order, depends_on, provides, triggers

### 4. Frontmatter muss existieren

Jede SKILL.md muss mit `---` beginnen.

## Validierungs-Workflow

```bash
# 1. Prüfe tools-Array Format
grep -r 'tools: \["' .claude/agents/ .claude/skills/

# 2. Prüfe Title Case Namen
grep -r '^name: [A-Z]' .claude/agents/ .claude/skills/

# 3. Prüfe nicht-dokumentierte Felder
grep -r 'chain_order:\|depends_on:\|provides:\|triggers:' .claude/agents/ .claude/skills/

# 4. Prüfe fehlende Frontmatter
for f in .claude/skills/*/SKILL.md .claude/agents/*/SKILL.md; do
  head -1 "$f" | grep -q '^---' || echo "Missing frontmatter: $f"
done
```

## Quick-Check Command

```bash
echo "=== Frontmatter Validation ===" && \
echo "1. Tools Array Format:" && \
grep -rn 'tools: \["' .claude/agents/ .claude/skills/ 2>/dev/null | grep -v "# ❌" || echo "   ✅ OK" && \
echo "2. Title Case Names:" && \
grep -rn '^name: [A-Z]' .claude/agents/ .claude/skills/ 2>/dev/null || echo "   ✅ OK" && \
echo "3. Undocumented Fields:" && \
grep -rn 'chain_order:\|depends_on:\|provides:\|triggers:' .claude/agents/ .claude/skills/ 2>/dev/null | head -5 || echo "   ✅ OK"
```

## Automatische Korrektur

### tools-Array zu komma-separiert:
```
# VON:
tools: ["Read", "Grep", "Glob"]

# ZU:
tools: Read, Grep, Glob
```

### Title Case zu kebab-case:
```
# VON:
name: My Skill Name

# ZU:
name: my-skill-name
```

## Output Format

```markdown
## Frontmatter Validation Report

### ❌ Fehler gefunden:

1. **tools-Array Format**
   - `.claude/agents/xyz/SKILL.md:4` - `tools: ["Read"]` → `tools: Read`

2. **Title Case Name**
   - `.claude/skills/abc/SKILL.md:2` - `My Skill` → `my-skill`

### ✅ Keine Fehler

Alle 47 Skills und 18 Agents haben korrektes Format.
```
