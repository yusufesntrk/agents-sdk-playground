# Auto Review Command

Vollautomatische Review-Chain mit Fix-Iteration. Keine User-Interaktion nötig.

## Usage

```
/auto-review                    # Full Review + Auto-Fix
/auto-review --qa-only          # Nur QA-Check + Auto-Fix
/auto-review --ui-only          # Nur UI-Review + Auto-Fix
/auto-review --max-iterations 5 # Max 5 Fix-Iterationen (default: 3)
```

## Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTO-REVIEW CHAIN                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: PARALLEL REVIEW                                       │
│  ─────────────────────────                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │  qa-agent   │ │ ui-review   │ │ test-agent  │               │
│  │             │ │   -agent    │ │             │               │
│  │ • Console   │ │ • Patterns  │ │ • Clicks    │               │
│  │ • Mobile    │ │ • Responsive│ │ • Scroll    │               │
│  │ • Desktop   │ │ • Code      │ │ • Forms     │               │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘               │
│         │               │               │                       │
│         └───────────────┼───────────────┘                       │
│                         ▼                                       │
│  PHASE 2: FINDINGS AGGREGIEREN                                  │
│  ─────────────────────────────                                  │
│  • Kritische Issues extrahieren (❌)                            │
│  • Warnings sammeln (⚠️)                                        │
│  • Fixbare Issues identifizieren                                │
│                         │                                       │
│                         ▼                                       │
│  PHASE 3: AUTO-FIX (Loop)                                       │
│  ────────────────────────                                       │
│  ┌─────────────────────────────────────────────────┐           │
│  │ Für jedes fixbare Issue:                        │           │
│  │                                                 │           │
│  │ 1. general-purpose Agent spawnen                │           │
│  │    prompt: "Du bist Frontend-Agent.             │           │
│  │             Fixe: [Issue Details]               │           │
│  │             Datei: [Pfad]                       │           │
│  │             Zeile: [Nummer]"                    │           │
│  │                                                 │           │
│  │ 2. Agent wendet Fix an (Edit/Write)             │           │
│  │                                                 │           │
│  │ 3. Review-Agent RESUMEN zur Validierung         │           │
│  │    resume: [agent-id]                           │           │
│  │    prompt: "Validiere Fix für Issue X"          │           │
│  │                                                 │           │
│  │ 4. Wenn PASS → nächstes Issue                   │           │
│  │    Wenn FAIL → Fix anpassen, retry              │           │
│  └─────────────────────────────────────────────────┘           │
│                         │                                       │
│                         ▼                                       │
│  PHASE 4: FINAL VALIDATION                                      │
│  ─────────────────────────                                      │
│  • Alle Review-Agents erneut parallel                           │
│  • Finale Screenshots                                           │
│  • Summary Report                                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Execution

### Voraussetzungen prüfen

1. Dev-Server muss laufen
2. `.mcp.json` mit Playwright konfiguriert
3. Keine uncommitteten kritischen Änderungen

### Phase 1: Parallel Review

```
Spawne parallel:
- qa-agent → Console, Performance, Mobile/Desktop Screenshots
- ui-review-agent → Pattern Violations, Responsive, Code Analysis
- test-agent → Interactive Tests, Navigation, Forms
```

### Phase 2: Findings Aggregieren

Extrahiere aus allen Agent-Reports:

```typescript
interface Finding {
  severity: 'critical' | 'warning' | 'info';
  source: 'qa' | 'ui-review' | 'test';
  description: string;
  file?: string;
  line?: number;
  fixable: boolean;
  suggestedFix?: string;
}
```

Priorisierung:
1. ❌ Critical (muss gefixt werden)
2. ⚠️ Warning mit klarem Fix
3. ℹ️ Info (optional)

### Phase 3: Auto-Fix Loop

Für jedes fixbare Issue:

```
1. Spawne general-purpose Agent:
   subagent_type: "general-purpose"
   prompt: |
     Du bist ein Frontend-Agent.

     ## Issue zu fixen:
     ${finding.description}

     ## Datei:
     ${finding.file}:${finding.line}

     ## Vorgeschlagener Fix:
     ${finding.suggestedFix}

     ## Anweisungen:
     1. Lies die Datei
     2. Verstehe den Kontext
     3. Wende den Fix an
     4. Bestätige was du geändert hast

2. Nach Fix → Resume Review-Agent:
   resume: ${finding.source === 'qa' ? qaAgentId : uiAgentId}
   prompt: |
     Validiere ob dieser Fix korrekt ist:
     Issue: ${finding.description}
     Fix angewandt in: ${finding.file}

     Mache neuen Screenshot und prüfe.

3. Wenn PASS → nächstes Issue
   Wenn FAIL → anderer Ansatz, max 3 Retries pro Issue
```

### Phase 4: Final Report

```markdown
# Auto-Review Report

## Summary
- **Reviewed:** [timestamp]
- **Total Issues:** X
- **Fixed:** Y
- **Remaining:** Z

## Fixed Issues
1. ✅ [Issue 1] - Fixed in [file]
2. ✅ [Issue 2] - Fixed in [file]

## Remaining Issues (nicht automatisch fixbar)
1. ⚠️ [Issue] - Reason: [manual intervention needed]

## Screenshots
- Before: .debug/screenshots/review-before.png
- After: .debug/screenshots/review-after.png

## Next Steps
- [ ] Manual review of remaining issues
- [ ] Run tests: npm run test
- [ ] Commit changes
```

## Fixbare vs Nicht-Fixbare Issues

### Automatisch fixbar:
- ✅ `hover:scale` bei Cards → Ersetzen durch `hover:bg-white/10`
- ✅ Fehlende `lg:hidden` bei Scroll-Dots → Hinzufügen
- ✅ `overflow-hidden` schneidet ab → Container-Größe anpassen
- ✅ Fehlende `flex-1` für Bottom-Alignment → Hinzufügen
- ✅ React Router Future Flags → Config erweitern

### Nicht automatisch fixbar:
- ❌ Design-Entscheidungen ("Farbe passt nicht")
- ❌ Content-Änderungen ("Text ist falsch")
- ❌ Komplexe Refactorings
- ❌ Third-Party Issues (Calendly CSP, etc.)

## Iteration Limits

- **Max Iterations pro Issue:** 3
- **Max Total Iterations:** 10
- **Timeout pro Agent:** 60 Sekunden

Bei Erreichen des Limits → Issue als "manual intervention needed" markieren.

## Beispiel-Ausführung

```
User: /auto-review

Orchestrator:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 AUTO-REVIEW CHAIN GESTARTET
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Phase 1: Parallel Review
   ├── qa-agent spawned...
   ├── ui-review-agent spawned...
   └── test-agent spawned...

⏳ Warte auf Agent-Reports...

📊 Phase 2: Findings Aggregieren
   ├── qa-agent: ⚠️ 2 warnings
   ├── ui-review-agent: ✅ PASS
   └── test-agent: ⚠️ 1 warning

📝 Gefundene Issues:
   1. ⚠️ React Router Future Flags (fixbar)
   2. ⚠️ Hero visibility test false positive (nicht fixbar - Playwright)

🔧 Phase 3: Auto-Fix

   Issue 1: React Router Future Flags
   ├── Spawne Frontend-Agent...
   ├── Fix angewandt in src/main.tsx
   ├── Resume qa-agent zur Validierung...
   └── ✅ VALIDIERT

   Issue 2: Hero visibility
   └── ⏭️ Übersprungen (Playwright-Issue, nicht Code)

✅ Phase 4: Final Validation
   ├── qa-agent: ✅ PASS
   ├── ui-review-agent: ✅ PASS
   └── test-agent: ✅ PASS (1 known limitation)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ AUTO-REVIEW ABGESCHLOSSEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Fixed: 1 | Skipped: 1 | Failed: 0

Screenshots: .debug/screenshots/auto-review-final.png
```

## Wichtige Regeln

1. **Keine destructiven Änderungen** ohne explizite Review
2. **Immer Backup** vor großen Refactorings
3. **Max 3 Retries** pro Issue um Endlosschleifen zu vermeiden
4. **User informieren** bei nicht-fixbaren Issues
5. **Commits** nur auf User-Request, nicht automatisch
