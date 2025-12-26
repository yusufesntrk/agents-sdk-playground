---
name: drag-to-scroll
description: Implementiere Drag-to-Scroll für horizontal scrollbare Container. Verwende diesen Skill wenn du Carousels, Card-Slider oder horizontal scrollbare Listen erstellst.
---

# Drag-to-Scroll Pattern

Smooth horizontales Scrollen mit Maus-Drag für Desktop + Touch-Support für Mobile.

---

## Wann verwenden?

- Horizontal scrollbare Card-Container
- Carousels / Slider
- Tab-basierte Content-Bereiche mit scrollbaren Cards
- Jede horizontal scrollbare Liste

---

## Vollständige Implementation

```tsx
import { useState, useRef } from "react";

const MyScrollableComponent = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Drag-to-scroll state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Scroll-Geschwindigkeit (1.5x)
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);

  return (
    <div
      ref={scrollContainerRef}
      className={`flex gap-5 overflow-x-auto scrollbar-hide select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className="flex-shrink-0 w-[320px] snap-start"
        >
          {/* Card Content */}
        </div>
      ))}
    </div>
  );
};
```

---

## Wichtige Details

### CSS Klassen

| Klasse | Zweck |
|--------|-------|
| `overflow-x-auto` | Horizontales Scrollen aktivieren |
| `scrollbar-hide` | Scrollbar verstecken (muss in CSS definiert sein) |
| `select-none` | Text-Selektion beim Dragging verhindern |
| `cursor-grab` | Zeigt dem User dass er ziehen kann |
| `cursor-grabbing` | Während des Ziehens |
| `snap-x snap-mandatory` | Snap zu Cards (nur wenn NICHT dragging!) |
| `snap-start` | Auf den Card-Items |
| `flex-shrink-0` | Cards behalten feste Breite |

### Scrollbar-Hide CSS

Falls nicht vorhanden, in `index.css` hinzufügen:

```css
.scrollbar-hide {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

### Snap-Verhalten

**WICHTIG:** `snap-x snap-mandatory` nur wenn `!isDragging`:
- Während Dragging: Smooth scrollen ohne Snap
- Nach Loslassen: Snap zur nächsten Card

```tsx
className={`... ${
  isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
}`}
```

### Scroll-Geschwindigkeit

Der Multiplikator `1.5` in der `handleMouseMove` Funktion bestimmt die Scroll-Geschwindigkeit:
- `1.0` = 1:1 Bewegung
- `1.5` = Etwas schneller (empfohlen)
- `2.0` = Doppelt so schnell

---

## Mit Tab-Wechsel kombinieren

Wenn der Container in einer Tab-Komponente ist:

```tsx
const [activeTab, setActiveTab] = useState("tab1");

// Scroll zurücksetzen bei Tab-Wechsel
useEffect(() => {
  if (scrollContainerRef.current) {
    scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" });
  }
}, [activeTab]);
```

---

## Don'ts

```tsx
// ❌ KEINE Navigation-Pfeile
<button onClick={() => scroll('left')}><ChevronLeft /></button>
<button onClick={() => scroll('right')}><ChevronRight /></button>

// ❌ KEINE klickbaren Pagination-Dots
<button onClick={() => scrollTo(index)}>•</button>

// ❌ KEIN snap-mandatory während Dragging
className="snap-x snap-mandatory" // Ohne isDragging-Check = ruckelig!
```

---

## Beispiel: RoadmapSection

Siehe `/src/components/home/RoadmapSection.tsx` für eine vollständige Referenz-Implementation mit:
- Drag-to-Scroll
- Tab-basierter Phase-Wechsel
- Scroll-Position Reset
- Active Card Tracking
- Progress Indicators

---

**Status:** ✅ Production-ready
**Getestet:** Desktop (Chrome, Firefox, Safari) + Mobile (Touch)
