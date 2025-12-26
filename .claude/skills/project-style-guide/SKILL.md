---
name: project-style-guide
description: Use to EXTRACT and DOCUMENT styles from an EXISTING codebase. Analyzes tailwind.config, CSS variables, and components to generate STYLE-GUIDE.md. NOT for creating new styles - use /create-style-guide command for that. NOT for creative design direction - use frontend-design skill for that.
version: 0.2.0
---

# Project Style Guide Generator

Generate comprehensive, project-specific style guides by analyzing existing codebase patterns, configurations, and component libraries.

---

## ⚠️ Wann welchen Style-Skill verwenden?

| Situation | Skill/Command |
|-----------|---------------|
| **Style aus Code extrahieren** (dieses Projekt dokumentieren) | ✅ Dieser Skill (`project-style-guide`) |
| **Neuen Style interaktiv erstellen** (User nach Präferenzen fragen) | → `/create-style-guide` Command |
| **Kreativen Look entwickeln** (einzigartiges Design) | → `frontend-design` Skill |
| **Original-Website Style übernehmen** (Rebuild) | → `website-rebuild-research` Skill |
| **Bestehenden projekt-Style anwenden** | → Projekt-spezifischer Skill (z.B. `leyaltech-style-guide`) |

---

## Trigger Conditions

Activate this skill when the user:
- Wants to **document existing** styles/patterns
- Needs to **extract** color palette, typography from code
- Asks to **analyze** the current design tokens
- Says "extract styles", "document design system", "what styles does this project use"

**NOT for:** Creating new designs, choosing fonts/colors, creative direction

---

## Analysis Process

### Phase 1: Configuration Discovery

Scan for design configuration files:

```bash
# Find Tailwind config
find . -name "tailwind.config.*" -o -name "tailwind.config.ts" -o -name "tailwind.config.js"

# Find CSS variables
grep -r "^:root\|--[a-z]" --include="*.css" src/

# Find theme files
find . -name "*theme*" -o -name "*tokens*" | grep -E "\.(ts|js|css|json)$"
```

### Phase 2: Color Extraction

**From tailwind.config.ts/js:**
```typescript
// Look for theme.extend.colors
colors: {
  primary: { ... },
  secondary: { ... }
}
```

**From CSS Variables (globals.css, index.css):**
```css
:root {
  --primary: 210 100% 50%;
  --background: 0 0% 100%;
}
```

**From shadcn/ui (components.json):**
```json
{
  "style": "default",
  "cssVariables": true
}
```

### Phase 3: Typography Extraction

Analyze:
- Font family declarations (`font-family`, `fontFamily`)
- Font sizes (`text-*` classes, `fontSize` config)
- Font weights used in components
- Line heights and letter spacing

### Phase 4: Spacing & Layout

Extract:
- Container max-widths
- Section paddings (common patterns: `py-16`, `py-24`)
- Grid configurations
- Gap patterns

### Phase 5: Component Patterns

Scan component directories for:
- Border radius patterns (`rounded-*`)
- Shadow usage (`shadow-*`)
- Animation classes
- Hover/focus states
- Common component structures

---

## Output Structure

Generate a `STYLE-GUIDE.md` file with these sections:

### 1. Color Palette

```markdown
## Color Palette

### Primary Colors
| Name | CSS Variable | HSL | Hex | Usage |
|------|--------------|-----|-----|-------|
| Primary | `--primary` | `210 100% 50%` | `#0080FF` | CTAs, Links |

### Semantic Colors
| Name | Variable | Usage |
|------|----------|-------|
| Success | `--success` | Confirmations |
| Warning | `--warning` | Alerts |
| Destructive | `--destructive` | Errors, Delete |
```

### 2. Typography

```markdown
## Typography

### Font Families
| Purpose | Font | Fallback | Usage |
|---------|------|----------|-------|
| Headings | Inter | system-ui | h1-h6, titles |
| Body | Inter | sans-serif | Paragraphs |

### Font Sizes
| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| text-xs | 12px | 16px | Captions |
| text-sm | 14px | 20px | Labels |
| text-base | 16px | 24px | Body |

### Font Weights
| Weight | Class | Usage |
|--------|-------|-------|
| 400 | font-normal | Body text |
| 500 | font-medium | Labels, buttons |
| 600 | font-semibold | Subheadings |
| 700 | font-bold | Headings |
```

### 3. Spacing System

```markdown
## Spacing

### Spacing Scale
| Token | Value | Usage |
|-------|-------|-------|
| gap-2 | 8px | Tight grouping |
| gap-4 | 16px | Standard spacing |
| gap-6 | 24px | Section elements |
| gap-8 | 32px | Major sections |

### Container
| Breakpoint | Max Width | Padding |
|------------|-----------|---------|
| Default | 100% | px-4 |
| md | 768px | px-6 |
| lg | 1024px | px-8 |
| xl | 1280px | px-8 |

### Section Padding
| Pattern | Mobile | Desktop | Usage |
|---------|--------|---------|-------|
| Standard | py-12 | py-16 | Regular sections |
| Large | py-16 | py-24 | Hero, CTA |
```

### 4. Border Radius

```markdown
## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| rounded-sm | 4px | Small elements |
| rounded-md | 6px | Inputs |
| rounded-lg | 8px | Buttons |
| rounded-xl | 12px | Cards |
| rounded-2xl | 16px | Large cards, modals |
| rounded-full | 9999px | Pills, avatars |
```

### 5. Shadows

```markdown
## Shadows

| Class | Usage |
|-------|-------|
| shadow-sm | Subtle elevation |
| shadow-md | Cards, dropdowns |
| shadow-lg | Modals, popovers |
| shadow-xl | Floating elements |
```

### 6. Animations

```markdown
## Animations

### Transitions
| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| Default | 150ms | ease-out | Buttons, links |
| Smooth | 300ms | ease-in-out | Cards, modals |

### Keyframe Animations
| Name | Duration | Usage |
|------|----------|-------|
| fade-in | 300ms | Entering elements |
| slide-up | 400ms | Modals, notifications |
```

### 7. Components

```markdown
## Component Patterns

### Buttons
- Primary: `bg-primary text-primary-foreground hover:bg-primary/90`
- Secondary: `bg-secondary text-secondary-foreground`
- Outline: `border border-input hover:bg-accent`

### Cards
- Default: `rounded-xl border bg-card p-6 shadow-sm`
- Interactive: `hover:shadow-md transition-shadow`

### Inputs
- Standard: `rounded-md border border-input px-3 py-2`
- Focus: `focus:ring-2 focus:ring-ring`
```

### 8. Icons

```markdown
## Icons

### Library
Using: Lucide React

### Sizes
| Context | Size | Class |
|---------|------|-------|
| Inline | 16px | w-4 h-4 |
| Button | 20px | w-5 h-5 |
| Feature | 24px | w-6 h-6 |
| Hero | 32px+ | w-8 h-8 |
```

### 9. Responsive Breakpoints

```markdown
## Breakpoints

| Name | Width | Prefix |
|------|-------|--------|
| Mobile | < 640px | (default) |
| sm | >= 640px | sm: |
| md | >= 768px | md: |
| lg | >= 1024px | lg: |
| xl | >= 1280px | xl: |
| 2xl | >= 1536px | 2xl: |
```

### 10. Dark Mode

```markdown
## Dark Mode

### Implementation
- Toggle: `.dark` class on `<html>`
- CSS Variables auto-switch

### Color Mapping
| Light | Dark |
|-------|------|
| bg-white | bg-slate-900 |
| text-slate-900 | text-slate-50 |
```

---

## File Locations to Analyze

| File | Contains |
|------|----------|
| `tailwind.config.ts` | Colors, fonts, spacing, animations |
| `src/index.css` or `globals.css` | CSS variables, base styles |
| `components.json` | shadcn/ui configuration |
| `src/components/ui/` | Component patterns |
| `src/lib/utils.ts` | Utility functions (cn, etc.) |

---

## Generation Command

After analysis, create the style guide:

```bash
# Create in project root or docs folder
touch STYLE-GUIDE.md
# or
touch docs/STYLE-GUIDE.md
```

---

## Quality Checklist

Before finalizing the style guide:

- [ ] All colors documented with HSL, Hex, and usage
- [ ] Typography includes font family, sizes, weights
- [ ] Spacing tokens are complete
- [ ] Border radius patterns documented
- [ ] Shadow usage documented
- [ ] Animation/transition patterns included
- [ ] Component patterns with actual class examples
- [ ] Icon library and sizing documented
- [ ] Responsive breakpoints listed
- [ ] Dark mode colors/patterns (if applicable)
- [ ] All values extracted from actual codebase (not assumed)

---

## Best Practices

### DO:
- Extract actual values from config files
- Include usage context for each token
- Document both Tailwind classes AND CSS variables
- Show real component class patterns
- Note any inconsistencies found

### DON'T:
- Assume default values without checking
- Document unused tokens
- Mix project styles with framework defaults
- Skip semantic color mappings
