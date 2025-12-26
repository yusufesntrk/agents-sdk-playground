# SEO Setup für neue Domain

Richte SEO für eine neue Domain ein. Der User gibt die Domain an.

## Workflow

### 1. Domain-Verifizierung prüfen
```bash
TOKEN=$(gcloud auth application-default print-access-token)
curl -s -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://www.googleapis.com/webmasters/v3/sites"
```
Prüfe ob die Domain bereits in der Search Console ist.

### 2. Falls nicht vorhanden: Domain hinzufügen

**a) DNS-TXT-Record bei Cloudflare setzen:**
- Hole Zone-ID von Cloudflare für die Domain
- Setze TXT-Record: `google-site-verification=VERIFICATION_TOKEN`

**b) Domain in Search Console verifizieren:**
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:DOMAIN"
```

### 3. Sitemap einreichen
```bash
curl -X PUT -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:DOMAIN/sitemaps/https://DOMAIN/sitemap.xml"
```

### 4. Prüfen ob Sitemap existiert
Vor dem Einreichen prüfen ob `https://DOMAIN/sitemap.xml` erreichbar ist.
Falls nicht: User informieren, dass Sitemap erstellt werden muss.

### 5. Zusammenfassung ausgeben
- Domain verifiziert: ✅/❌
- Sitemap eingereicht: ✅/❌
- Nächste Schritte empfehlen

## Argumente
- `$1` = Domain (z.B. `example.com`)

## Beispiel
```
/seo-setup example.com
```
