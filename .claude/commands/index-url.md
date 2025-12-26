# URL zur Indexierung anfordern

Fordere Google auf, eine URL zu crawlen und zu indexieren.

## Indexing API verwenden
```bash
TOKEN=$(gcloud auth application-default print-access-token)
curl -X POST -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  -H "Content-Type: application/json" \
  -d '{"url": "URL_HERE", "type": "URL_UPDATED"}' \
  "https://indexing.googleapis.com/v3/urlNotifications:publish"
```

## Type-Optionen
- `URL_UPDATED` - URL wurde aktualisiert oder ist neu
- `URL_DELETED` - URL wurde gelöscht

## Batch-Indexierung (mehrere URLs)
```bash
# Für jede URL in einer Liste
for url in URL1 URL2 URL3; do
  curl -X POST -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"$url\", \"type\": \"URL_UPDATED\"}" \
    "https://indexing.googleapis.com/v3/urlNotifications:publish"
done
```

## Indexierung-Status prüfen
```bash
curl -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  "https://indexing.googleapis.com/v3/urlNotifications/metadata?url=URL_HERE"
```

## Wichtig
- Quota: 200 Anfragen pro Tag
- Funktioniert am besten für JobPosting und BroadcastEvent Schema
- Für normale Seiten: Sitemap bevorzugen

## Argumente
- `$1` = URL (z.B. `https://example.com/neue-seite`)

## Beispiele
```
/index-url https://example.com/blog/neuer-artikel
/index-url https://example.com/jobs/developer --deleted
```
