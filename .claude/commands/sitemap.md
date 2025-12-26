# Sitemap verwalten

Sitemap für eine Domain einreichen oder Status abrufen.

## Aktionen

### Sitemap einreichen
```bash
TOKEN=$(gcloud auth application-default print-access-token)
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:DOMAIN/sitemaps/SITEMAP_URL"
```

### Alle Sitemaps einer Domain auflisten
```bash
curl -s -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:DOMAIN/sitemaps"
```

### Sitemap löschen
```bash
curl -X DELETE -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:DOMAIN/sitemaps/SITEMAP_URL"
```

## Vor dem Einreichen prüfen
1. Sitemap-URL erreichbar? `curl -I SITEMAP_URL`
2. Valides XML?
3. Domain bereits in Search Console?

## Argumente
- `$1` = Domain (z.B. `example.com`)
- `$2` = Sitemap-URL (optional, default: `https://DOMAIN/sitemap.xml`)

## Beispiele
```
/sitemap example.com
/sitemap example.com https://example.com/sitemap-posts.xml
```
