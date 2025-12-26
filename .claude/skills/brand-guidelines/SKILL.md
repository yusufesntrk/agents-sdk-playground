---
name: brand-guidelines
description: Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
version: 1.0.0
license: Complete terms in LICENSE.txt
---

# Anthropic Brand Guidelines

This skill provides access to Anthropic's official brand identity and style resources for consistent visual design applications.

## Use Cases

- Branding and corporate identity
- Visual identity implementation
- Post-processing and styling
- Brand color application
- Typography standards
- Visual design applications

## Color Specifications

### Main Colors

| Name       | Hex       | Usage                    |
|------------|-----------|--------------------------|
| Dark       | `#141413` | Primary text, backgrounds |
| Light      | `#faf9f5` | Light backgrounds         |
| Mid-Gray   | `#b0aea5` | Secondary elements        |
| Light-Gray | `#e8e6dc` | Borders, dividers         |

### Accent Colors

| Name   | Hex       | Usage                    |
|--------|-----------|--------------------------|
| Orange | `#d97757` | CTAs, highlights         |
| Blue   | `#6a9bcc` | Links, interactive       |
| Green  | `#788c5d` | Success, positive states |

## Typography Standards

### Headings

- **Primary Font:** Poppins
- **Fallback:** Arial
- **Application:** 24pt and larger
- **Style:** Semi-bold to Bold weights

### Body Text

- **Primary Font:** Lora
- **Fallback:** Georgia
- **Application:** All body text
- **Style:** Regular weight for readability

## Technical Implementation

### CSS Variables

```css
:root {
  /* Main Colors */
  --brand-dark: #141413;
  --brand-light: #faf9f5;
  --brand-mid-gray: #b0aea5;
  --brand-light-gray: #e8e6dc;

  /* Accent Colors */
  --brand-orange: #d97757;
  --brand-blue: #6a9bcc;
  --brand-green: #788c5d;

  /* Typography */
  --font-heading: 'Poppins', Arial, sans-serif;
  --font-body: 'Lora', Georgia, serif;
}
```

### Font Application

```css
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body, p, span, li {
  font-family: var(--font-body);
}
```

### Tailwind CSS Integration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#141413',
          light: '#faf9f5',
          'mid-gray': '#b0aea5',
          'light-gray': '#e8e6dc',
          orange: '#d97757',
          blue: '#6a9bcc',
          green: '#788c5d',
        }
      },
      fontFamily: {
        heading: ['Poppins', 'Arial', 'sans-serif'],
        body: ['Lora', 'Georgia', 'serif'],
      }
    }
  }
}
```

## Smart Features

### Automatic Font Fallbacks

The system works with existing fonts and provides fallback options for maximum compatibility. No font installation is required.

### Smart Color Selection

Colors are automatically selected based on background context:
- Light backgrounds use dark text
- Dark backgrounds use light text
- Accent colors cycle appropriately for shapes

### RGB Color Values

Uses RGB color values for precise brand matching through libraries like python-pptx's RGBColor class, maintaining color fidelity across different systems.

## Application Guidelines

### Do's

- Use brand colors consistently across all materials
- Apply Poppins to headings 24pt and larger
- Use Lora for all body text
- Maintain color fidelity with exact hex values
- Use smart fallbacks for font compatibility

### Don'ts

- Mix brand colors with off-brand alternatives
- Use different typography for the same element types
- Apply accent colors to large background areas
- Ignore fallback fonts for cross-platform compatibility

## Best Practices

1. **Consistency**: Always use defined brand colors
2. **Hierarchy**: Maintain clear visual hierarchy with typography
3. **Accessibility**: Ensure sufficient color contrast
4. **Compatibility**: Test across different systems and platforms
5. **Simplicity**: Let the brand identity speak through clean application
