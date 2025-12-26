---
name: frontend-design
description: Use ONLY when creating a NEW design system from scratch for a project WITHOUT existing styles. NOT for projects with established Style Guides. For existing projects use project-specific guides (e.g. leyaltech-style-guide). For extracting styles from code use project-style-guide skill. For interactive style creation use /create-style-guide command.
version: 0.2.0
---

# Frontend Design

Create distinctive, production-grade frontend interfaces with high design quality and intentional aesthetic direction. This skill guides avoiding generic "AI slop" aesthetics and implementing bold, memorable design.

---

## ⚠️ WICHTIG: Wann diesen Skill NICHT verwenden!

**STOPP!** Bevor du diesen Skill verwendest, prüfe:

| Situation | Stattdessen verwenden |
|-----------|----------------------|
| Projekt hat `STYLE-GUIDE.md` | → Den vorhandenen Style Guide lesen |
| Projekt hat projekt-spezifischen Skill (z.B. `leyaltech-style-guide`) | → Diesen Skill verwenden |
| Website nachbauen/rebuilden | → `website-rebuild-research` für Original-Style |
| Style aus bestehendem Code extrahieren | → `project-style-guide` Skill |
| Neuen Style interaktiv mit User erstellen | → `/create-style-guide` Command |

**Dieser Skill ist NUR für:**
- Komplett neue Projekte OHNE bestehenden Style
- Kreative Exploration für neue Design-Richtungen
- Wenn explizit ein "einzigartiger/kreativer" Look gewünscht ist

---

## Design Thinking Process

Before coding, understand the context and commit to a BOLD aesthetic direction:

### 1. Purpose
- What problem does this interface solve?
- Who uses it?
- What's the context?

### 2. Tone
Pick an extreme aesthetic direction:
- Brutally minimal
- Maximalist chaos
- Retro-futuristic
- Organic/natural
- Luxury/refined
- Playful/toy-like
- Editorial/magazine
- Brutalist/raw
- Art deco/geometric
- Soft/pastel
- Industrial/utilitarian
- Experimental/cutting-edge

Choose one that's true to the purpose and commit fully.

### 3. Technical Constraints
- Framework (React, Vue, HTML, etc.)
- Performance requirements
- Accessibility needs
- Browser support

### 4. Differentiation
**CRITICAL**: What makes this UNFORGETTABLE?
- What's the one thing someone will remember?
- What's unexpected about this design?
- What makes it different from generic alternatives?

## Implementation Principles

Create working code (HTML/CSS/JS, React, Vue, etc.) that is:

✅ **Production-grade and functional** - Code works correctly
✅ **Visually striking and memorable** - Design stands out
✅ **Cohesive aesthetic** - Clear intentional point-of-view
✅ **Meticulously refined** - Every detail matters

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work—the key is intentionality, not intensity.

## Frontend Aesthetics Guidelines

### Typography

Choose fonts that are **beautiful, unique, and interesting**.

❌ **DON'T:**
- Generic fonts (Arial, Helvetica, system fonts)
- Over-used web fonts (Inter, Roboto)
- Default browser fonts

✅ **DO:**
- Distinctive display fonts for headings
- Refined body fonts with character
- Unusual pairings that work together
- Fonts that elevate the aesthetic
- Characterful choices that support the vision

**Strategy**: Pair distinctive display + refined body = cohesive elegance

### Color & Theme

Commit to a cohesive aesthetic, not timid choices.

**Principles:**
- CSS variables for consistency
- Dominant colors with sharp accents (outperform evenly-distributed palettes)
- Context-specific color story
- Dark/light theme that matches aesthetic
- Unexpected color combinations

❌ **DON'T:**
- Cliché color schemes (e.g., purple gradients on white)
- Generic color palettes
- Too many colors competing equally

✅ **DO:**
- Intentional color hierarchies
- Accent colors that surprise
- Cohesive color strategy
- Colors that match the aesthetic direction

### Motion & Animation

Use animations for effects and micro-interactions intentionally.

**High-Impact Moments:**
- One well-orchestrated page load with staggered reveals
- Scroll-triggering effects
- Hover states that surprise
- Meaningful transitions (not random movement)

**Implementation:**
- CSS-only solutions for HTML (preferred)
- Motion library for React (when available)
- Staggered reveals with animation-delay
- High-impact over scattered micro-interactions

### Spatial Composition

Create compelling layouts with intention.

**Techniques:**
- Unexpected layouts (break the grid)
- Asymmetry that feels intentional
- Overlap and depth
- Diagonal flow
- Grid-breaking elements
- Generous negative space OR controlled density

❌ **DON'T:**
- Predictable layouts
- Generic component patterns
- Safe centered alignments

✅ **DO:**
- Unexpected arrangements
- Context-specific layouts
- Bold compositional choices
- Tension through asymmetry

### Backgrounds & Visual Details

Create atmosphere and depth, not just solid colors.

**Techniques:**
- Contextual effects matching aesthetic
- Textures (noise, patterns, grain)
- Gradient meshes
- Layered transparencies
- Dramatic shadows
- Decorative borders
- Custom cursors
- Geometric patterns
- Unusual visual effects

**Purpose**: Atmosphere and character, not decoration.

## What NOT to Do

❌ **NEVER use generic AI aesthetics:**
- Overused font families (Inter, Roboto, Arial, Space Grotesk)
- Clichéd color schemes (particularly purple gradients)
- Predictable layouts and component patterns
- Cookie-cutter design lacking context-specific character

❌ **NEVER converge** on common choices across designs

❌ **NEVER hold back** on creativity

## Matching Complexity to Vision

**IMPORTANT**: Implementation complexity should match aesthetic ambition.

**Maximalist designs:**
- Elaborate code with extensive animations
- Complex visual effects and layers
- Rich interactions and details
- High visual density

**Minimalist/Refined designs:**
- Restraint and precision
- Careful attention to spacing
- Subtle details and refinement
- Generous negative space
- Typography excellence

**Either approach succeeds** when executed with intention and craftsmanship.

## Design Execution Framework

### Step 1: Define Aesthetic Direction
- Understand purpose and audience
- Choose one extreme aesthetic direction
- Write 1-2 sentences describing the vision
- Identify the differentiation point

### Step 2: Plan Visual Strategy
- Typography choices (display + body fonts)
- Color palette (dominant + accents)
- Motion philosophy (high-impact moments)
- Spatial approach (layout style)
- Detail strategy (backgrounds, effects)

### Step 3: Implement with Precision
- Code matches aesthetic ambition
- Every design decision is intentional
- Consistency through CSS variables
- Refinement in details
- Testing for functionality

### Step 4: Refine and Polish
- Review against aesthetic direction
- Check every detail matches vision
- Ensure consistency across pages
- Test interactions and animations
- Verify accessibility and performance

## Common Design Mistakes

**Generic Choices:**
- ❌ Using common UI frameworks default styles
- ❌ Picking "safe" colors and fonts
- ❌ Predictable component patterns
- ❌ No clear aesthetic direction

**Lack of Intentionality:**
- ❌ Mixing aesthetic directions
- ❌ Inconsistent design choices
- ❌ Details that conflict with vision
- ❌ Over-decorated or under-crafted

**Technical Issues:**
- ❌ Poor performance from overuse of effects
- ❌ Accessibility overlooked for aesthetics
- ❌ Code that doesn't match design
- ❌ Non-responsive implementations

## Best Practices

✅ **DO:**
- Choose a bold, clear aesthetic direction
- Execute with precision and intention
- Use distinctive typography and color
- Create high-impact visual moments
- Match code complexity to ambition
- Test for performance and accessibility
- Iterate on refinement details
- Document design decisions

✅ **Vary designs:**
- Different fonts across projects
- Different color schemes
- Different aesthetic directions
- Context-specific character
- Unique per project/purpose

✅ **Be intentional:**
- Every choice serves the vision
- Consistency throughout
- Details matter
- Refinement shows craftsmanship

## Implementation Workflow

To create a distinctive frontend design:

1. **Understand Context**: Purpose, audience, constraints
2. **Choose Aesthetic**: One extreme direction, committed vision
3. **Plan Visually**: Typography, color, motion, layout, details
4. **Implement**: Code matches aesthetic ambition
5. **Refine**: Every detail intentional and polished
6. **Test**: Functionality, performance, accessibility
7. **Iterate**: Polish until vision is fully realized

## Key Principles Summary

- **BOLD** aesthetic direction (not timid)
- **DISTINCTIVE** choices (not generic)
- **INTENTIONAL** decisions (not accidental)
- **COHESIVE** execution (unified vision)
- **REFINED** details (crafted, not rushed)
- **FUNCTIONAL** code (production-ready)
- **MEMORABLE** result (stands out)

Remember: Claude is capable of extraordinary creative work. Don't hold back—show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
