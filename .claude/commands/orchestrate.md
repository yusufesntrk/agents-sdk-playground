---
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, mcp__playwright__*, mcp__supabase__*
argument-hint: [feature-description]
description: Orchestriere Feature-Implementierung mit Connected Agent Chain
---

# Feature Orchestration: $ARGUMENTS

**DU bist der Orchestrator.** Kein Subagent. DU koordinierst die gesamte Agent-Chain.

## Vollständiger Workflow

Befolge EXAKT die Anweisungen in diesem Skill:

@.claude/skills/orchestration/SKILL.md

## Kritische Regeln (NIEMALS verletzen!)

1. **Connected Chain** - KEIN Agent arbeitet isoliert!
   ```
   NIEMALS: Review → Report → STOPP ❌
   IMMER:   Review → FAIL? → Fix → Re-Review → Loop bis PASS ✅
   ```

2. **Nur `general-purpose`** als subagent_type - keine custom Agent-Namen!

3. **DU machst Screenshots** mit Playwright MCP - nicht Subagenten

4. **Fix-Loops sind PFLICHT** - max 3 Versuche pro Phase

5. **Warte auf Results** bevor nächste Phase startet

## Agent-Chain Übersicht

```
Phase 0: Vorbereitung (Dev-Server, Plan, User-Approval)
    ↓
Phase 1: Backend (wenn nötig) → Fix-Loop bis PASS
    ↓
Phase 2: Frontend → Fix-Loop bis PASS
    ↓
Phase 3: UI Review + Auto-Fix → Screenshot → Review → Fix → Re-Review Loop
    ↓
Phase 4: Tests + Auto-Fix → Run → Fix Failures → Re-Run Loop
    ↓
Phase 5: Final QA → Screenshot + Console Logs → Bei Problemen zurück
```

## Jetzt starten

1. Lies den vollständigen Skill oben (@.claude/skills/orchestration/SKILL.md)
2. Starte mit **Phase 0: Vorbereitung** für: "$ARGUMENTS"
3. Hole User-Approval für den Plan
4. Führe die komplette Agent-Chain aus
