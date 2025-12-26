---
name: rulebreaker-animation
description: Erstelle Rulebreaker-Style SVG/CSS Animationen mit Timeline-Orchestrierung, Bounce-Effekten und Loop-Logik. Verwende diesen Skill wenn du komplexe, mehrstufige Animationen im LeyalTech-Stil erstellen sollst.
---

# Rulebreaker Animation Skill

Erstelle professionelle, storytelling-basierte SVG/CSS-Animationen im Rulebreaker-Stil.

---

## Wann diesen Skill verwenden

- Komplexe mehrstufige Animationen erstellen
- SVG-basierte Prozess-Visualisierungen
- Timeline-gesteuerte Animation-Sequenzen
- Looping Animationen mit Reset-Logik
- Pop-In, Fly-In, Draw-Line Effekte

---

## Quick Reference

### Easing Functions

| Name | Cubic Bezier | Verwendung |
|------|--------------|------------|
| **Bouncy** | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Pop-In, Badge erscheinen |
| **Smooth** | `cubic-bezier(0.4, 0, 0.2, 1)` | Fly-In, Slides |
| **Ease Out** | `ease-out` | Draw-Lines, Fades |

### Animation Durations

| Effekt | Dauer | Verwendung |
|--------|-------|------------|
| Pop-In | 0.6s | Schnelle Erscheinungen |
| Fly-In | 1.2s | Längere Bewegungen |
| Draw-Line | 0.5s | SVG Striche |
| Title Fade | 0.4-0.6s | Text-Wechsel |
| Glow Pulse | 2s | Dauerhaftes Leuchten |

### Loop Timing

| Komplexität | Loop-Dauer |
|-------------|------------|
| Einfach (3-5 Schritte) | 8 Sekunden |
| Mittel (6-10 Schritte) | 10 Sekunden |
| Komplex (10+ Schritte) | 12 Sekunden |

---

## Boilerplate

### 1. React Component Struktur

```tsx
import { useEffect, useRef } from "react";

const MyAnimation = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    // Element-Referenzen
    const el1 = wrapper.querySelector("#element-1");
    const el2 = wrapper.querySelector("#element-2");

    // Reset-Funktion
    const resetAnimation = () => {
      el1?.classList.remove("show");
      el2?.classList.remove("fly");
    };

    // Animation-Timeline
    const runAnimation = () => {
      const timeline = [
        { time: 300, action: () => el1?.classList.add("show") },
        { time: 800, action: () => el2?.classList.add("fly") },
      ];

      timeline.forEach(({ time, action }) => setTimeout(action, time));
    };

    // Initial starten
    runAnimation();

    // Loop
    const interval = setInterval(() => {
      resetAnimation();
      setTimeout(runAnimation, 500);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={wrapperRef}>
      <style>{ANIMATION_STYLES}</style>
      <div className="anim-wrapper">
        <div className="anim-container">
          {/* SVG Content */}
        </div>
      </div>
    </div>
  );
};
```

### 2. CSS Styles Template

```tsx
const ANIMATION_STYLES = `
  /* Container Reset */
  .anim-wrapper {
    all: initial;
    display: block;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  .anim-wrapper .anim-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
    width: 100%;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: hidden;
  }

  .anim-wrapper svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  /* ===== Animation Keyframes ===== */

  /* Pop-In (Bouncy Scale) */
  @keyframes pop-in {
    0% { opacity: 0; transform: scale(0) rotate(-5deg); }
    50% { transform: scale(1.1) rotate(2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  .anim-wrapper .element { opacity: 0; }
  .anim-wrapper .element.show {
    animation: pop-in 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Fly-In (Slide + Scale) */
  @keyframes fly-in {
    0% { opacity: 0; transform: translateX(-200px) scale(0.5); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }
  .anim-wrapper .card { opacity: 0; }
  .anim-wrapper .card.fly {
    animation: fly-in 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  /* Draw-Line (SVG Stroke) */
  .anim-wrapper .stroke {
    stroke-dasharray: 80;
    stroke-dashoffset: 80;
    opacity: 0;
  }
  @keyframes draw-stroke {
    to { stroke-dashoffset: 0; opacity: 1; }
  }
  .anim-wrapper .stroke.draw {
    animation: draw-stroke 0.5s ease-out forwards;
  }

  /* Checkmark */
  .anim-wrapper .checkmark {
    stroke-dasharray: 50;
    stroke-dashoffset: 50;
    opacity: 0;
  }
  @keyframes draw-check {
    to { stroke-dashoffset: 0; opacity: 1; }
  }
  .anim-wrapper .checkmark.check {
    animation: draw-check 0.6s ease-out forwards;
  }

  /* Title Fade */
  @keyframes title-fade-in {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes title-fade-out {
    from { opacity: 1; }
    to { opacity: 0; transform: translateY(10px); }
  }
  .anim-wrapper .title { opacity: 0; }
  .anim-wrapper .title.fade-in {
    animation: title-fade-in 0.6s ease-out forwards;
  }
  .anim-wrapper .title.fade-out {
    animation: title-fade-out 0.4s ease-out forwards;
  }

  /* Glow Pulse (Dauerhaft) */
  @keyframes glow-pulse {
    0%, 100% { filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)); }
    50% { filter: drop-shadow(0 0 25px rgba(251, 191, 36, 1)); }
  }
  .anim-wrapper .glow {
    animation: glow-pulse 2s ease-in-out infinite;
  }

  /* Sparkle */
  @keyframes sparkle {
    0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
    50% { opacity: 1; transform: scale(1) rotate(180deg); }
  }
  .anim-wrapper .sparkle {
    opacity: 0;
    animation: sparkle 1.5s ease-in-out infinite;
  }

  /* Badge Pop */
  @keyframes badge-pop {
    0% { opacity: 0; transform: scale(0) rotate(-10deg); }
    70% { transform: scale(1.15) rotate(5deg); }
    100% { opacity: 1; transform: scale(1) rotate(0); }
  }
  .anim-wrapper .badge { opacity: 0; }
  .anim-wrapper .badge.pop {
    animation: badge-pop 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .anim-wrapper .anim-container {
      min-height: 320px;
    }
  }
`;
```

### 3. SVG Template

```tsx
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
  <defs>
    {/* Gradients */}
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{ stopColor: '#DBEAFE' }} />
      <stop offset="100%" style={{ stopColor: '#BFDBFE' }} />
    </linearGradient>

    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{ stopColor: '#D1FAE5' }} />
      <stop offset="100%" style={{ stopColor: '#A7F3D0' }} />
    </linearGradient>

    <linearGradient id="yellowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style={{ stopColor: '#FEF3C7' }} />
      <stop offset="100%" style={{ stopColor: '#FCD34D' }} />
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

  {/* Phase Title */}
  <g id="title-group">
    <text
      id="title-1"
      className="title"
      x="400" y="60"
      textAnchor="middle"
      fontFamily="Arial, sans-serif"
      fontSize="22"
      fontWeight="700"
      fill="#1F2937"
    >
      1. Erste Phase
    </text>
  </g>

  {/* Content Area */}
  <g id="content">
    {/* Beispiel-Element */}
    <g className="element" id="element-1">
      <circle cx="200" cy="200" r="50" fill="url(#blueGradient)" filter="url(#shadow)" />
      <text x="200" y="215" textAnchor="middle" fontSize="40">📊</text>
    </g>
  </g>

  {/* Success Badge */}
  <g className="badge" id="success-badge">
    <circle cx="650" cy="480" r="70" fill="#10B981" filter="url(#shadow)" />
    <circle cx="650" cy="480" r="60" fill="#D1FAE5" />
    <text x="650" y="480" textAnchor="middle" fontSize="34" fontWeight="bold" fill="#059669">
      100%
    </text>
    <text x="650" y="505" textAnchor="middle" fontSize="13" fontWeight="600" fill="#047857">
      Erfolg
    </text>
  </g>
</svg>
```

---

## Rezepte

### Rezept 1: Kalender mit erscheinenden Events

```tsx
// Events mit data-order für Reihenfolge
<div className="event" data-order="1">Event 1</div>
<div className="event" data-order="2">Event 2</div>

// In useEffect:
const events = wrapper.querySelectorAll('.event');
const sorted = [...events].sort((a, b) =>
  parseInt(a.dataset.order) - parseInt(b.dataset.order)
);
sorted.forEach((el, i) => {
  setTimeout(() => el.classList.add('show'), i * 200);
});
```

### Rezept 2: Pipeline mit fliegenden Cards

```tsx
// Timeline mit Cards die von links einfliegen
const timeline = [
  { time: 500, action: () => card1.classList.add('fly') },
  { time: 800, action: () => card2.classList.add('fly') },
  { time: 1100, action: () => card3.classList.add('fly') },
];
```

### Rezept 3: Durchgestrichene Elemente + Ersatz

```tsx
// Streich-Animation + Icon-Wechsel
{ time: 2000, action: () => strikeLine.classList.add('draw') },
{ time: 2500, action: () => oldIcon.classList.add('fade-out') },
{ time: 3000, action: () => {
  strikeLine.style.opacity = '0';
  newIcon.classList.add('show');
}},
```

### Rezept 4: Element-Bewegung (translateY)

```tsx
// CSS
@keyframes slide-up {
  0% { transform: translateY(0); }
  100% { transform: translateY(-200px); }
}
.element.move-up {
  animation: slide-up 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

// JavaScript
{ time: 5000, action: () => element.classList.add('move-up') },
```

### Rezept 5: Multi-Phasen Titel-Wechsel

```tsx
// 3 Titel die nacheinander erscheinen
const timeline = [
  { time: 0, action: () => title1.classList.add('fade-in') },
  { time: 3000, action: () => title1.classList.add('fade-out') },
  { time: 3100, action: () => title2.classList.add('fade-in') },
  { time: 6000, action: () => title2.classList.add('fade-out') },
  { time: 6100, action: () => title3.classList.add('fade-in') },
];
```

---

## Farbpalette

| Kategorie | Haupt | Light | Border |
|-----------|-------|-------|--------|
| **Business (Blau)** | `#3B82F6` | `#DBEAFE` | `#60A5FA` |
| **Success (Grün)** | `#10B981` | `#D1FAE5` | `#34D399` |
| **Warning (Gelb)** | `#F59E0B` | `#FEF3C7` | `#FCD34D` |
| **Accent (Lila)** | `#8B5CF6` | `#EDE9FE` | `#A78BFA` |
| **Error (Rot)** | `#EF4444` | `#FEE2E2` | `#F87171` |
| **Neutral** | `#1F2937` | `#F3F4F6` | `#D1D5DB` |

---

## Checkliste

### Vor dem Start
- [ ] Geschichte/Ablauf definiert (was passiert wann?)
- [ ] Elemente identifiziert die animiert werden
- [ ] Loop-Dauer festgelegt (8-12 Sekunden)

### Container
- [ ] `all: initial` auf Wrapper
- [ ] `min-height: 400px` (Desktop) / `320px` (Mobile)
- [ ] `border-radius: 16px`
- [ ] `box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15)`
- [ ] `overflow: hidden`

### SVG
- [ ] `viewBox="0 0 800 600"` (oder passendes Seitenverhältnis)
- [ ] Shadow-Filter in `<defs>` definiert
- [ ] Gradients in `<defs>` definiert
- [ ] Eindeutige IDs für alle animierten Elemente

### Animationen
- [ ] Alle Elemente starten mit `opacity: 0`
- [ ] Klassen triggern Animationen (`.show`, `.fly`, etc.)
- [ ] Bouncy Easing für Pop-Effekte
- [ ] Smooth Easing für Bewegungen

### Loop-Logik
- [ ] Reset-Funktion entfernt alle Animation-Klassen
- [ ] 500ms Pause zwischen Reset und Neustart
- [ ] `clearInterval` im Cleanup
- [ ] Keine Memory Leaks (alle timeouts gecleaned)

### Responsive
- [ ] Media Query für Mobile vorhanden
- [ ] Höhe passt sich an (320px auf Mobile)
- [ ] Keine overflow-Probleme

---

## Anti-Patterns

### NICHT tun:

```tsx
// ❌ Direkte Style-Manipulation statt Klassen
element.style.opacity = '1';
element.style.transform = 'scale(1)';

// ✅ Klassen verwenden
element.classList.add('show');
```

```tsx
// ❌ Animation direkt auf Element
<div style={{ animation: 'pop-in 0.6s' }}>

// ✅ Animation über Klasse
<div className={isVisible ? 'element show' : 'element'}>
```

```tsx
// ❌ Kein Reset, Animation läuft nur einmal
useEffect(() => {
  runAnimation();
}, []);

// ✅ Mit Loop und Reset
useEffect(() => {
  runAnimation();
  const interval = setInterval(() => {
    resetAnimation();
    setTimeout(runAnimation, 500);
  }, 10000);
  return () => clearInterval(interval);
}, []);
```

```tsx
// ❌ Tailwind Classes in animierten Elementen
<div className="animate-fade-in">

// ✅ Inline Styles in der Komponente
<style>{` @keyframes... `}</style>
```
