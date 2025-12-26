# Design Review

Prüfe Website-Komponenten auf UX Patterns und Design-Konsistenz.

## Deine Aufgabe

Führe einen Design Review für: $ARGUMENTS

---

## Automatische Checks

### 1. Scroll-Container
```bash
# Navigation-Pfeile bei Scroll-Containern?
grep -rn "overflow-x-auto" $FILE | xargs grep "ChevronLeft\|ChevronRight"
```
**Regel:** Keine Pfeile, nur Drag-to-Scroll

### 2. Card-Alignment
```bash
# h-full ohne flex-col?
grep -rn "h-full" $FILE | grep -v "flex-col"
```
**Regel:** Cards mit Bottom-Elementen brauchen `flex flex-col` + `flex-1`

### 3. Hover-Effekte
```bash
# hover:scale gefunden?
grep -rn "hover:scale" $FILE
```
**Regel:** Kein `hover:scale` bei Cards in Grids oder unter Navigation

### 4. Grid vs Scroll
```bash
# Grid mit dynamischen Items?
grep -rn "grid-cols-" $FILE
```
**Regel:** Dynamische Listen → Horizontal Scroll statt Grid

### 5. Container-Pattern
```bash
# overflow-x-auto ohne negative margins?
grep -rn "overflow-x-auto" $FILE | xargs grep -L "\-mx-"
```
**Regel:** Full-bleed braucht `-mx-4 md:-mx-8` + `px-4 md:px-8`

---

## Report Format

```
═══════════════════════════════════════════════════
  DESIGN REVIEW - [Datei/Verzeichnis]
═══════════════════════════════════════════════════

✅ PASSED:
  • Keine Navigation-Pfeile
  • Container-Patterns korrekt

⚠️ WARNINGS:
  • Zeile 45: hover:scale - Overlap prüfen

❌ FAILURES:
  • Zeile 67: Cards fehlt flex-col

🔧 AUTO-FIXES:
  • flex-col zu Zeile 67 hinzugefügt

═══════════════════════════════════════════════════
```

---

## Skills Referenz

- `frontend/scroll-ux-patterns`
- `frontend/card-layout-patterns`
- `frontend/hover-animation-safety`
- `frontend/container-patterns`

---

## Beispiele

```bash
# Einzelne Datei
/design-review src/components/home/TestimonialsSection.tsx

# Ganzes Verzeichnis
/design-review src/components/home/

# Alle Components
/design-review src/components/
```
