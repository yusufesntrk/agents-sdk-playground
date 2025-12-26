---
name: container-patterns
description: Container and layout breakout patterns for full-bleed sections, edge-to-edge scrolling, and responsive containers. Use when content needs to break out of its container.
---

# Container Patterns

Patterns for containers, breakouts, and full-bleed layouts.

---

## The Container Problem

Standard containers have padding that prevents edge-to-edge scrolling:

```
┌─────────────────────────────────────┐
│ padding │  content  │ padding │      ← Container with padding
└─────────────────────────────────────┘

When scrolling horizontally:
│ padding │ [Card] [Card] [Card] │ padding │
           ↑                      ↑
           Cards can't reach edges!
```

---

## Pattern 1: Full-Bleed Scroll Container

Use negative margins to break out, then restore padding:

```tsx
<section className="max-w-6xl mx-auto px-4 md:px-8">
  {/* Header stays within container */}
  <h2>Section Title</h2>

  {/* Scroll container breaks out */}
  <div className="-mx-4 md:-mx-8">
    <div className="flex gap-6 overflow-x-auto px-4 md:px-8 py-4">
      {/* Cards can now scroll to edges */}
      {cards.map(card => (
        <div className="flex-shrink-0 w-[340px]">...</div>
      ))}
    </div>
  </div>
</section>
```

### How It Works

```
Container:    |  px-4  |  content  |  px-4  |
                  ↓ -mx-4 removes margin
Breakout:     |        content               |
                  ↓ px-4 restores for cards
Cards:        |  px-4  |[Card][Card]|  px-4  |

Result: Cards scroll edge-to-edge but have proper spacing!
```

---

## Pattern 2: Responsive Breakout

Different breakouts at different screen sizes:

```tsx
{/* Desktop: no breakout needed (more space) */}
{/* Mobile/Tablet: full breakout */}
<div className="-mx-4 md:-mx-8 lg:mx-0">
  <div className="px-4 md:px-8 lg:px-0 overflow-x-auto">
    {/* Content */}
  </div>
</div>
```

---

## Pattern 3: Standard Container

Consistent container across pages:

```tsx
// Base container
<div className="max-w-6xl mx-auto px-4 md:px-8">

// Wide container
<div className="max-w-7xl mx-auto px-4 md:px-8">

// Full width with max
<div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
```

---

## Pattern 4: Section Wrapper

Standard section with vertical padding:

```tsx
<section className="py-16 md:py-24">
  <div className="max-w-6xl mx-auto px-4 md:px-8">
    {/* Section content */}
  </div>
</section>
```

### With Background Color

```tsx
<section className="py-16 md:py-24 bg-muted/30">
  <div className="max-w-6xl mx-auto px-4 md:px-8">
    {/* Content */}
  </div>
</section>
```

---

## Pattern 5: Avoiding Background Stripes

When containers have different backgrounds, you may see visible stripes:

```
Problem:
┌────────────────────────────────────┐
│ bg-gray-100                         │
│  ┌──────────────────────────────┐  │
│  │ bg-white   ← Different bg!   │  │
│  └──────────────────────────────┘  │
│                                     │  ← Visible stripe!
└────────────────────────────────────┘
```

### Solution: Consistent Backgrounds

```tsx
// ❌ WRONG - Creates visible stripe
<section className="bg-gray-100">
  <div className="relative bg-white"> {/* Different bg! */}
    {scrollContent}
  </div>
</section>

// ✅ RIGHT - No background on inner container
<section className="bg-gray-100">
  <div className="-mx-4 md:-mx-8">
    <div className="px-4 md:px-8 overflow-x-auto">
      {scrollContent}
    </div>
  </div>
</section>
```

---

## Pattern 6: Overflow Management

```tsx
// Section level: hide horizontal overflow
<section className="overflow-hidden">

  // Container level: allow scroll
  <div className="overflow-x-auto">
```

**Why?** Prevents horizontal scrollbar on page while allowing scroll in container.

---

## Pattern 7: Nested Containers

When you need different max-widths:

```tsx
<div className="max-w-7xl mx-auto px-4"> {/* Outer */}
  <div className="max-w-4xl mx-auto">    {/* Inner, centered */}
    {/* Narrower content */}
  </div>
</div>
```

---

## Common Max Widths

| Class | Width | Use Case |
|-------|-------|----------|
| `max-w-4xl` | 896px | Article content, forms |
| `max-w-5xl` | 1024px | Medium content |
| `max-w-6xl` | 1152px | Standard page content |
| `max-w-7xl` | 1280px | Wide layouts |
| `max-w-screen-xl` | 1280px | Full-width with cap |

---

## Complete Section Template

```tsx
<section className="py-16 md:py-24 bg-background overflow-hidden">
  <div className="max-w-6xl mx-auto px-4 md:px-8">
    {/* Section Header - stays contained */}
    <div className="text-center mb-12">
      <h2 className="text-3xl font-bold">Section Title</h2>
      <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
        Description text
      </p>
    </div>
  </div>

  {/* Scrollable Content - breaks out */}
  <div className="max-w-6xl mx-auto">
    <div className="-mx-4 md:-mx-8 lg:mx-0">
      <div className="flex gap-6 overflow-x-auto px-4 md:px-8 lg:px-0 py-4 scrollbar-hide">
        {items.map(item => (
          <div key={item.id} className="flex-shrink-0 w-[340px] md:w-[380px]">
            <Card item={item} />
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

---

## Checklist

- [ ] Consistent container max-width across pages
- [ ] Horizontal scroll containers use full-bleed pattern
- [ ] Negative margins match positive padding (`-mx-4` + `px-4`)
- [ ] No visible background stripes at container edges
- [ ] `overflow-hidden` on section if needed
- [ ] Responsive adjustments for different screen sizes
