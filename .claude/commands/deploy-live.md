# Deploy Live: $ARGUMENTS

Macht ein Preview-Projekt live mit Custom Domain.

**Nutzung:**
```
/deploy-live <projekt-name> <custom-domain>
```

**Beispiele:**
```
/deploy-live baeckerei-mueller-preview baeckerei-mueller.de
/deploy-live autohaus-schmidt-preview www.autohaus-schmidt.de
```

## Voraussetzungen

- Projekt wurde bereits mit `/deploy-preview` erstellt
- Domain ist in Cloudflare (oder DNS kann angepasst werden)

## Schritte

### Option A: Domain bereits in Cloudflare

1. **Öffne Cloudflare Dashboard**
```
https://dash.cloudflare.com/ → Pages → <projekt-name> → Custom Domains
```

2. **Domain hinzufügen**
- "Set up a custom domain" klicken
- Domain eingeben (z.B. `www.baeckerei-mueller.de`)
- Cloudflare konfiguriert DNS automatisch

### Option B: Domain extern (z.B. Hostinger)

1. **CNAME Record erstellen** beim Domain-Provider:
```
Type: CNAME
Name: www (oder @)
Target: <projekt-name>.pages.dev
```

2. **In Cloudflare Pages Custom Domain hinzufügen**
- Cloudflare verifiziert den CNAME

### Via CLI (experimentell)

```bash
# Domain hinzufügen
wrangler pages project list
# Dann im Dashboard: Custom Domain hinzufügen
```

## DNS Einstellungen

| Record Type | Name | Target |
|-------------|------|--------|
| CNAME | www | projekt-name.pages.dev |
| CNAME | @ | projekt-name.pages.dev |

## Nach Go-Live

- SSL wird automatisch von Cloudflare bereitgestellt
- Alte Preview-URL bleibt erreichbar (kann im Dashboard deaktiviert werden)
- Updates deployen: einfach erneut `/deploy-preview` ausführen

## Troubleshooting

- **DNS Propagation**: Kann bis zu 24h dauern (meist <1h)
- **SSL Fehler**: Warte 5-10 Minuten, Cloudflare stellt automatisch aus
- **Domain nicht verifiziert**: CNAME Record prüfen
