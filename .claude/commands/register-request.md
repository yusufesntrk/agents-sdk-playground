# Feature Request registrieren: $ARGUMENTS

Registriert einen neuen Feature Request in FEATURE_REQUESTS.md und prüft auf Konflikte.

## Workflow

1. **Request-Daten sammeln**
   - Falls $ARGUMENTS leer: Nach Titel und Beschreibung fragen
   - Falls $ARGUMENTS vorhanden: Als Titel verwenden

2. **Nächste REQ-ID ermitteln**
   - FEATURE_REQUESTS.md lesen
   - Höchste existierende REQ-XXX finden
   - Neue ID = höchste + 1

3. **Request eintragen**
   - In "Open Requests" Sektion einfügen
   - Format:
   ```markdown
   ### REQ-XXX: [Titel]
   - **Erstellt:** [Datum]
   - **Von:** [User]
   - **Typ:** Feature Request
   - **Votes:** 1
   - **Priorität:** Medium

   **Beschreibung:**
   [Text]

   **Betroffene Bereiche:**
   - [ ] Database
   - [ ] Backend/Hooks
   - [ ] Frontend/UI
   - [ ] Tests

   **Konflikt-Check:** [Wird automatisch ausgefüllt]
   ```

4. **Konflikt-Prüfung durchführen**
   - Neuen Request gegen alle existierenden prüfen
   - Bei Konflikt: Warnung ausgeben + in Tabelle eintragen

5. **Log-Eintrag schreiben**
   - Am Ende der Datei im Agent-Logs Bereich

## Anwendung

```bash
# Mit Titel
/register-request Dark Mode für die App

# Interaktiv (fragt nach Details)
/register-request
```

## Automatischer Trigger

Dieser Command kann auch automatisch aufgerufen werden wenn:
- Ein neuer `feedback_items` Eintrag mit `type = 'feature_request'` erstellt wird
- Der Feature Request Agent getriggert wird
