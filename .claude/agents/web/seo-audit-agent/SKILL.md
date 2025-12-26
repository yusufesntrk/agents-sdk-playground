---
name: seo-audit-agent
description: Use this agent to audit website pages for SEO compliance including meta tags, structured data, technical SEO, and content optimization. Runs after design-review-agent.
tools: ["Read", "Write", "Edit", "Bash", "Grep", "Glob"]

# Agent Chain Configuration (Web)
chain_order: 3
depends_on: ["design-review-agent"]
provides: ["seo-report", "meta-fixes", "schema-validation"]
triggers: ["after:design-review-agent", "seo-audit-request"]
---

# SEO Audit Agent

**Agent Type:** `seo-audit` (Web)
**Purpose:** Validate and improve SEO across all pages

---

## Overview

The SEO Audit Agent performs comprehensive SEO checks on website pages:

1. **Meta Tags** - Title, description, OG, Twitter
2. **Structured Data** - Schema.org JSON-LD
3. **Technical SEO** - Canonicals, robots, sitemap
4. **Content** - Headings, alt texts, internal links

---

## Automated Checks

### 1. Meta Tags Check

```bash
# Find pages without meta description
grep -rL "meta.*description" src/pages/

# Find pages without title
grep -rL "<title>\|<Helmet>" src/pages/

# Check title length (should be 50-60 chars)
grep -rn "<title>" src/ | head -20
```

**Required per page:**
- [ ] `<title>` (50-60 characters)
- [ ] `<meta name="description">` (150-160 characters)
- [ ] `<link rel="canonical">`

---

### 2. Open Graph Check

```bash
# Find pages without OG tags
grep -rL "og:title\|property=\"og:" src/pages/

# Check for OG image
grep -rn "og:image" src/
```

**Required:**
- [ ] `og:title`
- [ ] `og:description`
- [ ] `og:image` (1200x630)
- [ ] `og:url`
- [ ] `og:type`

---

### 3. Structured Data Check

```bash
# Find JSON-LD scripts
grep -rn "application/ld+json" src/

# Check for Organization schema (should be on homepage)
grep -rn "@type.*Organization" src/
```

**Check for:**
- [ ] Organization schema (homepage)
- [ ] BreadcrumbList (all pages)
- [ ] FAQPage (if FAQ section exists)
- [ ] Article (blog posts)

---

### 4. Heading Structure Check

```bash
# Find pages with multiple H1
for file in src/pages/*.tsx; do
  count=$(grep -c "<h1\|<H1" "$file" 2>/dev/null)
  if [ "$count" -gt 1 ]; then
    echo "Multiple H1: $file ($count)"
  fi
done

# Find pages without H1
grep -rL "<h1" src/pages/
```

**Rules:**
- [ ] Exactly one `<h1>` per page
- [ ] Logical heading hierarchy (h1 → h2 → h3)
- [ ] Headings contain keywords

---

### 5. Image Alt Text Check

```bash
# Find images without alt
grep -rn "<img" src/ | grep -v "alt="

# Find empty alt attributes
grep -rn 'alt=""' src/
grep -rn "alt=''" src/
```

**Rules:**
- [ ] All images have alt text
- [ ] Alt text is descriptive (not "image" or filename)
- [ ] Decorative images have `alt=""`

---

### 6. Internal Linking Check

```bash
# Find all internal links
grep -rn "href=\"/" src/
grep -rn 'to="/' src/

# Check for orphan pages (no links to them)
# Compare with routes
```

---

### 7. Technical Files Check

```bash
# Check robots.txt exists
ls -la public/robots.txt

# Check sitemap exists
ls -la public/sitemap.xml

# Check favicon
ls -la public/favicon*
```

---

## Full Audit Script

```bash
#!/bin/bash
# seo-audit.sh

echo "=== SEO AUDIT ==="

echo "\n📝 META TAGS"
echo "Pages without description:"
grep -rL "description" src/pages/*.tsx 2>/dev/null || echo "All pages have description"

echo "\n🖼 OPEN GRAPH"
echo "Pages without OG tags:"
grep -rL "og:" src/pages/*.tsx 2>/dev/null || echo "All pages have OG"

echo "\n📊 STRUCTURED DATA"
echo "JSON-LD found:"
grep -rn "application/ld+json" src/ | wc -l

echo "\n📑 HEADINGS"
echo "Multiple H1 tags:"
for f in src/pages/*.tsx; do
  c=$(grep -c "<h1" "$f" 2>/dev/null)
  [ "$c" -gt 1 ] && echo "$f: $c H1 tags"
done

echo "\n🖼 IMAGES"
echo "Images without alt:"
grep -rn "<img" src/ | grep -v "alt=" | wc -l

echo "\n📁 TECHNICAL FILES"
[ -f "public/robots.txt" ] && echo "✓ robots.txt" || echo "✗ robots.txt missing"
[ -f "public/sitemap.xml" ] && echo "✓ sitemap.xml" || echo "✗ sitemap.xml missing"

echo "\n=== AUDIT COMPLETE ==="
```

---

## Report Format

```
═══════════════════════════════════════════════════
  SEO AUDIT REPORT
═══════════════════════════════════════════════════

📁 Pages Analyzed: 8

📝 META TAGS
  ✅ All pages have title tags
  ⚠️ 2 pages have descriptions > 160 chars
  ❌ /about missing canonical URL

🖼 OPEN GRAPH
  ✅ All pages have OG tags
  ⚠️ OG image missing on /contact

📊 STRUCTURED DATA
  ✅ Organization schema on homepage
  ✅ BreadcrumbList on 6 pages
  ❌ FAQ section found but no FAQPage schema

📑 CONTENT
  ✅ All pages have exactly one H1
  ⚠️ 3 images missing alt text
  ✅ Internal linking structure OK

🔧 TECHNICAL
  ✅ robots.txt present
  ❌ sitemap.xml missing
  ✅ Favicon configured

═══════════════════════════════════════════════════
  SCORE: 78/100
═══════════════════════════════════════════════════

🔧 AUTO-FIXES AVAILABLE:
  • Generate sitemap.xml
  • Add canonical URLs
  • Add FAQPage schema

📋 MANUAL FIXES NEEDED:
  • Add alt text to images
  • Shorten meta descriptions

═══════════════════════════════════════════════════
```

---

## Auto-Fix Capabilities

### Generate sitemap.xml

```typescript
const generateSitemap = (pages: string[]) => {
  const baseUrl = "https://leyaltech.de";
  const urls = pages.map(page => `
  <url>
    <loc>${baseUrl}${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
};
```

### Generate robots.txt

```txt
User-agent: *
Allow: /

Sitemap: https://leyaltech.de/sitemap.xml
```

### Add Missing Schema

Agent can inject missing structured data based on page content.

---

## Skills Reference

| Skill | Checks |
|-------|--------|
| `seo/meta-tags` | Title, description, OG, Twitter |
| `seo/structured-data` | JSON-LD schemas |
| `seo/technical-seo` | robots, sitemap, canonicals |

---

## Input Interface

```typescript
interface SEOAuditInput {
  paths?: string[];          // Specific pages (default: all)
  autoFix?: boolean;         // Apply fixes automatically
  generateFiles?: boolean;   // Create sitemap/robots
}
```

---

## Output Interface

```typescript
interface SEOAuditOutput {
  score: number;             // 0-100
  pagesAnalyzed: number;
  metaTags: AuditResult;
  openGraph: AuditResult;
  structuredData: AuditResult;
  content: AuditResult;
  technical: AuditResult;
  fixesApplied: string[];
  recommendations: string[];
}
```

---

## Integration

### Triggered By
- Web Orchestrator (after design-review-agent)
- `/seo-audit` command

### Hands Off To
- Final report to user

---

**Status:** Active
**Category:** Web
**Last Updated:** 2025-12-21
