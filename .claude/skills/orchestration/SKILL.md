---
name: orchestration
description: |
  Feature-Entwicklung mit Connected Agent Chain orchestrieren.

  Triggers: "orchestrate", "implementiere Feature", "baue Feature", "entwickle Feature",
  "Agent-Chain", "Multi-Step Implementation", "Backend + Frontend", "DB + UI",
  "komplettes Feature", "End-to-End Feature".

  Use when implementing features that span backend, frontend, UI review, and testing.
allowed-tools: Read, Write, Edit, Grep, Glob, Bash, Task, mcp__playwright__*, mcp__supabase__*
version: 2.0.0
---

# Feature Orchestration

Du bist der Hauptagent (Claude). **DU orchestrierst** - kein Subagent.

## Kernprinzip: Connected Agent Chain

```
NIEMALS:  Review → Report → STOPP ❌
IMMER:    Review → FAIL? → Fix → Re-Review → Loop bis PASS ✅
```

**Agents sind KEINE isolierten Tools!** Sie sind eine verbundene Kette mit Fix-Loops.

---

## Quick Reference

| Phase | Agent | Fix-Loop | Max Attempts |
|-------|-------|----------|--------------|
| 0 | - | - | Plan + Approval |
| 1 | Backend | ✅ | 3 |
| 2 | Frontend | ✅ | 3 |
| 3 | UI Review | ✅ | 3 |
| 3.5 | Design Review | ✅ | 3 |
| 4 | Tests | ✅ | 3 |
| 5 | **QA + User Journey** | ✅ | Loop bis PASS |
| 6 | Feedback | - | User Rating |

---

## ⚠️ User Journey Testing (PFLICHT!)

**Bei jedem Feature mit Interaktionen (Popups, Modals, Buttons):**

```
1. User Journey definieren:
   - Welche Klicks macht der User?
   - Was öffnet sich danach?

2. Journey durchspielen:
   - Navigate → Screenshot
   - Click → Screenshot
   - Fill → Screenshot
   - Submit → Screenshot

3. JEDEN Screenshot prüfen:
   - Text-Overflow?
   - Layout broken?
   - Buttons abgeschnitten?

4. Mobile wiederholen!
```

**Siehe:** [PHASES.md#phase-5](PHASES.md#phase-5-final-qa-mit-user-journey-testing)

---

## ⚠️ End-to-End Verification (PFLICHT!)

**UI success ≠ Backend success. Both must pass.**

### Before marking complete, run this verification:

```bash
# 1. UI Action ausführen
mcp__playwright__playwright_click → Button/Form

# 2. Console prüfen
mcp__playwright__playwright_console_logs → Errors?

# 3. Backend verifizieren (KRITISCH!)
mcp__supabase__execute_sql: "SELECT * FROM [table] ORDER BY created_at DESC LIMIT 1"
mcp__supabase__get_logs: service="edge-function" → Function aufgerufen?

# 4. Ergebnis bestätigen
# - Email: User fragen oder Resend Dashboard
# - DB: Row existiert mit korrekten Werten
# - File: Storage prüfen
```

### Real Example (aus dieser Session):

```
❌ FALSCH:
   1. TenantDetail UI gebaut
   2. Screenshot gemacht → "sieht gut aus"
   3. "Fertig" gesagt
   → User: "Einladung kam nicht an"

✅ RICHTIG:
   1. TenantDetail UI gebaut
   2. "Einladen" geklickt → Console Logs geprüft
   3. Hook Code gelesen → sah: nur DB Insert, keine Edge Function!
   4. Fix: Edge Function Call hinzugefügt
   5. Re-Test → Email versendet → Fertig
```

### Mandatory Checks bei Aktionen:

| Aktion | MUSS geprüft werden |
|--------|---------------------|
| Form Submit | DB-Eintrag + API Response |
| Email senden | Edge Function Logs + DB |
| File Upload | Storage Bucket |
| User erstellen | Auth + Profile + Roles |

**Wenn du einen Hook/Service nutzt → LIES den Code. Nicht annehmen dass er funktioniert.**

---

## Agent-Chain Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                 DU (Claude = Orchestrator)                  │
│                                                             │
│  Phase 0: Plan erstellen → User-Approval                   │
│  Phase 1: Backend → Fix-Loop                                │
│  Phase 2: Frontend → Fix-Loop                               │
│  Phase 3: UI Review → Fix-Loop                              │
│  Phase 3.5: Design Review → Fix                             │
│  Phase 4: Tests → Fix-Loop                                  │
│  Phase 5: Final QA                                          │
│  Phase 6: Feedback sammeln → Learnings speichern           │
└─────────────────────────────────────────────────────────────┘
```

**Detaillierte Phase-Beschreibungen:** [PHASES.md](PHASES.md)

---

## Kritische Regeln

1. **NUR `general-purpose`** als subagent_type - keine custom Agent-Namen!
2. **DU (Hauptagent) machst Screenshots** mit Playwright MCP - Subagenten erben MCP-Tools automatisch
3. **Fix-Loops sind PFLICHT** - max 3 Versuche pro Phase
4. **Warte auf Results** bevor nächste Phase startet
5. **Subagenten spawnen NICHTS** - nur du koordinierst

**Fix-Loop Logik:** [FIX-LOOPS.md](FIX-LOOPS.md)

---

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
1. ✅ Backend - PASS (0 loops)
2. ✅ Frontend - PASS (1 loop)
3. ✅ UI Review - PASS (2 loops)
3.5. ✅ Design Review - PASS (0 loops)
4. ✅ Tests - 4/4 passed
5. ✅ QA - PASS
6. ✅ Feedback - ⭐⭐⭐⭐⭐ (5/5)
```

---

## Multi-Feature Modus

Bei 2+ unabhängigen Features parallel mit `run_in_background: true`.

**Nur parallel wenn Features KEINE gemeinsamen Dateien ändern!**

**Detaillierte Anleitung:** [MULTI-FEATURE.md](MULTI-FEATURE.md)

---

## NIEMALS

- ❌ Review machen und bei FAIL stoppen ohne Fix
- ❌ `subagent_type: "backend-agent"` (existiert nicht!)
- ❌ Subagent spawnen der andere Subagenten spawnt
- ❌ Tests überspringen
- ❌ "PASS" ohne Re-Validierung nach Fix

## IMMER

- ✅ Bei FAIL → Auto-Fix → Re-Validate → Loop
- ✅ Max 3 Loops pro Phase
- ✅ DU machst Screenshots mit Playwright MCP (Subagenten erben MCP-Tools automatisch wenn tools: weggelassen)
- ✅ Auf Subagent-Results warten
- ✅ Klares Output-Format mit fix_loop_count
