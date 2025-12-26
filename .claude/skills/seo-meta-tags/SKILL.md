---
name: seo-meta-tags
description: This skill should be used when the user asks to "add meta tags", "optimize SEO metadata", "implement Open Graph", "add Twitter Cards", "fix title tag", or needs guidance on meta description, canonical URLs, or social sharing previews.
---

# SEO Meta Tags

Complete guide for implementing SEO meta tags.

---

## Essential Meta Tags

Every page needs these:

```html
<head>
  <!-- Primary Meta Tags -->
  <title>Page Title | Brand Name</title>
  <meta name="description" content="Compelling description under 160 characters." />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://example.com/page" />

  <!-- Viewport (responsive) -->
  <meta name="viewport" content="width=device-width, initial-scale=1" />

  <!-- Language -->
  <html lang="de">
</head>
```

---

## Title Tag Best Practices

### Format

```
Primary Keyword - Secondary Keyword | Brand Name
```

### Rules

| Rule | Limit | Example |
|------|-------|---------|
| Length | 50-60 chars | "Web Automatisierung für Agenturen | LeyalTech" |
| Brand position | End | "Service Name | Brand" |
| Separator | ` | ` or ` - ` | Consistent across site |

### Examples

```html
<!-- Homepage -->
<title>LeyalTech | Automatisierung für Recruiting-Agenturen</title>

<!-- Service Page -->
<title>CRM Integration & Automatisierung | LeyalTech</title>

<!-- Blog Post -->
<title>10 Wege zur Prozessoptimierung - LeyalTech Blog</title>
```

---

## Meta Description

### Rules

| Rule | Value |
|------|-------|
| Length | 150-160 characters |
| Include | Primary keyword, CTA |
| Avoid | Duplicate descriptions |

### Template

```html
<meta name="description" content="[Was wir bieten] für [Zielgruppe]. [Nutzenversprechen]. [CTA]" />
```

### Examples

```html
<!-- Homepage -->
<meta name="description" content="Automatisierung für Recruiting-Agenturen. Reduziere manuelle Arbeit um 80% mit unseren maßgeschneiderten Workflows. Jetzt kostenlos beraten lassen." />

<!-- Service -->
<meta name="description" content="CRM-Integration und Workflow-Automatisierung für Personalvermittler. Spare 20+ Stunden pro Woche. Kostenlose Demo vereinbaren." />
```

---

## Open Graph (Facebook, LinkedIn)

```html
<!-- Open Graph -->
<meta property="og:type" content="website" />
<meta property="og:url" content="https://example.com/page" />
<meta property="og:title" content="Page Title" />
<meta property="og:description" content="Description for social sharing" />
<meta property="og:image" content="https://example.com/og-image.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:locale" content="de_DE" />
<meta property="og:site_name" content="LeyalTech" />
```

### OG Image Requirements

| Property | Requirement |
|----------|-------------|
| Size | 1200 x 630 px |
| Format | JPG or PNG |
| File size | < 8 MB |
| Text | Minimal, readable at small size |

---

## Twitter Cards

```html
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="https://example.com/page" />
<meta name="twitter:title" content="Page Title" />
<meta name="twitter:description" content="Description for Twitter" />
<meta name="twitter:image" content="https://example.com/twitter-image.jpg" />
<meta name="twitter:site" content="@username" />
```

### Card Types

| Type | Use Case |
|------|----------|
| `summary` | Default, small image |
| `summary_large_image` | Blog posts, pages with hero |
| `app` | App download pages |
| `player` | Video content |

---

## React Helmet Implementation

```tsx
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  type?: "website" | "article";
}

const SEO = ({
  title,
  description,
  canonical,
  ogImage = "/og-default.jpg",
  type = "website"
}: SEOProps) => {
  const siteUrl = "https://example.com";
  const fullUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullTitle = `${title} | Brand`;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:locale" content="de_DE" />
      <meta property="og:site_name" content="Brand" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
    </Helmet>
  );
};

export default SEO;
```

---

## Additional Meta Tags

### Robots

```html
<!-- Allow indexing (default) -->
<meta name="robots" content="index, follow" />

<!-- No indexing (for staging, private pages) -->
<meta name="robots" content="noindex, nofollow" />

<!-- Index but don't follow links -->
<meta name="robots" content="index, nofollow" />
```

### Geo (Local SEO)

```html
<meta name="geo.region" content="DE" />
<meta name="geo.placename" content="Berlin" />
```

---

## Favicon & App Icons

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#0066CC" />
```

---

## Checklist

### Every Page
- [ ] Unique `<title>` (50-60 chars)
- [ ] Unique `meta description` (150-160 chars)
- [ ] Canonical URL set
- [ ] `lang` attribute on `<html>`

### Social Sharing
- [ ] Open Graph tags complete
- [ ] OG image (1200x630)
- [ ] Twitter card tags
- [ ] Twitter image

### Technical
- [ ] Viewport meta tag
- [ ] Favicon set
- [ ] Theme color defined
- [ ] Robots meta (if needed)

---

## Common Mistakes

```html
<!-- ❌ WRONG: Title too long -->
<title>Die beste Automatisierungslösung für Recruiting-Agenturen in Deutschland | Brand GmbH</title>

<!-- ✅ RIGHT: Concise -->
<title>Recruiting Automatisierung | Brand</title>

<!-- ❌ WRONG: Duplicate descriptions -->
<!-- Same description on every page -->

<!-- ✅ RIGHT: Unique per page -->

<!-- ❌ WRONG: Missing canonical -->
<!-- Both /page and /page/ indexed -->

<!-- ✅ RIGHT: Canonical set -->
<link rel="canonical" href="https://example.com/page" />
```
