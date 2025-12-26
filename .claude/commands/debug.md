# Debug Command: $ARGUMENTS

Startet automatisiertes Debugging mit Playwright für Browser-Probleme.

**Nutzung:**
```
/debug <url-oder-page> <problem-beschreibung>
```

**Beispiele:**
```
/debug /tasks "Spinner wird dauerhaft angezeigt"
/debug /applications "Button klick funktioniert nicht"
/debug /jobs/123 "API Error beim Laden"
```

## Was der Agent macht

1. **Öffnet die Seite** in Playwright mit Console/Network Monitoring
2. **Sammelt Fehler** - Console Logs, Network Errors
3. **Macht Screenshots** - Von aktuellen State und Problemen
4. **Analysiert Root Cause** - Warum tritt das Problem auf?
5. **Generiert Report** - Mit Findings und Lösungsvorschlägen

## Unterschied zu manueller Prüfung

- ✅ Automatisch statt manuell
- ✅ Keine Browser Console öffnen notwendig
- ✅ Vollständiges Report mit Kontext
- ✅ Screenshots und Logs werden gespeichert
- ✅ AI-Analyse statt nur Aufzählung von Fehlern

## Tips

- Beschreibe das Problem so genau wie möglich
- Nenne die genaue URL/Route
- Erwähne wann das Problem auftritt (beim Laden? Nach Klick?)

---

**Statt manuell:**
- ❌ "Öffne die Browser Console"
- ❌ "Sag mir was dort steht"

**Nutze:**
- ✅ `/debug /tasks "Problem hier"`
- ✅ Agent debuggt automatisch und macht vollständigen Report
