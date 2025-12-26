---
name: ux-quick-check
description: Schnelle UX-Checkliste vor dem Implementieren oder Reviewen von UI-Komponenten. Verwende diesen Skill als Quick-Reference bei jedem UI-Task.
---

# UX Quick-Check

Schnelle Checkliste aller LeyalTech UX-Regeln. **Vor jedem UI-Task durchgehen!**

---

## 7 Goldene Regeln

### 1. Keine Navigation-Pfeile bei Scroll-Containern

```
❌ ChevronLeft/ChevronRight Buttons
✅ Drag-to-Scroll + Touch-Scroll
```

### 2. Cards mit Bottom-Alignment

```
❌ <div className="h-full">
✅ <div className="h-full flex flex-col">
   + flex-1 auf variablem Content
```

### 3. Tab-Wechsel = Scroll-Reset

```tsx
useEffect(() => {
  scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
}, [activeTab]);
```

### 4. Pagination = Nur Visuell

```
❌ <button onClick={scrollTo}>●</button>
✅ <div className="rounded-full w-2 h-2" />
```

### 5. Kein hover:scale bei Cards

```
❌ hover:scale-[1.02]  // Overlap mit Nachbarn!
✅ hover:border-primary/30 hover:bg-muted/50
```

### 6. Full-Bleed Container

```tsx
<div className="-mx-4 md:-mx-8">
  <div className="px-4 md:px-8 overflow-x-auto">
```

### 7. Grid nur bei passender Item-Anzahl

```
Items: 3, 6, 9 bei 3-cols → Grid OK
Items: 4, 5, 7, etc. → Horizontal Scroll!
```

---

## Entscheidungsbaum

```
Neue Card-Section?
│
├── Items dynamisch/unbekannt?
│   └── JA → Horizontal Scroll
│
├── Items fix + passt zu cols?
│   └── JA → Grid erlaubt
│
└── Cards haben Footer/Progress?
    └── JA → flex flex-col + flex-1
```

---

## Schnell-Check: Code-Patterns

| Pattern | Problem | Lösung |
|---------|---------|--------|
| `ChevronLeft` | Unnötige Pfeile | Entfernen |
| `hover:scale` | Overlap | Border/Shadow statt Scale |
| `grid-cols-*` | Orphaned Items | Horizontal Scroll |
| `h-full` ohne `flex-col` | Ungleiche Höhen | `flex flex-col` hinzufügen |
| `onClick.*scroll` bei Dots | Unnötig | Dots nur visuell |

---

## Copy-Paste Templates

### Drag-to-Scroll State

```tsx
const [isDragging, setIsDragging] = useState(false);
const [startX, setStartX] = useState(0);
const [scrollLeft, setScrollLeft] = useState(0);
const scrollRef = useRef<HTMLDivElement>(null);

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
  scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
};

const handleMouseUp = () => setIsDragging(false);
```

### Scroll Container

```tsx
<div
  ref={scrollRef}
  className={`flex gap-6 overflow-x-auto scrollbar-hide select-none ${
    isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
  }`}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMove}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
>
```

### Card mit Bottom-Alignment

```tsx
<div className="h-full rounded-2xl p-6 flex flex-col">
  <h3>Title</h3>
  <p className="flex-1">Variable description...</p>
  <div className="mt-6 pt-4 border-t">
    {/* Always at bottom */}
  </div>
</div>
```

---

## Referenzen

| Skill | Inhalt |
|-------|--------|
| `drag-to-scroll` | Vollständiges Drag-Pattern |
| `card-section-patterns` | Card-Layouts im Detail |
| `leyaltech-style-guide` | Design System |

---

**Verwendung:** Diesen Skill vor jedem UI-Task kurz durchlesen!
