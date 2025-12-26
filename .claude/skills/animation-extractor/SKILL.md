---
name: animation-extractor
description: This skill should be used when the user asks to "extract animations from website", "copy animation code", "get CSS animation from page", "scrape animation", "convert animation to React", or needs to replicate HTML/CSS/JS animations from an existing website into a React project.
---

# Animation Extractor

Extract and convert HTML/CSS/JS animations from websites into React components.

## When to Use

- Extracting complex CSS/SVG animations from websites
- Replicating visual animations from reference sites
- Converting vanilla JS animations to React with useEffect
- Scraping embedded animation code from page source
- Migrating animations during website redesign

## Core Concept

Animations on websites are often embedded directly in the HTML page source with:
- **CSS keyframes** for the animation definitions
- **JavaScript** for timeline/sequencing logic
- **SVG or HTML elements** as the animation targets

The key insight: animations are NOT loaded separately but embedded in the page source, wrapped in identifiable container elements (e.g., `#calendar-animation-wrapper`).

## Four-Step Workflow

### Step 1: Fetch Full Page Source with Playwright

Use Playwright to get the complete page HTML (not just rendered content):

```javascript
// get-source.cjs
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Loading page...');
  await page.goto('https://example.com', {
    waitUntil: 'networkidle',
    timeout: 60000
  });

  // Get the full page source
  const content = await page.content();

  // Save to file
  fs.writeFileSync('page-source.html', content);
  console.log('Page source saved');
  console.log(`Total length: ${content.length} characters`);

  await browser.close();
})();
```

**Run with:**
```bash
node get-source.cjs
```

### Step 2: Search for Animation Wrappers

Animations are typically wrapped in identifiable containers. Search for them:

```bash
# Search for animation wrapper IDs
grep -n "animation-wrapper" page-source.html

# Common patterns to search for:
grep -n "keyframes" page-source.html
grep -n "@keyframes" page-source.html
grep -n "animation:" page-source.html
```

This reveals line numbers where animations are defined.

### Step 3: Extract the Animation Block

Read the specific line range containing the complete animation:

```bash
# Read lines 817-1389 for example
sed -n '817,1389p' page-source.html > animation-block.html
```

The extracted block contains:
- `<style>` with CSS keyframes
- HTML/SVG markup
- `<script>` with animation timeline

### Step 4: Convert to React Component

Transform the extracted code into a React component:

```tsx
import { useEffect, useRef } from "react";

const MyAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    const runAnimation = () => {
      const container = containerRef.current;
      if (!container) return;

      // Clear previous timeouts
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];

      // Reset all elements
      const element = container.querySelector("#my-element") as HTMLElement;
      if (element) element.classList.remove("animate");

      // Timeline from original script
      timeoutsRef.current.push(
        setTimeout(() => {
          element?.classList.add("animate");
        }, 1000)
      );

      // Loop animation
      timeoutsRef.current.push(setTimeout(runAnimation, 8000));
    };

    runAnimation();

    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  return (
    <div ref={containerRef}>
      <style>{`
        /* Paste extracted CSS keyframes here */
        @keyframes myAnimation {
          0% { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate {
          animation: myAnimation 0.6s ease-out forwards;
        }
      `}</style>

      {/* Paste extracted HTML/SVG here */}
      <div id="my-element">...</div>
    </div>
  );
};

export default MyAnimation;
```

## Key Conversion Rules

### CSS Keyframes
- Copy `@keyframes` rules as-is into `<style>{``}</style>` tag
- Prefix selectors with component-specific class to avoid conflicts

### JavaScript Timeline to useEffect
Original JS:
```javascript
const timeline = [
  { time: 1000, action: () => element.classList.add("show") },
  { time: 2000, action: () => other.classList.add("fade") }
];
timeline.forEach(e => setTimeout(e.action, e.time));
```

React equivalent:
```tsx
useEffect(() => {
  const t1 = setTimeout(() => element.classList.add("show"), 1000);
  const t2 = setTimeout(() => other.classList.add("fade"), 2000);
  return () => { clearTimeout(t1); clearTimeout(t2); };
}, []);
```

### SVG Attributes
Convert kebab-case to camelCase:
- `stroke-width` -> `strokeWidth`
- `text-anchor` -> `textAnchor`
- `font-family` -> `fontFamily`
- `stop-color` -> `stopColor`

### Inline Styles
Convert style strings to objects:
```html
<!-- Original -->
<div style="opacity: 0; transform: scale(1);">

<!-- React -->
<div style={{ opacity: 0, transform: 'scale(1)' }}>
```

## Quick Reference

| Step | Tool | Purpose |
|------|------|---------|
| 1 | Playwright | Fetch full page source |
| 2 | grep | Find animation wrappers |
| 3 | sed | Extract specific line range |
| 4 | Manual | Convert to React component |

## Common Animation Patterns

### Looping Animations
Add a timeout at the end that reruns the animation:
```tsx
// After all animations complete, restart
timeoutsRef.current.push(setTimeout(runAnimation, totalDuration));
```

### Staggered Elements
Use nth-child delays in CSS or sequential timeouts:
```css
.item:nth-child(1) { animation-delay: 0.1s; }
.item:nth-child(2) { animation-delay: 0.2s; }
.item:nth-child(3) { animation-delay: 0.3s; }
```

### Reset Before Replay
Always reset element states before restarting:
```tsx
element.classList.remove("animate", "show", "fade");
element.style.opacity = "";
```

## Example: Full Extraction

**Task:** Extract calendar animation from leyaltech.de

**1. Fetch source:**
```bash
node get-source.cjs
# Creates page-source.html (187,324 chars)
```

**2. Find animation:**
```bash
grep -n "calendar-animation-wrapper" page-source.html
# Output: line 1780
```

**3. Extract block:**
Read from wrapper start to closing tag (lines 1780-2100)

**4. Convert:**
- Copy `<style>` content with keyframes
- Convert SVG to JSX (camelCase attributes)
- Transform timeline array to useEffect with timeouts
- Add ref for DOM queries
- Implement cleanup on unmount

**Result:** CalendarAnimation.tsx - exact replica of original

## Troubleshooting

### Animation doesn't loop
Ensure you call `runAnimation()` again after total duration.

### Elements don't reset
Clear all animation classes and inline styles before restart.

### CSS conflicts
Prefix all class names with component-specific identifier.

### Timeouts leak on unmount
Store timeout IDs in ref and clear in useEffect cleanup.

## Bundled Resources

- `scripts/get-source.cjs` - Playwright script to fetch page source
- `scripts/extract-animation.cjs` - Extract animation block by wrapper ID

### Usage Examples

**Fetch page source:**
```bash
node .claude/skills/animation-extractor/scripts/get-source.cjs https://example.com
```

**Extract specific animation:**
```bash
node .claude/skills/animation-extractor/scripts/extract-animation.cjs page-source.html calendar-animation-wrapper output.html
```
