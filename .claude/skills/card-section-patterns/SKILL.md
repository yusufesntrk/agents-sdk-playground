---
name: card-section-patterns
description: Patterns für Card-basierte Sektionen. Verwende diesen Skill wenn du Card-Layouts, Testimonials, Feature-Grids oder ähnliche Komponenten erstellst.
---

# Card Section Patterns

Best Practices für Card-basierte Layouts im LeyalTech Projekt.

---

## Entscheidungsbaum: Grid vs Horizontal Scroll

```
Ist die Anzahl der Items fix und passt zur Spaltenanzahl?
│
├── JA (3, 6, 9 Items bei 3 Spalten) → GRID
│
└── NEIN (dynamisch, 4, 5, 7 Items, etc.) → HORIZONTAL SCROLL
```

---

## Pattern 1: Horizontal Scrollbare Card-Section

**Verwenden bei:** Testimonials, dynamische Listen, wenn Items hinzukommen können

```tsx
import { useState, useRef } from "react";

const CardSection = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Section Title</h2>
        </div>
      </div>

      {/* Full-Bleed Scroll Container */}
      <div className="max-w-6xl mx-auto">
        <div className="-mx-4 md:-mx-8 lg:mx-0">
          <div
            ref={scrollRef}
            className={`flex gap-6 overflow-x-auto px-4 md:px-8 lg:px-0 py-4 scrollbar-hide select-none ${
              isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {items.map((item, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[340px] md:w-[380px] snap-start"
              >
                <Card item={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
```

---

## Pattern 2: Card mit Bottom-Aligned Elementen

**Verwenden bei:** Cards mit Progress Bars, Buttons, Footer-Elementen

```tsx
const Card = ({ item }) => (
  <div className="h-full rounded-2xl bg-card border border-border p-6 flex flex-col">
    {/* Icon */}
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-primary" />
    </div>

    {/* Title */}
    <h3 className="text-xl font-bold mb-3">{item.title}</h3>

    {/* Description - FLEX-1 für variables Wachstum */}
    <p className="text-muted-foreground text-sm flex-1">
      {item.description}
    </p>

    {/* Footer - IMMER am unteren Rand */}
    <div className="mt-6 pt-4 border-t border-border">
      <ProgressBar value={item.progress} />
    </div>
  </div>
);
```

**Wichtig:**
- Parent: `flex flex-col`
- Variabler Content: `flex-1`
- Footer: automatisch am unteren Rand

---

## Pattern 3: Sichere Hover-Effekte

```tsx
// ✅ SICHER - Keine Größenänderung
<div className="hover:border-primary/30 hover:bg-muted/50 transition-all">

// ✅ SICHER - Schatten statt Scale
<div className="hover:shadow-lg transition-shadow">

// ❌ GEFÄHRLICH - Scale kann Überlappung verursachen
<div className="hover:scale-105">
```

---

## Pattern 4: Tab-basierte Section mit Scroll

```tsx
const TabbedSection = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const scrollRef = useRef<HTMLDivElement>(null);

  // WICHTIG: Scroll zurücksetzen bei Tab-Wechsel
  useEffect(() => {
    scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
  }, [activeTab]);

  return (
    <section>
      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? "bg-primary" : "bg-muted"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scrollable Content */}
      <div ref={scrollRef} className="overflow-x-auto ...">
        {/* Cards für activeTab */}
      </div>
    </section>
  );
};
```

---

## Checkliste vor dem Implementieren

- [ ] Ist die Item-Anzahl fix oder dynamisch?
- [ ] Grid oder Horizontal Scroll?
- [ ] Brauchen Cards Bottom-Alignment?
- [ ] Gibt es Tabs die Scroll-Reset brauchen?
- [ ] Welche Hover-Effekte sind sicher?

---

## Referenz-Implementierungen

| Komponente | Pattern | Datei |
|------------|---------|-------|
| RoadmapSection | Tab + Horizontal Scroll | `src/components/home/RoadmapSection.tsx` |
| TestimonialsSection | Horizontal Scroll | `src/components/home/TestimonialsSection.tsx` |

---

**Siehe auch:**
- `.claude/skills/drag-to-scroll/SKILL.md` - Detailliertes Drag-to-Scroll Pattern
- `.claude/skills/leyaltech-style-guide/SKILL.md` - Vollständiger Style Guide
