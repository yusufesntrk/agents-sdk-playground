# Bug Report registrieren: $ARGUMENTS

Registriert einen neuen Bug Report in BUG_REPORTS.md und prüft auf Duplikate.

## Workflow

1. **Bug-Daten sammeln**
   - Falls $ARGUMENTS leer: Nach Beschreibung fragen
   - Falls $ARGUMENTS vorhanden: Als Kurzbeschreibung verwenden

2. **Nächste BUG-ID ermitteln**
   - BUG_REPORTS.md lesen
   - Höchste existierende BUG-XXX finden
   - Neue ID = höchste + 1

3. **Bug eintragen**
   - In "Open Bugs" Sektion einfügen
   - Priorität basierend auf Keywords vorschlagen

4. **Duplikat-Prüfung durchführen**
   - Neuen Bug gegen alle existierenden prüfen
   - Bei Duplikat: Als DUPLICATE markieren, Votes zusammenführen

5. **Log-Eintrag schreiben**

## Anwendung

```bash
# Mit Beschreibung
/register-bug Dashboard zeigt falsche Zahlen

# Interaktiv
/register-bug
```
