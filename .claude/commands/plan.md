# Feature-Planung: $ARGUMENTS

Analysiere das Feature "$ARGUMENTS" und erstelle einen strukturierten Plan.

## Schritte:

1. **PRD.md prüfen:** Suche nach relevanten Anforderungen für "$ARGUMENTS"
2. **FEATURES.md prüfen:** Was ist bereits implementiert? Was fehlt noch?
3. **Codebase erkunden:** Welche bestehenden Patterns/Komponenten können wiederverwendet werden?

## Output:

Erstelle einen Plan mit:
- **Kontext:** Was gibt PRD.md vor?
- **Aktueller Stand:** Was existiert bereits laut FEATURES.md?
- **Offene Fragen:** Was muss vor Implementierung geklärt werden?
- **Vorgeschlagene Tasks:** Konkrete Schritte für die Umsetzung
- **Betroffene Bereiche:** DB, Hooks, Components, Pages, Tests

## Wichtig:
- Bei Unklarheiten FRAGEN bevor du loslegst
- **Plan wird NICHT implementiert** - nur dokumentiert in PRD.md und FEATURES.md
- Tasks in FEATURES.md dokumentieren sobald Plan erstellt ist
- Implementierung startet erst nach expliziter Bestätigung (z.B. "Go ahead with the plan" oder `/orchestrate`)
