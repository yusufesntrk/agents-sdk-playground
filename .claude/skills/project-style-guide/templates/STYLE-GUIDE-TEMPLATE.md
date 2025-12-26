# {{PROJECT_NAME}} Style Guide

> Auto-generated style guide from codebase analysis.
> Last updated: {{DATE}}

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing System](#spacing-system)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Animations](#animations)
7. [Component Patterns](#component-patterns)
8. [Icons](#icons)
9. [Responsive Breakpoints](#responsive-breakpoints)
10. [Dark Mode](#dark-mode)
11. [Component Checklist](#component-checklist)

---

## Color Palette

### Primary Colors

| Name | CSS Variable | HSL | Hex | Usage |
|------|--------------|-----|-----|-------|
| **Primary** | `--primary` | `{{PRIMARY_HSL}}` | `{{PRIMARY_HEX}}` | CTAs, Links, Akzente |
| **Secondary** | `--secondary` | `{{SECONDARY_HSL}}` | `{{SECONDARY_HEX}}` | Headlines, wichtige Texte |
| **Accent** | `--accent` | `{{ACCENT_HSL}}` | `{{ACCENT_HEX}}` | Hover-States, Gradients |

### Background Colors

| Name | CSS Variable | HSL | Hex | Usage |
|------|--------------|-----|-----|-------|
| **Background** | `--background` | `{{BG_HSL}}` | `{{BG_HEX}}` | Page Background |
| **Card** | `--card` | `{{CARD_HSL}}` | `{{CARD_HEX}}` | Cards, Widgets |
| **Muted** | `--muted` | `{{MUTED_HSL}}` | `{{MUTED_HEX}}` | Disabled, Dividers |

### Semantic Colors

| Name | CSS Variable | HSL | Hex | Usage |
|------|--------------|-----|-----|-------|
| **Success** | `--success` | `{{SUCCESS_HSL}}` | `{{SUCCESS_HEX}}` | Erfolg, Bestätigung |
| **Warning** | `--warning` | `{{WARNING_HSL}}` | `{{WARNING_HEX}}` | Warnung |
| **Destructive** | `--destructive` | `{{DESTRUCTIVE_HSL}}` | `{{DESTRUCTIVE_HEX}}` | Fehler, Löschen |
| **Info** | `--info` | `{{INFO_HSL}}` | `{{INFO_HEX}}` | Information |

### CSS Variables Implementation

```css
:root {
  --primary: {{PRIMARY_HSL}};
  --secondary: {{SECONDARY_HSL}};
  --accent: {{ACCENT_HSL}};
  --background: {{BG_HSL}};
  --card: {{CARD_HSL}};
  --muted: {{MUTED_HSL}};
  --success: {{SUCCESS_HSL}};
  --warning: {{WARNING_HSL}};
  --destructive: {{DESTRUCTIVE_HSL}};
}
```

---

## Typography

### Font Families

| Purpose | Font | Fallback | CSS Variable |
|---------|------|----------|--------------|
| **Headings** | {{HEADING_FONT}} | system-ui, sans-serif | `--font-heading` |
| **Body** | {{BODY_FONT}} | sans-serif | `--font-body` |
| **Mono** | {{MONO_FONT}} | monospace | `--font-mono` |

```css
font-family: '{{BODY_FONT}}', system-ui, sans-serif;
```

### Font Weights

| Weight | Name | Class | Usage |
|--------|------|-------|-------|
| 400 | Regular | `font-normal` | Body Text |
| 500 | Medium | `font-medium` | Labels, Buttons |
| 600 | Semibold | `font-semibold` | Subheadings |
| 700 | Bold | `font-bold` | Headlines |

### Font Sizes

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Captions, meta |
| `text-sm` | 14px | 20px | Labels, secondary |
| `text-base` | 16px | 24px | Body text |
| `text-lg` | 18px | 28px | Lead paragraphs |
| `text-xl` | 20px | 28px | Small headings |
| `text-2xl` | 24px | 32px | Section headings |
| `text-3xl` | 30px | 36px | Page headings |
| `text-4xl` | 36px | 40px | Hero headings |

### Heading Patterns

```tsx
// Section Heading
<h2 className="text-3xl md:text-4xl font-bold tracking-tight">

// Subheading
<p className="text-muted-foreground text-lg max-w-2xl">

// Card Title
<h3 className="text-xl font-semibold">
```

---

## Spacing System

### Spacing Scale

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| 1 | 4px | `gap-1`, `p-1` | Minimal spacing |
| 2 | 8px | `gap-2`, `p-2` | Tight grouping |
| 3 | 12px | `gap-3`, `p-3` | Compact elements |
| 4 | 16px | `gap-4`, `p-4` | Standard spacing |
| 6 | 24px | `gap-6`, `p-6` | Cards, sections |
| 8 | 32px | `gap-8`, `p-8` | Major separations |
| 12 | 48px | `gap-12` | Section gaps |
| 16 | 64px | `py-16` | Section padding |
| 24 | 96px | `py-24` | Hero padding |

### Container

```tsx
<div className="max-w-{{MAX_WIDTH}} mx-auto px-4 md:px-8">
```

| Breakpoint | Max Width | Side Padding |
|------------|-----------|--------------|
| Default | 100% | `px-4` (16px) |
| md | 768px | `px-6` (24px) |
| lg | 1024px | `px-8` (32px) |
| xl | {{MAX_WIDTH}} | `px-8` (32px) |

### Section Padding

```tsx
<section className="py-16 md:py-24 px-4 md:px-8">
```

| Pattern | Mobile | Desktop | Usage |
|---------|--------|---------|-------|
| Standard | `py-12` | `py-16` | Regular sections |
| Large | `py-16` | `py-24` | Hero, CTA |
| Compact | `py-8` | `py-12` | Sub-sections |

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

| Token | Value | Class | Usage |
|-------|-------|-------|-------|
| sm | 4px | `rounded-sm` | Small elements |
| md | 6px | `rounded-md` | Inputs |
| lg | 8px | `rounded-lg` | Buttons |
| xl | 12px | `rounded-xl` | Cards |
| 2xl | 16px | `rounded-2xl` | Large cards |
| 3xl | 24px | `rounded-3xl` | Hero elements |
| full | 9999px | `rounded-full` | Pills, avatars |

### Common Patterns

```tsx
// Buttons
className="rounded-lg"

// Cards
className="rounded-xl"

// Inputs
className="rounded-md"

// Avatars
className="rounded-full"
```

---

## Shadows

| Class | Box Shadow | Usage |
|-------|------------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, dropdowns |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Floating elements |

### Custom Shadows

```css
/* Card Shadow */
--shadow-card: 0 4px 20px rgba(0, 0, 0, 0.08);

/* Animation Container */
box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
```

---

## Animations

### Transitions

| Pattern | Duration | Easing | Class |
|---------|----------|--------|-------|
| Default | 150ms | ease-out | `transition-all duration-150` |
| Smooth | 300ms | ease-in-out | `transition-all duration-300` |
| Slow | 500ms | ease-in-out | `transition-all duration-500` |

### Standard Transition

```tsx
className="transition-all duration-300 ease-in-out"
```

### Hover Effects

```tsx
// Scale
className="hover:scale-105 transition-transform"

// Shadow
className="hover:shadow-lg transition-shadow"

// Color
className="hover:bg-primary/90 transition-colors"
```

### Keyframe Animations

| Name | Duration | Usage |
|------|----------|-------|
| `animate-fade-in` | 300ms | Einblenden |
| `animate-slide-up` | 400ms | Von unten |
| `animate-scale-in` | 300ms | Einzoomen |
| `animate-pulse` | 2s | Aufmerksamkeit |

---

## Component Patterns

### Buttons

```tsx
// Primary
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">

// Secondary
<Button variant="secondary">

// Outline
<Button variant="outline" className="border-border hover:bg-accent">

// Ghost
<Button variant="ghost">

// Destructive
<Button variant="destructive">
```

### Cards

```tsx
// Standard Card
<Card className="rounded-xl border bg-card p-6 shadow-sm">

// Interactive Card
<Card className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">

// Feature Card
<div className="p-6 rounded-2xl bg-card shadow-card border border-border/50">
```

### Inputs

```tsx
// Standard Input
<Input className="rounded-md border border-input px-3 py-2 focus:ring-2 focus:ring-ring">

// With Icon
<div className="relative">
  <Input className="pl-10" />
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" />
</div>
```

### Badges

```tsx
// Default
<Badge>Label</Badge>

// Outline
<Badge variant="outline">Label</Badge>

// Custom
<span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
```

---

## Icons

### Library
Using: **Lucide React**

```tsx
import { Check, ArrowRight, Mail } from "lucide-react";
```

### Icon Sizes

| Context | Size | Class |
|---------|------|-------|
| Inline text | 16px | `w-4 h-4` |
| Buttons | 20px | `w-5 h-5` |
| Features | 24px | `w-6 h-6` |
| Hero | 32px | `w-8 h-8` |
| Large display | 48px | `w-12 h-12` |

### Icon Colors

```tsx
// Primary
<Icon className="text-primary" />

// Muted
<Icon className="text-muted-foreground" />

// In Button
<Icon className="w-5 h-5 ml-2" />
```

---

## Responsive Breakpoints

| Name | Min Width | Tailwind Prefix |
|------|-----------|-----------------|
| Mobile | < 640px | (default) |
| sm | 640px | `sm:` |
| md | 768px | `md:` |
| lg | 1024px | `lg:` |
| xl | 1280px | `xl:` |
| 2xl | 1536px | `2xl:` |

### Common Responsive Patterns

```tsx
// Font sizes
className="text-2xl md:text-3xl lg:text-4xl"

// Grid columns
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"

// Padding
className="py-12 md:py-16 lg:py-24"

// Hide/Show
className="hidden md:block"
className="md:hidden"
```

---

## Dark Mode

### Toggle Method

```tsx
<html className="dark">
```

### Color Mapping

CSS variables automatically switch:

| Token | Light | Dark |
|-------|-------|------|
| `--background` | white | slate-900 |
| `--foreground` | slate-900 | slate-50 |
| `--card` | white | slate-800 |
| `--border` | slate-200 | slate-700 |

### Usage

Always use semantic tokens:

```tsx
// ✅ Correct
className="bg-background text-foreground"

// ❌ Wrong
className="bg-white text-black"
```

---

## Component Checklist

When creating new components:

### Basics
- [ ] Uses semantic color tokens (`bg-card`, `text-primary`)
- [ ] Responsive design (mobile-first)
- [ ] Consistent border radius
- [ ] Appropriate shadows
- [ ] Hover/focus states defined
- [ ] Dark mode compatible

### Accessibility
- [ ] Sufficient color contrast
- [ ] Focus visible states
- [ ] ARIA labels where needed
- [ ] Keyboard navigable

### Consistency
- [ ] Follows spacing scale
- [ ] Uses standard font sizes
- [ ] Icons sized appropriately
- [ ] Transitions match project standard

---

*Generated by project-style-guide skill*
