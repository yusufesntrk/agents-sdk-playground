# SEO Audit

Prüfe Website-Seiten auf SEO-Compliance.

## Deine Aufgabe

Führe einen SEO Audit für: $ARGUMENTS

---

## Automatische Checks

### 1. Meta Tags
```bash
# Seiten ohne Description
grep -rL "description" src/pages/

# Title-Tags prüfen
grep -rn "<title>\|<Helmet>" src/pages/
```
**Regel:** Jede Seite braucht Title (50-60 chars) + Description (150-160 chars)

### 2. Open Graph
```bash
# Seiten ohne OG Tags
grep -rL "og:title" src/pages/
```
**Regel:** og:title, og:description, og:image (1200x630), og:url

### 3. Structured Data
```bash
# JSON-LD vorhanden?
grep -rn "application/ld+json" src/
```
**Regel:** Organization (Homepage), BreadcrumbList (alle), FAQPage (wenn FAQ)

### 4. Headings
```bash
# Multiple H1?
grep -c "<h1" src/pages/*.tsx
```
**Regel:** Genau ein H1 pro Seite

### 5. Images
```bash
# Images ohne alt
grep -rn "<img" src/ | grep -v "alt="
```
**Regel:** Alle Images brauchen beschreibendes alt-Attribut

### 6. Technical Files
```bash
ls -la public/robots.txt public/sitemap.xml
```
**Regel:** robots.txt und sitemap.xml müssen existieren

---

## Report Format

```
═══════════════════════════════════════════════════
  SEO AUDIT REPORT
═══════════════════════════════════════════════════

📁 Pages Analyzed: 8

📝 META TAGS
  ✅ All pages have title
  ⚠️ 2 descriptions too long

🖼 OPEN GRAPH
  ✅ All pages have OG
  ❌ /contact missing og:image

📊 STRUCTURED DATA
  ✅ Organization schema
  ❌ FAQ section without FAQPage schema

📑 HEADINGS
  ✅ Single H1 per page

🖼 IMAGES
  ⚠️ 3 images missing alt

🔧 TECHNICAL
  ✅ robots.txt
  ❌ sitemap.xml missing

═══════════════════════════════════════════════════
  SCORE: 78/100
═══════════════════════════════════════════════════
```

---

## Auto-Fix Capabilities

- Generate sitemap.xml
- Generate robots.txt
- Add missing canonical URLs
- Suggest schema markup

---

## Skills Referenz

- `seo/meta-tags`
- `seo/structured-data`
- `seo/technical-seo`

---

## Beispiele

```bash
# Einzelne Seite
/seo-audit src/pages/Home.tsx

# Alle Seiten
/seo-audit src/pages/

# Mit Auto-Fix
/seo-audit --fix src/pages/

# Nur Technical Files generieren
/seo-audit --generate-files
```
