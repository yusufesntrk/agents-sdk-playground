---
name: svg-viewbox-optimization
description: This skill should be used when the user asks to "crop SVG", "remove SVG whitespace", "adjust viewBox", "optimize SVG margins", "make SVG tight", "remove padding from SVG", or needs to adjust SVG boundaries to match visible content with equal margins on all sides.
---

# SVG ViewBox Optimization

Optimiere SVG-Dateien durch Anpassung der viewBox, um überflüssigen Whitespace zu entfernen und gleichmäßige Ränder auf allen Seiten zu erzielen.

## Wann verwenden

- SVG hat zu viel Leerraum auf einer oder mehreren Seiten
- Ränder sollen gleichmäßig auf allen Seiten sein
- Logo/Icon soll "tight" gecroppt werden
- viewBox ist größer als der sichtbare Content

## Analyse-Schritte

### 1. SVG-Struktur verstehen

```xml
<svg viewBox="0 0 [width] [height]">
  <g transform="translate(x, y) scale(s)">
    <!-- Content -->
  </g>
  <text x="..." y="...">Text</text>
</svg>
```

**Relevante Attribute:**
- `viewBox="minX minY width height"` - Sichtbarer Bereich
- `transform="translate(x, y)"` - Verschiebung von Elementen
- `transform="scale(s)"` - Skalierung (Original × s = tatsächliche Größe)
- `x`, `y` bei `<text>` - Textposition (y = Baseline!)

### 2. Bounds berechnen

**Für skalierte Gruppen:**
```
Tatsächliche Breite = Original-Breite × scale
Tatsächliche Höhe = Original-Höhe × scale
End-X = translate-X + (Original-Breite × scale)
End-Y = translate-Y + (Original-Höhe × scale)
```

**Für Text:**
```
Text-Breite ≈ Zeichenanzahl × (font-size × 0.55)  // Durchschnitt für sans-serif
Text-Höhe ≈ font-size × 0.75                      // Höhe über Baseline
End-X = x + Text-Breite
Start-Y = y - Text-Höhe
End-Y = y + (font-size × 0.2)                     // Descender
```

### 3. Ränder ermitteln

```
Links:  min(alle Start-X Werte)
Rechts: viewBox-Breite - max(alle End-X Werte)
Oben:   min(alle Start-Y Werte)
Unten:  viewBox-Höhe - max(alle End-Y Werte)
```

## Optimierung durchführen

### Gleichmäßige Ränder setzen

**Ziel:** Alle Ränder auf denselben Wert (z.B. 5px)

**Schritt 1: Content verschieben**
```xml
<!-- Vorher -->
<g transform="translate(5, 0) scale(0.42)">

<!-- Nachher - 5px von oben -->
<g transform="translate(5, 5) scale(0.42)">
```

**Schritt 2: Text anpassen**
```xml
<!-- Vorher -->
<text x="105" y="58">

<!-- Nachher - gleiche Verschiebung wie Icon -->
<text x="105" y="63">
```

**Schritt 3: viewBox anpassen**
```xml
<!-- Vorher -->
<svg viewBox="0 0 460 90">

<!-- Nachher - tight mit 5px Rand -->
<svg viewBox="0 0 315 100">
```

### Berechnung für viewBox

```
Neue Breite = max(End-X) + gewünschter-Rand
Neue Höhe = max(End-Y) + gewünschter-Rand
```

## Iteratives Vorgehen

1. **Erste Schätzung** - viewBox auf geschätzte Bounds setzen
2. **Im Browser öffnen** - `open -a "Google Chrome" datei.svg`
3. **Visuell prüfen** - Ränder vergleichen
4. **Feintuning** - viewBox-Werte anpassen bis alle Ränder gleich

## Typische Probleme

| Problem | Lösung |
|---------|--------|
| Rechts zu viel Platz | viewBox-Breite reduzieren |
| Oben kein Rand | translate-Y erhöhen oder viewBox-minY negativ |
| Ränder ungleich | Content verschieben (translate) UND viewBox anpassen |
| Text abgeschnitten | viewBox-Breite erhöhen oder Text-x reduzieren |

## Beispiel: Logo optimieren

**Ausgangssituation:**
```xml
<svg viewBox="0 0 460 90">
  <g transform="translate(5, 0) scale(0.42)">...</g>
  <text x="105" y="58">ShortSelect</text>
</svg>
```

**Problem:** Zu viel Whitespace rechts, kein Rand oben

**Lösung:**
```xml
<svg viewBox="0 0 315 100">
  <g transform="translate(5, 5) scale(0.42)">...</g>
  <text x="105" y="63">ShortSelect</text>
</svg>
```

**Änderungen:**
- viewBox: 460→315 (rechts gecroppt), 90→100 (Höhe für Rand unten)
- translate: (5,0)→(5,5) (5px Rand oben)
- text y: 58→63 (gleiche Verschiebung wie Icon)

## Tools

```bash
# SVG im Browser öffnen
open -a "Google Chrome" pfad/zur/datei.svg

# Nach Änderung: Browser refreshen
# Cmd+R in Chrome
```
