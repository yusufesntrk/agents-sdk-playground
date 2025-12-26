# UI Review + Auto-Fix

**Target:** $ARGUMENTS

## ⚡ SOFORT AUSFÜHREN - SCHRITT FÜR SCHRITT

**Du MUSST diese Schritte der Reihe nach ausführen. Nicht beschreiben, TUN!**

---

### SCHRITT 1: Screenshot machen

**JETZT ausführen:**

```
mcp__playwright__playwright_navigate(url="http://localhost:5173/$ARGUMENTS", headless=true)
mcp__playwright__playwright_screenshot(name="ui-review", fullPage=true, savePng=true, downloadsDir=".screenshots")
```

---

### SCHRITT 2: Review Agent spawnen

**JETZT ausführen:**

```
Task(
  subagent_type="general-purpose",
  prompt="Du bist der UI Review Agent.

## Analyse
1. Screenshot lesen: .screenshots/ui-review.png
2. Code lesen für: $ARGUMENTS

## Prüfe
- Text-Vollständigkeit
- Layout & Alignment
- Spacing-Konsistenz
- Keine hover:scale-* bei Cards
- Korrekte Icon-Größen (h-4 w-4)
- Keine hardcoded Colors

## Output Format (PFLICHT!)
## UI REVIEW RESULT
### Status: ✅ PASS | ❌ FAIL
### Issues (wenn FAIL):
#### Issue 1
- file: [pfad]
- line: [zeile]
- problem: [was]
- fix: [wie]
"
)
```

---

### SCHRITT 3: Result prüfen

**JETZT prüfen:**

Wenn Review-Agent "❌ FAIL" zurückgibt → **WEITER ZU SCHRITT 4**
Wenn Review-Agent "✅ PASS" zurückgibt → **WEITER ZU SCHRITT 6**

---

### SCHRITT 4: Fix Agent spawnen (bei FAIL)

**JETZT ausführen wenn FAIL:**

```
Task(
  subagent_type="general-purpose",
  prompt="Du bist der UI Fix Agent.

## Issues zu fixen:
[HIER DIE ISSUES AUS DEM REVIEW EINFÜGEN]

## Aufgabe
Fixe jeden Issue mit dem Edit-Tool.

## Output
Liste jeden Fix: ✅ Issue X: [gefixt] in [datei:zeile]
"
)
```

---

### SCHRITT 5: Re-Review Loop

**JETZT ausführen:**

1. Neuen Screenshot machen (SCHRITT 1 wiederholen)
2. Review Agent erneut spawnen (SCHRITT 2 wiederholen)
3. FAIL? → Zurück zu SCHRITT 4
4. PASS? → Weiter zu SCHRITT 6
5. **Max 3 Loops** - danach PARTIAL_SUCCESS

---

### SCHRITT 6: Final Report

**JETZT ausgeben:**

```markdown
## UI REVIEW COMPLETE

### Target: $ARGUMENTS
### Status: ✅ SUCCESS | ⚠️ PARTIAL

### Loops:
- Loop 1: [PASS/FAIL] - [X Issues gefixt]
- Loop 2: [PASS/FAIL] - [X Issues gefixt]

### Total Fixes: [Anzahl]
```

---

## 🔴 WICHTIG

- **Nicht beschreiben** - **TUN**
- **Nicht fragen** - **MACHEN**
- **Bei FAIL** → **AUTOMATISCH fixen**
- **Nach Fix** → **AUTOMATISCH re-reviewen**
