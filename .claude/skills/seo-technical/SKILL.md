---
name: seo-technical
description: This skill should be used when the user asks to "create robots.txt", "generate sitemap", "fix canonical URLs", "improve Core Web Vitals", "optimize page speed", or needs guidance on technical SEO, redirects, hreflang, or URL structure.
---

# Technical SEO

Essential technical SEO implementation guide.

---

## robots.txt

Located at site root: `https://example.com/robots.txt`

### Basic Template

```txt
User-agent: *
Allow: /

# Block admin/private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Block search/filter pages (duplicate content)
Disallow: /*?*sort=
Disallow: /*?*filter=

# Sitemap location
Sitemap: https://example.com/sitemap.xml
```

### For Staging/Dev Sites

```txt
User-agent: *
Disallow: /
```

---

## sitemap.xml

Located at: `https://example.com/sitemap.xml`

### Basic Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/services</loc>
    <lastmod>2024-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

### Priority Guidelines

| Page Type | Priority | Changefreq |
|-----------|----------|------------|
| Homepage | 1.0 | weekly |
| Main services | 0.8 | monthly |
| Blog posts | 0.6 | yearly |
| Legal pages | 0.3 | yearly |

---

## Canonical URLs

Prevent duplicate content issues.

### Self-Referencing Canonical

```html
<!-- On https://example.com/page -->
<link rel="canonical" href="https://example.com/page" />
```

### Common Canonical Issues

| Problem | Solution |
|---------|----------|
| www vs non-www | Choose one, redirect other |
| http vs https | Always canonical to https |
| Trailing slash | Be consistent, canonical to one |
| Query parameters | Canonical to clean URL |

---

## URL Structure

### Best Practices

```
✅ GOOD URLs:
/services/crm-automation
/blog/prozessoptimierung-tipps
/case-studies/example

❌ BAD URLs:
/page?id=123
/services/crm_automation  (underscores)
/Blog/Post/123  (uppercase)
```

### Rules

| Rule | Example |
|------|---------|
| Lowercase | `/services` not `/Services` |
| Hyphens for words | `/crm-automation` not `/crm_automation` |
| Short & descriptive | `/services/crm` |
| No special chars | No `?`, `&`, `=` in path |

---

## Redirects

### 301 (Permanent)

```
/old-page → /new-page
```

### Implementation (Vercel/Cloudflare)

```json
// vercel.json
{
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true }
  ]
}
```

```txt
# Cloudflare _redirects
/old-page  /new-page  301
```

---

## hreflang (Multilingual)

For multi-language sites:

```html
<link rel="alternate" hreflang="de" href="https://example.com/de/page" />
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

---

## Core Web Vitals

Google ranking factors:

### LCP (Largest Contentful Paint)
- Target: < 2.5 seconds
- Optimization:
  ```tsx
  // Preload hero image
  <link rel="preload" as="image" href="/hero.webp" />
  ```

### FID / INP (Interaction to Next Paint)
- Target: < 100ms
- Optimization:
  ```tsx
  // Code splitting
  const HeavyComponent = lazy(() => import('./HeavyComponent'));
  ```

### CLS (Cumulative Layout Shift)
- Target: < 0.1
- Optimization:
  ```tsx
  // Always set dimensions
  <img src="image.jpg" width={800} height={600} />
  ```

---

## Image Optimization

### Format Priority

```
1. WebP (good compression, wide support)
2. AVIF (best compression, limited support)
3. PNG (lossless, transparency)
4. JPEG (photos)
```

### Responsive Images

```html
<img
  src="image-800.webp"
  srcset="image-400.webp 400w, image-800.webp 800w"
  sizes="(max-width: 640px) 400px, 800px"
  alt="Descriptive alt text"
  loading="lazy"
/>
```

### Alt Text

```html
<!-- ❌ BAD -->
<img alt="image" />

<!-- ✅ GOOD -->
<img alt="Team working on automation workflow" />
```

---

## Heading Hierarchy

```
h1: Seitentitel (1x pro Seite)
  h2: Hauptsektionen
    h3: Untersektionen
```

**Rules:**
- Only one h1 per page
- Never skip levels (h1 → h3)
- Use headings for structure, not styling

---

## Page Speed Checklist

### HTML
- [ ] Minified
- [ ] Compressed (gzip/brotli)

### CSS
- [ ] Minified
- [ ] Remove unused CSS

### JavaScript
- [ ] Minified
- [ ] Code splitting
- [ ] Defer non-critical

### Images
- [ ] WebP/AVIF format
- [ ] Lazy loading
- [ ] Proper dimensions

### Fonts
- [ ] Font-display: swap
- [ ] Preload critical fonts

---

## Technical SEO Audit Checklist

### Crawling
- [ ] robots.txt correct
- [ ] Sitemap.xml valid and submitted
- [ ] No crawl errors

### Indexing
- [ ] Canonical URLs on all pages
- [ ] No duplicate content
- [ ] Proper noindex where needed

### URLs
- [ ] Clean, readable URLs
- [ ] Consistent trailing slash
- [ ] 301 redirects for moved pages

### Performance
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Mobile-friendly

### Security
- [ ] HTTPS everywhere
- [ ] No mixed content

---

## Tools

| Tool | Purpose |
|------|---------|
| Google Search Console | Indexing, errors |
| PageSpeed Insights | Core Web Vitals |
| Rich Results Test | Structured data |
