# SEO Performance Report

Rufe SEO-Performance-Daten aus der Google Search Console ab.

## Performance-Daten abrufen
```bash
TOKEN=$(gcloud auth application-default print-access-token)
curl -X POST -H "Authorization: Bearer $TOKEN" -H "x-goog-user-project: n8n-x-leyaltech" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "START_DATE",
    "endDate": "END_DATE",
    "dimensions": ["query"],
    "rowLimit": 25
  }' \
  "https://www.googleapis.com/webmasters/v3/sites/sc-domain:DOMAIN/searchAnalytics/query"
```

## Verfügbare Dimensionen
- `query` - Suchanfragen
- `page` - Seiten
- `country` - Länder
- `device` - Geräte (DESKTOP, MOBILE, TABLET)
- `date` - Tage

## Metriken (immer enthalten)
- `clicks` - Klicks
- `impressions` - Impressionen
- `ctr` - Click-Through-Rate
- `position` - Durchschnittliche Position

## Report-Typen

### Top Suchanfragen (letzte 28 Tage)
```json
{
  "startDate": "2024-11-24",
  "endDate": "2024-12-22",
  "dimensions": ["query"],
  "rowLimit": 25
}
```

### Top Seiten
```json
{
  "startDate": "2024-11-24",
  "endDate": "2024-12-22",
  "dimensions": ["page"],
  "rowLimit": 25
}
```

### Performance nach Gerät
```json
{
  "startDate": "2024-11-24",
  "endDate": "2024-12-22",
  "dimensions": ["device"]
}
```

### Täglicher Verlauf
```json
{
  "startDate": "2024-11-24",
  "endDate": "2024-12-22",
  "dimensions": ["date"]
}
```

## Output formatieren
Die Daten als Tabelle darstellen:
| Suchanfrage | Klicks | Impressionen | CTR | Position |
|-------------|--------|--------------|-----|----------|

## Argumente
- `$1` = Domain (z.B. `example.com`)
- `$2` = Zeitraum (optional: `7d`, `28d`, `90d`, default: `28d`)
- `$3` = Dimension (optional: `queries`, `pages`, `devices`, default: `queries`)

## Beispiele
```
/seo-report leyaltech.de
/seo-report talentsaver.com 90d pages
```
