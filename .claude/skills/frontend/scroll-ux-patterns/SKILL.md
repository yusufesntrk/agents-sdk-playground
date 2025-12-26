---
name: scroll-ux-patterns
description: Universal scroll UX patterns for horizontal scrollable content. Use when implementing carousels, card sliders, testimonials, or any horizontally scrollable container.
---

# Scroll UX Patterns

Best practices for horizontal scroll containers that work on all devices.

---

## Core Principle

**Users scroll naturally. Don't add unnecessary UI.**

```
Touch devices → Swipe with finger
Desktop → Drag with mouse OR scroll wheel + Shift
```

---

## Rule 1: No Navigation Arrows

```tsx
// ❌ WRONG - Arrows are redundant
<button onClick={() => scroll('left')}><ChevronLeft /></button>
<div className="overflow-x-auto">{cards}</div>
<button onClick={() => scroll('right')}><ChevronRight /></button>

// ✅ RIGHT - Natural scrolling only
<div className="overflow-x-auto cursor-grab">{cards}</div>
```

**Why?**
- Arrows don't work on touch (swipe is natural)
- Arrows add visual clutter
- Drag-to-scroll works everywhere

---

## Rule 2: Implement Drag-to-Scroll

Desktop users expect to drag horizontally. Implement this pattern:

### State Setup

```tsx
import { useState, useRef } from "react";

const ScrollContainer = ({ children }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
```

### Event Handlers

```tsx
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
    const walk = (x - startX) * 1.5; // 1.5x scroll speed
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => setIsDragging(false);
```

### JSX

```tsx
  return (
    <div
      ref={scrollRef}
      className={`flex gap-6 overflow-x-auto scrollbar-hide select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
};
```

---

## Rule 3: Snap Points

Use CSS snap for better UX when not dragging:

```tsx
className={`overflow-x-auto ${
  isDragging
    ? "cursor-grabbing"
    : "cursor-grab snap-x snap-mandatory"  // Snap only when not dragging
}`}

// Each item
<div className="snap-start flex-shrink-0 w-[340px]">
```

**Important:** Disable snap during drag for smooth scrolling!

---

## Rule 4: Visual Indicators (Not Buttons)

Show pagination dots as indicators only:

```tsx
// ❌ WRONG - Clickable pagination
<button onClick={() => scrollToIndex(i)}>
  <div className="w-2 h-2 rounded-full" />
</button>

// ✅ RIGHT - Visual indicator only
<div
  className={`w-2 h-2 rounded-full transition-all ${
    i === activeIndex ? "w-6 bg-primary" : "bg-muted"
  }`}
/>
```

---

## Rule 5: Reset Scroll on Content Change

When tabs/filters change content, reset scroll position:

```tsx
const [activeTab, setActiveTab] = useState("tab1");
const scrollRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  scrollRef.current?.scrollTo({ left: 0, behavior: "smooth" });
}, [activeTab]);
```

---

## Complete Template

```tsx
import { useState, useRef } from "react";

interface ScrollableCardsProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
}

const ScrollableCards = ({ items, renderCard }: ScrollableCardsProps) => {
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
    scrollRef.current.scrollLeft = scrollLeft - (x - startX) * 1.5;
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div
      ref={scrollRef}
      className={`flex gap-6 overflow-x-auto py-4 scrollbar-hide select-none ${
        isDragging ? "cursor-grabbing" : "cursor-grab snap-x snap-mandatory"
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {items.map((item, i) => (
        <div key={i} className="flex-shrink-0 w-[340px] md:w-[380px] snap-start">
          {renderCard(item, i)}
        </div>
      ))}
    </div>
  );
};

export default ScrollableCards;
```

---

## CSS Utilities

Add to your global CSS:

```css
/* Hide scrollbar but keep functionality */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

---

## Checklist

- [ ] No ChevronLeft/ChevronRight buttons
- [ ] Drag-to-scroll implemented
- [ ] `cursor-grab` / `cursor-grabbing` visual feedback
- [ ] Snap disabled during drag
- [ ] `scrollbar-hide` class applied
- [ ] `select-none` to prevent text selection during drag
- [ ] Scroll reset on tab/filter change
- [ ] Pagination dots are visual only (not clickable)

---

## When NOT to Use Horizontal Scroll

- Fixed small number of items (2-3) → Use Grid
- Items must all be visible → Use Grid
- Primary navigation → Use Tabs or vertical list
