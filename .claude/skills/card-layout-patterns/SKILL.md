---
name: card-layout-patterns
description: Universal card layout patterns for consistent heights, alignment, and responsive grids. Use when implementing card grids, feature lists, or any repeating card-based UI.
---

# Card Layout Patterns

Best practices for card-based layouts with consistent alignment.

---

## Decision Tree: Grid vs Horizontal Scroll

```
How many items?
│
├── Fixed count that matches columns (3, 6, 9 for 3-col)?
│   └── YES → Use GRID
│
├── Dynamic/unknown count?
│   └── YES → Use HORIZONTAL SCROLL
│
└── Could items be added later?
    └── YES → Use HORIZONTAL SCROLL
```

**Why?** Grids with mismatched item counts create "orphaned" items:

```
┌───┐ ┌───┐ ┌───┐
│ 1 │ │ 2 │ │ 3 │  ← Full row
└───┘ └───┘ └───┘
┌───┐
│ 4 │               ← Orphaned! Looks broken
└───┘
```

---

## Pattern 1: Cards with Bottom-Aligned Elements

When cards have footers (buttons, progress bars, etc.), they must align:

### The Problem

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Title   │  │ Title   │  │ Title   │
│         │  │ Long    │  │         │
│ Short   │  │ desc    │  │ Medium  │
│ desc    │  │ that    │  │ length  │
│         │  │ wraps   │  │ desc    │
│ [Button]│  │         │  │         │
└─────────┘  │ [Button]│  │ [Button]│  ← Buttons NOT aligned!
             └─────────┘  └─────────┘
```

### The Solution: Flexbox

```tsx
// ✅ CORRECT
<div className="h-full flex flex-col rounded-2xl p-6">
  {/* Fixed content */}
  <div className="w-12 h-12 rounded-xl bg-primary/10 mb-4">
    <Icon />
  </div>

  <h3 className="text-xl font-bold mb-3">Title</h3>

  {/* Variable content - takes remaining space */}
  <p className="text-muted-foreground flex-1">
    Description with variable length...
  </p>

  {/* Footer - always at bottom */}
  <div className="mt-6 pt-4 border-t">
    <Button>Action</Button>
  </div>
</div>
```

### Key Classes

| Element | Class | Purpose |
|---------|-------|---------|
| Container | `flex flex-col` | Enable flex layout |
| Container | `h-full` | Fill parent height |
| Variable content | `flex-1` | Grow to fill space |
| Footer | `mt-auto` or after `flex-1` | Push to bottom |

---

## Pattern 2: Equal Height Cards in Grid

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <div key={item.id} className="h-full flex flex-col bg-card rounded-2xl p-6">
      {/* Card content */}
    </div>
  ))}
</div>
```

**Important:** Parent grid handles equal heights, but cards need `h-full` to fill.

---

## Pattern 3: Horizontal Scroll Cards

For dynamic lists, use horizontal scroll instead of grid:

```tsx
<div className="flex gap-6 overflow-x-auto snap-x snap-mandatory">
  {items.map((item) => (
    <div
      key={item.id}
      className="flex-shrink-0 w-[340px] md:w-[380px] snap-start"
    >
      <div className="h-full flex flex-col bg-card rounded-2xl p-6">
        {/* Card content */}
      </div>
    </div>
  ))}
</div>
```

### Key Classes for Scroll Items

| Class | Purpose |
|-------|---------|
| `flex-shrink-0` | Prevent cards from shrinking |
| `w-[340px]` | Fixed width for consistency |
| `snap-start` | Snap point for scroll |

---

## Pattern 4: Responsive Card Widths

```tsx
// Grid approach
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

// Scroll approach - card width changes
<div className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[380px]">
```

---

## Pattern 5: Card with Image

```tsx
<div className="h-full flex flex-col rounded-2xl overflow-hidden bg-card">
  {/* Image section - fixed aspect ratio */}
  <div className="relative aspect-[4/3] overflow-hidden">
    <img
      src={image}
      alt={title}
      className="w-full h-full object-cover"
    />
  </div>

  {/* Content section */}
  <div className="flex flex-col flex-1 p-6">
    <h3 className="font-bold mb-2">{title}</h3>
    <p className="text-muted-foreground flex-1">{description}</p>
    <div className="mt-4 pt-4 border-t">
      <Button>View</Button>
    </div>
  </div>
</div>
```

---

## Pattern 6: Feature Cards (Icon + Title + Description)

```tsx
<div className="h-full flex flex-col p-6 rounded-2xl bg-card border border-border/50">
  {/* Icon */}
  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-primary" />
  </div>

  {/* Title */}
  <h3 className="text-lg font-bold mb-2">{title}</h3>

  {/* Description - flex-1 if footer exists */}
  <p className="text-muted-foreground text-sm">
    {description}
  </p>
</div>
```

---

## Anti-Patterns

### Don't: Inconsistent padding

```tsx
// ❌ WRONG
<div className="p-4">Card 1</div>
<div className="p-6">Card 2</div>  // Different padding!
```

### Don't: Missing h-full

```tsx
// ❌ WRONG - Cards won't be equal height
<div className="grid grid-cols-3 gap-6">
  <div className="bg-card p-6">...</div>  // No h-full!
</div>
```

### Don't: Grid with wrong item count

```tsx
// ❌ WRONG - 4 items in 3-column grid = orphaned item
<div className="grid grid-cols-3 gap-6">
  {fourItems.map(...)}
</div>
```

---

## Quick Reference

```tsx
// Standard card container
className="h-full flex flex-col rounded-2xl p-6 bg-card border border-border/50"

// Variable content section
className="flex-1 text-muted-foreground"

// Footer section
className="mt-6 pt-4 border-t border-border"

// Scroll item wrapper
className="flex-shrink-0 w-[340px] md:w-[380px] snap-start"
```

---

## Checklist

- [ ] Cards use `h-full flex flex-col` if they have footers
- [ ] Variable content uses `flex-1`
- [ ] Grid item count matches column count (or use scroll)
- [ ] Scroll items have `flex-shrink-0` and fixed width
- [ ] Consistent padding across all cards
- [ ] `overflow-hidden` on cards with images
