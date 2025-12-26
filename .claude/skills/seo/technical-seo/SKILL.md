---
name: seo-technical-seo
description: Technical SEO implementation including robots.txt, sitemap.xml, canonical URLs, hreflang, and Core Web Vitals optimization. Use when setting up or auditing technical SEO.
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

### Testing
Check: `https://example.com/robots.txt`

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

### Sitemap Index (Large Sites)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://example.com/sitemap-pages.xml</loc>
    <lastmod>2024-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://example.com/sitemap-blog.xml</loc>
    <lastmod>2024-01-14</lastmod>
  </sitemap>
</sitemapindex>
```

---

## Canonical URLs

Prevent duplicate content issues.

### Self-Referencing Canonical

```html
<!-- On https://example.com/page -->
<link rel="canonical" href="https://example.com/page" />
```

### Canonical to Preferred Version

```html
<!-- On https://example.com/page?ref=social -->
<link rel="canonical" href="https://example.com/page" />

<!-- On https://example.com/page/ (trailing slash) -->
<link rel="canonical" href="https://example.com/page" />
```

### Common Canonical Issues

| Problem | Solution |
|---------|----------|
| www vs non-www | Choose one, redirect other |
| http vs https | Always canonical to https |
| Trailing slash | Be consistent, canonical to one |
| Query parameters | Canonical to clean URL |
| Pagination | Canonical to page 1 or self |

---

## URL Structure

### Best Practices

```
✅ GOOD URLs:
/services/crm-automation
/blog/prozessoptimierung-tipps
/case-studies/salesworx

❌ BAD URLs:
/page?id=123
/services/crm_automation  (underscores)
/Blog/Post/123  (uppercase)
/services/crm-automatisierung-fuer-recruiting-agenturen-in-deutschland  (too long)
```

### Rules

| Rule | Example |
|------|---------|
| Lowercase | `/services` not `/Services` |
| Hyphens for words | `/crm-automation` not `/crm_automation` |
| Short & descriptive | `/services/crm` not `/services/customer-relationship-management-system` |
| No special chars | No `?`, `&`, `=` in path |
| No trailing slash | `/page` not `/page/` (pick one) |

---

## Redirects

### 301 (Permanent)

```
Old URL → New URL (permanent move)
/old-page → /new-page
```

### 302 (Temporary)

```
Old URL → New URL (temporary, testing)
```

### Implementation (Vite/Vercel)

```json
// vercel.json
{
  "redirects": [
    { "source": "/old-page", "destination": "/new-page", "permanent": true },
    { "source": "/blog/:slug", "destination": "/articles/:slug", "permanent": true }
  ]
}
```

### Implementation (Nginx)

```nginx
location /old-page {
    return 301 /new-page;
}
```

---

## hreflang (Multilingual)

For multi-language sites:

```html
<link rel="alternate" hreflang="de" href="https://example.com/de/page" />
<link rel="alternate" hreflang="en" href="https://example.com/en/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

### Format

```
hreflang="language-region"

de     = German (any region)
de-DE  = German (Germany)
de-AT  = German (Austria)
en-US  = English (USA)
en-GB  = English (UK)
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

  // Use next-gen formats
  <img src="image.webp" loading="eager" />
  ```

### FID (First Input Delay) / INP (Interaction to Next Paint)
- Target: < 100ms
- Optimization:
  ```tsx
  // Code splitting
  const HeavyComponent = lazy(() => import('./HeavyComponent'));

  // Defer non-critical JS
  <script defer src="analytics.js" />
  ```

### CLS (Cumulative Layout Shift)
- Target: < 0.1
- Optimization:
  ```tsx
  // Always set dimensions
  <img src="image.jpg" width={800} height={600} />

  // Reserve space for dynamic content
  <div className="min-h-[400px]">
    {loading ? <Skeleton /> : <Content />}
  </div>
  ```

---

## Image Optimization

### Format Priority

```
1. AVIF (best compression, limited support)
2. WebP (good compression, wide support)
3. PNG (lossless, transparency)
4. JPEG (photos)
```

### Responsive Images

```html
<img
  src="image-800.webp"
  srcset="
    image-400.webp 400w,
    image-800.webp 800w,
    image-1200.webp 1200w
  "
  sizes="(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px"
  alt="Descriptive alt text"
  loading="lazy"
  decoding="async"
/>
```

### Alt Text

```html
<!-- ❌ BAD -->
<img alt="image" />
<img alt="IMG_1234.jpg" />
<img alt="" />  <!-- Decorative only -->

<!-- ✅ GOOD -->
<img alt="Team working on automation workflow" />
<img alt="Dashboard showing 50% reduction in manual tasks" />
```

---

## Page Speed Checklist

### HTML
- [ ] Minified
- [ ] Compressed (gzip/brotli)
- [ ] Critical CSS inlined

### CSS
- [ ] Minified
- [ ] Remove unused CSS
- [ ] Critical CSS above fold

### JavaScript
- [ ] Minified
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Defer non-critical

### Images
- [ ] WebP/AVIF format
- [ ] Responsive srcset
- [ ] Lazy loading
- [ ] Proper dimensions

### Fonts
- [ ] Subset fonts (only used chars)
- [ ] Font-display: swap
- [ ] Preload critical fonts

---

## Security Headers

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

### Vercel Config

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

---

## Technical SEO Audit Checklist

### Crawling
- [ ] robots.txt correct and accessible
- [ ] No important pages blocked
- [ ] Sitemap.xml valid and submitted
- [ ] No crawl errors in Search Console

### Indexing
- [ ] Canonical URLs on all pages
- [ ] No duplicate content
- [ ] No orphan pages (unreachable)
- [ ] Proper noindex on non-content pages

### URLs
- [ ] Clean, readable URLs
- [ ] Consistent trailing slash usage
- [ ] 301 redirects for moved pages
- [ ] No redirect chains

### Performance
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] Mobile-friendly

### Security
- [ ] HTTPS everywhere
- [ ] Security headers set
- [ ] No mixed content warnings

---

## Tools

| Tool | Purpose |
|------|---------|
| Google Search Console | Indexing, errors, performance |
| PageSpeed Insights | Core Web Vitals |
| Screaming Frog | Crawling, technical audit |
| Ahrefs/Semrush | Backlinks, rankings |
| Schema Validator | Structured data |
