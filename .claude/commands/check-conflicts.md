# Feature Request Konflikt-Check

Prüft alle offenen Feature Requests auf Konflikte untereinander.

## Workflow

1. **FEATURE_REQUESTS.md lesen**
   - Alle Requests im "Open Requests" Bereich extrahieren

2. **Paarweise Konflikt-Prüfung**
   - Jeden Request mit jedem anderen vergleichen
   - Konflikt-Patterns anwenden (siehe unten)

3. **Konflikte dokumentieren**
   - Konflikt-Übersicht aktualisieren
   - Betroffene Requests markieren

4. **Report ausgeben**
   - Gefundene Konflikte auflisten
   - Empfehlungen geben

## Konflikt-Patterns

### DUPLIKAT
- Titel sehr ähnlich (>70% Übereinstimmung)
- Gleiche Kernfunktion beschrieben
- Gleiche Bereiche betroffen

### GEGENSÄTZLICH
- Request A will X, Request B will nicht-X
- Gegensätzliche Werte für gleiche Eigenschaft
- "Hinzufügen" vs "Entfernen" für gleiche Komponente

### RESSOURCE
- Beide betreffen gleiche UI-Komponente/Feature
- Änderungen sind nicht kombinierbar
- Limitierter Platz/Ressourcen

### ABHÄNGIGKEIT
- Request B benötigt Feature aus Request A
- Request A wurde abgelehnt → Request B problematisch

## Anwendung

```bash
# Manueller Check
/check-conflicts

# Automatisch bei neuem Request
# (Feature Request Agent macht das automatisch)
```

## Output

Bei Konflikten:
```
## Konflikt-Report

### Gefundene Konflikte: 2

1. **REQ-001 ↔ REQ-005**
   - Typ: GEGENSÄTZLICH
   - REQ-001: "Button blau"
   - REQ-005: "Button rot"
   - Empfehlung: Abstimmung oder Product Owner

2. **REQ-002 ↔ REQ-007**
   - Typ: DUPLIKAT
   - Beide fordern "Dark Mode"
   - Empfehlung: Zusammenführen, Votes addieren
```

Bei keinen Konflikten:
```
## Konflikt-Report

✅ Keine Konflikte gefunden.

Geprüfte Requests: 5
```
