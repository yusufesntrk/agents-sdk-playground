---
name: leyaltech-style-guide
description: LeyalTech Design System und Style Guide. Verwende diesen Skill wenn du UI-Komponenten, Layouts oder Animationen für das LeyalTech Projekt erstellst.
---

# LeyalTech Style Guide

Offizielles Design System für das LeyalTech Website-Projekt.

---

## Farbpalette

### Primärfarben

| Name | HSL | Hex | Verwendung |
|------|-----|-----|------------|
| **Primary** | `210 100% 45%` | `#0066CC` | CTAs, Links, Akzente |
| **Secondary** | `215 45% 12%` | `#151B26` | Headlines, wichtige Texte |
| **Accent** | `200 100% 50%` | `#00BFFF` | Hover-States, Gradients |

### Hintergrundfarben

| Name | HSL | Hex | Verwendung |
|------|-----|-----|------------|
| **Background** | `205 35% 95%` | `#EDF2F7` | Page Background |
| **Card** | `0 0% 100%` | `#FFFFFF` | Cards, Widgets |
| **Muted** | `210 20% 90%` | `#E2E8F0` | Disabled, Dividers |

### Status-Farben

| Name | HSL | Hex | Verwendung |
|------|-----|-----|------------|
| **Success** | `145 65% 42%` | `#22C55E` | Erfolg, Bestätigung |
| **Warning** | `38 92% 50%` | `#F59E0B` | Warnung |
| **Destructive** | `0 84% 60%` | `#EF4444` | Fehler, Löschen |
| **Info** | `200 100% 45%` | `#0EA5E9` | Information |

---

## Typografie

### Font Family
```css
font-family: 'Inter', system-ui, sans-serif;
```

### Font Weights
| Weight | Name | Verwendung |
|--------|------|------------|
| 400 | Regular | Body Text |
| 500 | Medium | Labels, Buttons |
| 600 | Semibold | Subheadings |
| 700 | Bold | Headlines |
| 800 | Extrabold | Hero Headlines |

### Headings

```tsx
// Section Heading
<h2 className="section-heading">Text</h2>
// → text-3xl md:text-4xl font-bold text-secondary tracking-tight

// Section Subheading
<p className="section-subheading">Text</p>
// → text-muted-foreground text-lg max-w-2xl
```

---

## Spacing & Layout

### Container
```tsx
<div className="max-w-6xl mx-auto px-4 md:px-8">
```

### Section Padding
```tsx
<section className="py-16 md:py-24 px-4 md:px-8">
```

### Grid Layouts
```tsx
// 2 Columns
<div className="grid lg:grid-cols-2 gap-8">

// 3 Columns
<div className="grid md:grid-cols-3 gap-6">

// 4 Columns
<div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
```

---

## Border Radius

| Token | Value | Verwendung |
|-------|-------|------------|
| `rounded-sm` | 8px | Kleine Elemente |
| `rounded-md` | 10px | Inputs |
| `rounded-lg` | 12px | Buttons |
| `rounded-xl` | 16px | Cards |
| `rounded-2xl` | 16px | Große Cards |
| `rounded-3xl` | 24px | Hero-Elemente |
| `rounded-full` | 9999px | Pills, Badges |

---

## Shadows

### Utility Classes
```tsx
shadow-sm    // Subtle shadow
shadow-md    // Medium shadow
shadow-lg    // Large shadow
shadow-xl    // Extra large shadow
shadow-card  // Card-spezifisch
shadow-button // Button hover
```

### Animation Container Shadow
```css
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
```

---

## Component Classes

### Cards
```tsx
// Standard Feature Card
<div className="feature-card">
  // → p-6 rounded-2xl bg-card shadow-card border border-border/50
  //   hover:shadow-lg transition-all duration-300
</div>

// Animation Container
<div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
```

### Badges
```tsx
// Floating Badge
<span className="badge-floating">
  // → inline-flex items-center gap-2 px-4 py-2 rounded-full
  //   bg-card text-foreground shadow-card text-sm font-medium
</span>
```

### Navbar Container
```tsx
// Navbar mit sanften Ecken (NICHT pill-shaped)
<div className="bg-card rounded-2xl px-6 py-3 shadow-card border border-border/50">
  {/* Logo | Nav Tabs | CTA */}
</div>

// ❌ FALSCH - zu rund
<div className="rounded-full">...</div>

// ✅ RICHTIG - sanfte Ecken
<div className="rounded-2xl">...</div>
```

### Navigation Tabs (Rulebreaker-Style)
```tsx
// Inaktiv - Subtle mit Hover
<Button variant="nav">
// → px-5 py-2.5 rounded-xl text-muted-foreground
//   hover:text-foreground hover:bg-muted border border-transparent

// Aktiv - Grün hervorgehoben mit Shadow
<Button variant="navActive">
// → px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground shadow-lg
```

**Pattern:**
- `rounded-xl` für Tabs (nicht `rounded-full`)
- Aktiver Tab: `bg-secondary` (grün) mit `shadow-lg`
- Hover auf inaktiv: `hover:bg-muted`

### Buttons
```tsx
// Primary CTA
<Button className="bg-primary hover:bg-primary/90 text-white rounded-lg px-6 py-3">

// Secondary
<Button variant="outline" className="border-border hover:bg-muted">

// Ghost
<Button variant="ghost">
```

---

## Animationen

### Eingebaute Keyframes

| Name | Verwendung |
|------|------------|
| `animate-fade-in` | Einfaches Einblenden |
| `animate-fade-in-up` | Einblenden + nach oben |
| `animate-slide-in-left` | Von links reinschieben |
| `animate-slide-in-right` | Von rechts reinschieben |
| `animate-scale-in` | Einzoomen |
| `animate-float` | Schwebeeffekt |
| `animate-pulse-soft` | Sanftes Pulsieren |
| `animate-marquee` | Laufband (30s) |
| `animate-marquee-slow` | Langsames Laufband (45s) |

### Animation Delays
```tsx
animation-delay-100  // 100ms
animation-delay-200  // 200ms
animation-delay-300  // 300ms
animation-delay-400  // 400ms
animation-delay-500  // 500ms
```

### Hero Background Animationen

**Bevorzugter Stil: Pulsierende geometrische Formen mit Bedeutung**

```tsx
// Radar/Pulse Effect - Kreise die nach außen expandieren
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
  {[...Array(6)].map((_, i) => (
    <div
      key={i}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/20"
      style={{
        width: `${300 + i * 200}px`,
        height: `${300 + i * 200}px`,
        animation: `pulse-ring 4s ease-out infinite`,
        animationDelay: `${i * 1}s`,
      }}
    />
  ))}
</div>

// Keyframe Definition
@keyframes pulse-ring {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}
```

**Kombinieren mit:**
- Gradient Orbs: `radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 70%)`
- Floating Dots: Kleine Punkte mit `animate-float` (nur Desktop)

**Animation-Philosophie:**
- ✅ Subtil aber SICHTBAR (nicht zu schwach!)
- ✅ Geometrisch und clean
- ✅ Mit Bedeutung (Radar = Suche, Pulse = Wachstum)
- ✅ Verschiedene Delays für gestaffelten Effekt
- ❌ KEINE hässlichen SVG-Pfeile
- ❌ KEINE unsichtbaren Blobs (opacity zu niedrig)

---

### Animation Container Standard

**⚠️ KRITISCH: Einheitliche Höhen für ALLE Animationen!**

Alle Animationen in Tab-Containern oder ähnlichen Strukturen MÜSSEN identische Höhen haben, um Layout-Shifts beim Wechsel zu vermeiden.

```css
/* DESKTOP: Standard Animation Container */
.animation-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 400px;  /* ⚠️ PFLICHT: Einheitliche Höhe */
}

/* MOBILE: Responsive Anpassung */
@media (max-width: 768px) {
  .animation-container {
    min-height: 320px;  /* ⚠️ PFLICHT: Mobile-Höhe */
  }
}
```

React-Wrapper für Animation-Container:
```tsx
{/* Wrapper mit fixer min-height verhindert Layout-Shifts */}
<div className="bg-card rounded-2xl shadow-card border border-border/50 overflow-hidden min-h-[360px] md:min-h-[440px]">
  <MyAnimation />
</div>
```

**Höhen-Referenz:**

| Viewport | Animation min-height | Wrapper min-height |
|----------|---------------------|-------------------|
| Desktop (md+) | 400px | 440px (inkl. Padding) |
| Mobile (<768px) | 320px | 360px (inkl. Padding) |

---

## Animation-Komponenten Pattern

### Standard Animation Component Structure

```tsx
import { useEffect, useRef } from "react";

const MyAnimation = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runAnimation = () => {
      // Animation logic
    };

    runAnimation();

    // Loop animation
    const interval = setInterval(() => {
      // Reset logic
      runAnimation();
    }, 10000); // Loop every 10s

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={wrapperRef}>
      <style>{`
        .my-wrapper {
          all: initial;
          display: block;
          width: 100%;
          max-width: 100%;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .my-wrapper .my-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          width: 100%;
          min-height: 400px;
          overflow: hidden;
        }
      `}</style>

      <div className="my-wrapper">
        <div className="my-container">
          {/* Animation content */}
        </div>
      </div>
    </div>
  );
};
```

### Animation Easing Functions

| Name | Cubic Bezier | Verwendung |
|------|--------------|------------|
| Bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Pop-in Effekte |
| Smooth | `cubic-bezier(0.4, 0, 0.2, 1)` | Slides, Fades |
| Ease Out | `ease-out` | Exit Animationen |

---

## Gradients

### Vordefinierte Gradients

```css
/* Hero Background */
--gradient-hero: linear-gradient(135deg, hsl(205 35% 95%) 0%, hsl(210 40% 92%) 100%);

/* Card Subtle */
--gradient-card: linear-gradient(180deg, hsl(0 0% 100%) 0%, hsl(210 20% 98%) 100%);

/* Accent/CTA */
--gradient-accent: linear-gradient(135deg, hsl(210 100% 45%) 0%, hsl(200 100% 50%) 100%);
```

### Text Gradient
```tsx
<span className="gradient-text">Gradient Text</span>
// → bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent
```

---

## Responsive Breakpoints

| Breakpoint | Width | Prefix |
|------------|-------|--------|
| Mobile | < 640px | (default) |
| Small | >= 640px | `sm:` |
| Medium | >= 768px | `md:` |
| Large | >= 1024px | `lg:` |
| XL | >= 1280px | `xl:` |
| 2XL | >= 1536px | `2xl:` |

### Container Max Width
```tsx
max-w-6xl  // 1152px - Standard
max-w-7xl  // 1280px - Wide
```

---

## Icons

Verwende **Lucide React** für Icons:

```tsx
import { Check, ArrowRight, Mail } from "lucide-react";

// Standard Größe
<Check className="w-4 h-4" />

// In Buttons
<ArrowRight className="w-5 h-5 ml-2" />

// Feature Icons
<Mail className="w-6 h-6 text-primary" />
```

---

## Dark Mode

Dark Mode wird über die `.dark` Klasse aktiviert:

```tsx
<html className="dark">
```

Alle Farbtokens passen sich automatisch an. Verwende immer die semantischen Tokens (`bg-card`, `text-foreground`, etc.) statt direkter Farben.

---

## UX Patterns - WICHTIG

### Horizontal Scrollbare Container

**KEINE Navigation-Pfeile verwenden!** User scrollt mit Finger (Touch) oder Drag (Maus).

```tsx
// ✅ RICHTIG - Drag-to-Scroll für Desktop + Touch
const [isDragging, setIsDragging] = useState(false);
const [startX, setStartX] = useState(0);
const [scrollLeft, setScrollLeft] = useState(0);

const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  setStartX(e.pageX - containerRef.current!.offsetLeft);
  setScrollLeft(containerRef.current!.scrollLeft);
};

const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;
  e.preventDefault();
  const x = e.pageX - containerRef.current!.offsetLeft;
  const walk = (x - startX) * 1.5;
  containerRef.current!.scrollLeft = scrollLeft - walk;
};

<div
  ref={containerRef}
  className={`flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide ${
    isDragging ? "cursor-grabbing" : "cursor-grab"
  }`}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={() => setIsDragging(false)}
  onMouseLeave={() => setIsDragging(false)}
>
  {items.map(item => (
    <div className="flex-shrink-0 w-[320px] snap-start">...</div>
  ))}
</div>

// ❌ FALSCH - Keine Pfeile!
<button onClick={() => scroll('left')}><ChevronLeft /></button>
```

**Warum?**
- Pfeile sind auf Touch-Geräten überflüssig
- Drag-to-Scroll funktioniert auf Desktop UND Touch
- `cursor-grab` zeigt dem User dass er ziehen kann
- Cleaner Look ohne UI-Clutter

**Vollständiger Skill:** `.claude/skills/drag-to-scroll/SKILL.md`

---

### Cards mit Bottom-Aligned Elementen

Wenn Cards Elemente haben die am unteren Rand aligned sein müssen (Progress Bars, Buttons, etc.):

```tsx
// ✅ RICHTIG - Flex Column mit flex-1
<div className="h-full flex flex-col">
  <div className="icon">...</div>
  <h3>Title</h3>
  <p className="flex-1">Description mit variabler Länge</p>
  <div className="mt-auto">
    {/* Progress Bar / Button - IMMER am unteren Rand */}
  </div>
</div>

// ❌ FALSCH - Ohne flex, Progress Bars auf unterschiedlicher Höhe
<div className="h-full">
  <div className="icon">...</div>
  <h3>Title</h3>
  <p>Description</p>
  <div className="mt-6">Progress Bar</div>  // Höhe variiert!
</div>
```

**Pattern:**
1. Parent: `flex flex-col`
2. Variabler Content: `flex-1` (nimmt verfügbaren Platz)
3. Bottom Element: automatisch am unteren Rand

---

### Scroll-Position Reset

Bei Tab-basierten Komponenten mit scrollbarem Content: **Scroll-Position beim Tab-Wechsel zurücksetzen!**

```tsx
useEffect(() => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }
}, [activeTab]);
```

---

### Visuelle Indikatoren statt Buttons

Pagination Dots als **visuelle Indikatoren**, nicht als klickbare Buttons:

```tsx
// ✅ RICHTIG - Reine Indikatoren
<div className="flex gap-2">
  {items.map((_, i) => (
    <div
      className={`rounded-full ${i === active ? 'w-6 h-2' : 'w-2 h-2'}`}
      style={{ backgroundColor: color, opacity: i === active ? 1 : 0.4 }}
    />
  ))}
</div>

// ❌ FALSCH - Klickbare Pagination (überflüssig bei natürlichem Scroll)
<button onClick={() => scrollTo(i)}>...</button>
```

---

## Checkliste für neue Komponenten

### Grundlagen
- [ ] Verwendet semantische Farbtokens (`bg-card`, `text-primary`, etc.)
- [ ] Responsive Design (mobile-first)
- [ ] Konsistente Border Radius (16px für Cards)
- [ ] Schatten für Tiefe (`shadow-card`)
- [ ] Hover-States definiert
- [ ] Animation Delays für Stagger-Effekte
- [ ] Overflow hidden bei Animation-Containern
- [ ] Dark Mode kompatibel

### UX Patterns
- [ ] **KEINE Navigation-Pfeile** bei horizontal scrollbaren Containern
- [ ] Cards mit `flex flex-col` wenn Bottom-Alignment nötig
- [ ] Scroll-Position Reset bei Tab-Wechsel
- [ ] Pagination Dots nur als visuelle Indikatoren (nicht klickbar)
- [ ] Gleiche Höhe für Cards in einer Reihe
- [ ] **KEIN `hover:scale-*`** bei Cards unter Tabs/Navigation (Overlap!)
- [ ] **Full-Bleed Container** mit `-mx-4 md:-mx-8` + `px-4 md:px-8` (keine Streifen!)
- [ ] **KEINE orphaned Grid Items** - Horizontal scroll statt Grid bei dynamischen Listen!

### ⚠️ Animation/Container Konsistenz (KRITISCH!)
- [ ] **Einheitliche Höhen:** Alle Animationen in Tab-Containern haben IDENTISCHE Höhe
- [ ] **Desktop min-height:** Animation-Container: `400px`, Wrapper: `440px`
- [ ] **Mobile min-height:** Animation-Container: `320px`, Wrapper: `360px`
- [ ] **Media Query vorhanden:** `@media (max-width: 768px)` mit Mobile-Höhen
- [ ] **Kein Layout-Shift:** Tab-Wechsel verursacht KEINE Höhenänderung

### 📱 Mobile-First (PFLICHT!)
- [ ] **Mobile Breakpoint getestet:** 375px Breite funktioniert
- [ ] **Touch-freundlich:** Buttons mindestens 44x44px
- [ ] **Kein horizontaler Overflow:** Nichts ragt über Viewport hinaus
- [ ] **Responsive Fonts:** `text-base` auf Mobile, größer auf Desktop
- [ ] **Responsive Wrapper:** `min-h-[360px] md:min-h-[440px]`

```tsx
// ✅ RICHTIG - Animation mit Desktop + Mobile Höhen
<style>{`
  .my-container { min-height: 400px; }

  @media (max-width: 768px) {
    .my-container { min-height: 320px; }
  }
`}</style>

// ❌ FALSCH - Nur Desktop, kein Mobile
<style>{`
  .my-container { min-height: 400px; }
  /* Keine Mobile-Anpassung! */
`}</style>
```

---

## Rulebreaker-Animationen - Style Reference

Die Rulebreaker-Systeme nutzen komplexe, mehrstufige SVG/CSS-Animationen mit Timeline-basierter Orchestrierung.

### Grundprinzipien

1. **Storytelling durch Animation:** Jede Animation erzählt eine Geschichte mit Anfang, Mitte und Ende
2. **Looping:** Animationen laufen kontinuierlich (8-12 Sekunden pro Zyklus)
3. **Gestaffelte Erscheinung:** Elemente erscheinen nacheinander (Stagger-Effekt)
4. **Bouncy Easing:** `cubic-bezier(0.34, 1.56, 0.64, 1)` für lebendige Pop-Effekte
5. **Klare Phasen:** Animations-Titel wechseln zur Orientierung

### Container-Struktur

```tsx
// Äußerer Wrapper mit CSS Reset
<div className="rulebreaker-wrapper">
  <style>{`
    .rulebreaker-wrapper {
      all: initial;
      display: block;
      width: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .rulebreaker-wrapper .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      width: 100%;
      min-height: 400px;
      overflow: hidden;
    }

    @media (max-width: 768px) {
      .rulebreaker-wrapper .container { min-height: 320px; }
    }
  `}</style>

  <div className="container">
    {/* SVG oder HTML Content */}
  </div>
</div>
```

### Animation-Typen

#### 1. Pop-In Effekt (Bouncy Scale)
```css
@keyframes pop-in {
  0% { opacity: 0; transform: scale(0) rotate(-5deg); }
  50% { transform: scale(1.1) rotate(2deg); }
  100% { opacity: 1; transform: scale(1) rotate(0deg); }
}
.element.show {
  animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
```

#### 2. Fly-In Effekt (Slide + Scale)
```css
@keyframes fly-in {
  0% { opacity: 0; transform: translateX(-200px) scale(0.5); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
.element.fly {
  animation: fly-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}
```

#### 3. Draw-Line Effekt (SVG Stroke)
```css
.stroke-line {
  stroke-dasharray: 80;
  stroke-dashoffset: 80;
}
@keyframes draw-line {
  to { stroke-dashoffset: 0; opacity: 1; }
}
.stroke-line.draw {
  animation: draw-line 0.5s ease-out forwards;
}
```

#### 4. Checkmark Effekt (SVG Path)
```css
.checkmark {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
}
@keyframes draw-check {
  to { stroke-dashoffset: 0; opacity: 1; }
}
.checkmark.check {
  animation: draw-check 0.6s ease-out forwards;
}
```

#### 5. Title Fade (In/Out Wechsel)
```css
@keyframes title-fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes title-fade-out {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(10px); }
}
```

#### 6. Glow Pulse (Dauerhaft)
```css
@keyframes glow-pulse {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)); }
  50% { filter: drop-shadow(0 0 25px rgba(251, 191, 36, 1)); }
}
.glow { animation: glow-pulse 2s ease-in-out infinite; }
```

#### 7. Sparkle Effekt
```css
@keyframes sparkle {
  0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
}
.sparkle { animation: sparkle 1.5s ease-in-out infinite; }
```

### Timeline-System

```tsx
useEffect(() => {
  // Timeline-Definition: Array von {time, action}
  const timeline = [
    { time: 300, action: () => el1?.classList.add("show") },
    { time: 600, action: () => el2?.classList.add("show") },
    { time: 1000, action: () => el3?.classList.add("fly") },
    // ...
  ];

  const runAnimation = () => {
    timeline.forEach(({ time, action }) => {
      setTimeout(action, time);
    });
  };

  // Initial starten
  runAnimation();

  // Loop alle X Sekunden
  const interval = setInterval(() => {
    // Reset: Alle Klassen entfernen
    document.querySelectorAll('[class*="show"], [class*="fly"]')
      .forEach(el => el.classList.remove('show', 'fly', 'check'));

    // Neu starten nach kurzer Pause
    setTimeout(runAnimation, 500);
  }, 10000);

  return () => clearInterval(interval);
}, []);
```

### Farbpalette für Animationen

| Element | Farbe | Gradient |
|---------|-------|----------|
| Business/Beruflich | `#3B82F6` | `linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)` |
| Success/Outreach | `#10B981` | `linear-gradient(135deg, #34D399 0%, #10B981 100%)` |
| Warning/Highlight | `#F59E0B` | `linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)` |
| Private/Accent | `#8B5CF6` | `linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)` |

### SVG Struktur

```tsx
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    {/* Gradients */}
    <linearGradient id="myGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{ stopColor: '#DBEAFE' }} />
      <stop offset="100%" style={{ stopColor: '#BFDBFE' }} />
    </linearGradient>

    {/* Shadow Filter */}
    <filter id="shadow">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
      <feOffset dx="0" dy="4" result="offsetblur" />
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.25" />
      </feComponentTransfer>
      <feMerge>
        <feMergeNode />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  {/* Content Groups */}
  <g id="phase-1">...</g>
  <g id="phase-2">...</g>
</svg>
```

### Best Practices

1. **IDs für JavaScript-Zugriff:** Jedes animierte Element braucht eine eindeutige ID
2. **Klassen für Animation-States:** `.show`, `.fly`, `.check` etc. triggern Animationen
3. **Opacity 0 als Startzustand:** Elemente starten unsichtbar, werden durch Animation sichtbar
4. **Filter für Schatten:** SVG `filter` statt CSS `box-shadow` für konsistente Darstellung
5. **Responsive ViewBox:** `viewBox="0 0 800 600"` skaliert automatisch
6. **Loop-Dauer:** 8-12 Sekunden, genug Zeit zum Anschauen aber nicht langweilig
7. **Reset-Pause:** 500ms Pause zwischen Reset und Neustart für sauberen Übergang
