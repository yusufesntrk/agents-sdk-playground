# Style Guide Analysis Patterns

Detailed patterns for extracting design tokens from different sources.

---

## Tailwind Config Analysis

### Color Extraction

```javascript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      // Direct hex
      primary: '#0066CC',

      // With shades
      primary: {
        DEFAULT: '#0066CC',
        50: '#E6F0FF',
        500: '#0066CC',
        900: '#003366',
      },

      // CSS variable reference
      primary: 'hsl(var(--primary))',
    }
  }
}
```

**Extract:** Color name, value type (hex/hsl/css-var), shades if present.

### Font Extraction

```javascript
fontFamily: {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  heading: ['Poppins', 'Arial', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
}
```

**Extract:** Font purpose, primary font, fallbacks.

### Spacing Customization

```javascript
spacing: {
  '18': '4.5rem',
  '88': '22rem',
}
```

**Extract:** Custom spacing tokens beyond Tailwind defaults.

### Border Radius

```javascript
borderRadius: {
  'xl': '1rem',
  '2xl': '1.5rem',
}
```

### Animation Config

```javascript
animation: {
  'fade-in': 'fadeIn 0.3s ease-out',
  'slide-up': 'slideUp 0.4s ease-out',
},
keyframes: {
  fadeIn: {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
}
```

---

## CSS Variables Analysis

### globals.css / index.css Pattern

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode values */
  }
}
```

**Extract:**
- All CSS variable names
- HSL values
- Light/dark mode pairs
- `--radius` value

### HSL to Hex Conversion

```javascript
// HSL format in CSS: H S% L%
// Example: 221.2 83.2% 53.3%

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
```

---

## Component Pattern Analysis

### Button Variants

```tsx
// Look for buttonVariants or Button component
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
  }
)
```

**Extract:** Variant names, classes, sizes.

### Card Patterns

```tsx
// Common card patterns
<Card className="rounded-xl border bg-card text-card-foreground shadow">
<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
<CardContent className="p-6 pt-0">
```

### Input Patterns

```tsx
<Input
  className={cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
    "text-sm ring-offset-background",
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "placeholder:text-muted-foreground",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50"
  )}
/>
```

---

## shadcn/ui Detection

### components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**Extract:**
- Base color theme
- CSS variables usage
- Component aliases

---

## File Search Commands

```bash
# Find all style-related files
find . -name "*.css" -o -name "tailwind.config.*" -o -name "components.json" | head -20

# Find CSS variable definitions
grep -r "^:root\|--[a-z]" --include="*.css" src/

# Find color definitions in Tailwind
grep -A 50 "colors:" tailwind.config.* | head -60

# Find font definitions
grep -A 10 "fontFamily:" tailwind.config.*

# Find animation definitions
grep -A 30 "animation:" tailwind.config.*

# Find all UI components
ls -la src/components/ui/

# Check for theme toggle
grep -r "dark\|theme" --include="*.tsx" src/ | head -20
```

---

## Common Frameworks

### shadcn/ui (Most Common)
- CSS variables for colors
- Tailwind for utilities
- Radix UI primitives
- `cn()` utility function

### Chakra UI
- Theme object
- Style props
- Color mode

### Material UI
- Theme provider
- sx prop
- createTheme()

### Ant Design
- ConfigProvider
- Less variables
- Design tokens

---

## Output Format Guidelines

### Color Documentation

Always include:
1. **Name** - Semantic name (primary, success)
2. **CSS Variable** - `--primary`
3. **HSL** - Raw HSL value
4. **Hex** - Converted hex for reference
5. **Usage** - When to use this color

### Typography Documentation

Always include:
1. **Font Family** - With fallbacks
2. **Sizes** - All used sizes with line-heights
3. **Weights** - All used weights
4. **Patterns** - Common class combinations

### Spacing Documentation

Always include:
1. **Scale** - Complete spacing scale used
2. **Containers** - Max widths, paddings
3. **Sections** - Common section spacing
4. **Grids** - Gap patterns

---

## Quality Checks

After generating style guide:

1. **Completeness** - All tokens documented
2. **Accuracy** - Values match source files
3. **Usability** - Examples are copy-pasteable
4. **Consistency** - Format is uniform
5. **Dark Mode** - Both themes documented if present
