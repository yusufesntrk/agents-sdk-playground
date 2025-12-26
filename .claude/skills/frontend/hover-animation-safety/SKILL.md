---
name: hover-animation-safety
description: Safe hover and animation patterns that don't cause layout issues. Use when implementing hover effects, transitions, or animations on cards and interactive elements.
---

# Hover & Animation Safety

Patterns for hover effects that don't break layouts.

---

## The Scale Problem

`hover:scale-*` is dangerous because it makes elements overlap:

```
Normal state:
┌─────────┐  ┌─────────┐  ┌─────────┐
│  Card   │  │  Card   │  │  Card   │
└─────────┘  └─────────┘  └─────────┘

On hover with scale:
┌─────────┐  ┌───────────┐  ┌─────────┐
│  Card   │  │   Card    │  │  Card   │
└─────────┘  │  SCALED   │  └─────────┘
             └───────────┘
                  ↑
            Overlaps neighbors!
```

**Even worse:** Cards under tabs/navigation can overlap into them.

---

## Rule 1: No Scale on Constrained Elements

```tsx
// ❌ DANGEROUS - Scale causes overlap
<div className="hover:scale-105">Card</div>
<div className="hover:scale-[1.02]">Card</div>
<div className="group-hover:scale-110">Image</div>

// ✅ SAFE - No size change
<div className="hover:shadow-lg">Card</div>
<div className="hover:border-primary/30">Card</div>
```

---

## Safe Hover Alternatives

### Border Highlight

```tsx
<div className="border border-transparent hover:border-primary/30 transition-colors">
```

### Background Change

```tsx
<div className="hover:bg-muted/50 transition-colors">
<div className="hover:bg-primary/5 transition-colors">
```

### Shadow Elevation

```tsx
<div className="shadow-sm hover:shadow-lg transition-shadow">
<div className="hover:shadow-xl transition-shadow duration-300">
```

### Border + Background Combo

```tsx
<div className="border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
```

### Opacity Change

```tsx
<div className="opacity-90 hover:opacity-100 transition-opacity">
```

---

## When Scale IS Safe

Scale is okay when:
1. Element has padding/margin around it
2. It's the only element (hero image)
3. It's inside an `overflow-hidden` container

### Safe Scale: Inside overflow-hidden

```tsx
<div className="overflow-hidden rounded-2xl">
  <img className="hover:scale-105 transition-transform duration-500" />
</div>
```

### Safe Scale: Isolated element

```tsx
<div className="p-8"> {/* Plenty of padding */}
  <div className="hover:scale-105 transition-transform">
    Isolated card
  </div>
</div>
```

---

## Animation Timing

### Recommended Durations

| Effect | Duration | Use Case |
|--------|----------|----------|
| Color/opacity | `duration-200` | Buttons, links |
| Shadow | `duration-300` | Cards, elevations |
| Transform | `duration-300` to `duration-500` | Images, large elements |

### Easing

```tsx
// Default (good for most)
transition-all

// Smooth out
transition-all ease-out

// Bounce effect
transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)]
```

---

## Group Hover Patterns

For child elements that react to parent hover:

### Image Zoom in Card

```tsx
<div className="group overflow-hidden rounded-2xl">
  <img
    className="group-hover:scale-105 transition-transform duration-500"
  />
  <div className="p-6">
    <h3 className="group-hover:text-primary transition-colors">
      Title
    </h3>
  </div>
</div>
```

### Reveal Element on Hover

```tsx
<div className="group relative">
  <img src={thumbnail} />
  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
    <PlayIcon />
  </div>
</div>
```

---

## Focus States

Don't forget keyboard users:

```tsx
<button className="
  hover:bg-primary/90
  focus:ring-2 focus:ring-primary focus:ring-offset-2
  transition-all
">
```

### Focus-Visible (Modern)

```tsx
<button className="
  hover:bg-primary/90
  focus-visible:ring-2 focus-visible:ring-primary
">
```

---

## Complete Safe Card Example

```tsx
<div
  className="
    h-full rounded-2xl p-6
    bg-card border border-border/50
    hover:border-primary/30 hover:shadow-lg
    transition-all duration-300
    group
  "
>
  {/* Image with safe scale (inside overflow-hidden) */}
  <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
    <img
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
    />
  </div>

  {/* Title with color change */}
  <h3 className="font-bold group-hover:text-primary transition-colors">
    {title}
  </h3>

  {/* Description */}
  <p className="text-muted-foreground mt-2">
    {description}
  </p>
</div>
```

---

## Anti-Patterns

### Don't: Scale cards in tight grids

```tsx
// ❌ WRONG
<div className="grid grid-cols-3 gap-4">
  <div className="hover:scale-105">...</div>  // Will overlap!
</div>
```

### Don't: Scale cards under navigation

```tsx
// ❌ WRONG
<nav>Tabs here</nav>
<div className="hover:scale-[1.02]">  // May overlap into nav!
```

### Don't: Long transition on frequently hovered

```tsx
// ❌ WRONG - Feels sluggish
<button className="transition-all duration-700">
```

---

## Checklist

- [ ] No `hover:scale-*` on cards in grids
- [ ] No `hover:scale-*` on elements near navigation
- [ ] Scale only inside `overflow-hidden` containers
- [ ] Using border/shadow/background instead of scale
- [ ] Transition durations are appropriate (200-300ms)
- [ ] Focus states included for accessibility
- [ ] Group hover used correctly (parent has `group`, children have `group-hover:`)
