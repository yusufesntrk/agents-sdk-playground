# Cloudflare Domain Setup

Verwende diesen Skill wenn eine Domain mit Cloudflare Pages verbunden werden soll.

## Token-Berechtigungen

| Token | Kann | Kann NICHT |
|-------|------|------------|
| DNS Token | Zonen erstellen, DNS Records | Redirect Rules, Page Rules |
| Pages Token | Pages Domains, Deployments | Redirect Rules, Page Rules |
| Workers Token | Workers deployen, Worker Domains | Worker Routes auf Zonen |

**WICHTIG:** Kein API-Token kann Redirect Rules erstellen! Immer Dashboard nutzen.

## Standard-Workflow: Domain zu Pages

### 1. Zone erstellen (wenn nötig)
```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"name":"example.com","account":{"id":"ACCOUNT_ID"}}'
```

### 2. Nameserver bei Registrar ändern
```bash
# Hostinger
curl -X PUT "https://developers.hostinger.com/api/domains/v1/portfolio/DOMAIN/nameservers" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -d '{"ns1":"NS1.ns.cloudflare.com","ns2":"NS2.ns.cloudflare.com"}'
```

### 3. DNS Records setzen
```bash
ZONE_ID="xxx"
# Root Domain
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"type":"CNAME","name":"@","content":"PROJECT.pages.dev","proxied":true}'

# WWW
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  -d '{"type":"CNAME","name":"www","content":"PROJECT.pages.dev","proxied":true}'
```

### 4. Domains bei Pages hinzufügen
```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects/PROJECT/domains" \
  -H "Authorization: Bearer $CF_PAGES_TOKEN" \
  -d '{"name":"example.com"}'

curl -X POST "https://api.cloudflare.com/client/v4/accounts/ACCOUNT_ID/pages/projects/PROJECT/domains" \
  -H "Authorization: Bearer $CF_PAGES_TOKEN" \
  -d '{"name":"www.example.com"}'
```

### 5. Redirect Rule (DASHBOARD - NICHT API!)

**API KANN KEINE REDIRECT RULES ERSTELLEN!**

User muss im Dashboard:
1. https://dash.cloudflare.com → Zone auswählen
2. **Rules** → **Redirect Rules** → **Create Rule**
3. Einstellungen:
   - **Rule name:** `Root to www` (oder `WWW to root`)
   - **Field:** Hostname
   - **Operator:** equals
   - **Value:** `example.com` (ohne www)
   - **Type:** Dynamic
   - **Expression:** `concat("https://www.example.com", http.request.uri.path)`
   - **Status code:** 301
4. **Deploy**

## NIEMALS Workers als Redirect-Workaround!

Workers für Redirects sind:
- Unnötig komplex
- Schwerer zu warten
- Nicht die Standard-Lösung

Redirect Rules im Dashboard sind:
- Einfach
- Standard bei Cloudflare
- Wie bei allen anderen Projekten (z.B. leyaltech.de)

## Checkliste

- [ ] Zone erstellt/aktiv
- [ ] Nameserver beim Registrar geändert
- [ ] DNS Records (@ und www) auf pages.dev
- [ ] Beide Domains bei Pages hinzugefügt
- [ ] Redirect Rule im Dashboard erstellt
- [ ] SSL-Zertifikate aktiv (automatisch nach ein paar Minuten)
