# Deploy Preview: $ARGUMENTS

Deployt eine Website als Preview für Kunden-Akquise auf Cloudflare Pages.

**Nutzung:**
```
/deploy-preview <projekt-name> [build-ordner]
```

**Beispiele:**
```
/deploy-preview baeckerei-mueller
/deploy-preview autohaus-schmidt ./dist
/deploy-preview restaurant-roma ./build
```

## Was passiert

1. **Build ausführen** (falls package.json vorhanden)
2. **Deploy zu Cloudflare Pages** mit dem angegebenen Projektnamen
3. **URL ausgeben** - z.B. `https://baeckerei-mueller.pages.dev`

## Schritte

### 1. Prüfe ob Wrangler installiert ist
```bash
which wrangler || npm install -g wrangler
```

### 2. Prüfe ob eingeloggt
```bash
wrangler whoami || wrangler login
```

### 3. Build ausführen (falls nötig)
```bash
# Falls package.json existiert und build script vorhanden
npm run build
```

### 4. Deploy
```bash
# Standard: ./dist, ./build, ./out oder ./public
npx wrangler pages deploy <build-ordner> --project-name=<projekt-name>
```

### 5. URL ausgeben
Nach dem Deploy wird die URL angezeigt:
```
https://<projekt-name>.pages.dev
```

## Tipps

- **Projektname**: Verwende Kundenname + "preview" z.B. `mueller-baeckerei-preview`
- **Build-Ordner**: Standard ist `./dist`, bei Next.js `./out`, bei CRA `./build`
- **Mehrere Versionen**: Nutze unterschiedliche Namen wie `mueller-v1`, `mueller-v2`

## Nach Kundenzusage

Nutze `/deploy-live` um die Custom Domain hinzuzufügen.
