---
name: resend-email-branding
description: Setup custom transactional emails with Resend API, corporate branding, and Supabase Edge Functions. Use when implementing branded auth emails, magic links, password reset, invitations, or any transactional email with company logo and design.
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---

# Resend Email Branding

Vollständige Anleitung für gebrandete Transaktions-E-Mails mit Resend API und Supabase Edge Functions.

## Übersicht

Diese Skill dokumentiert wie man:
1. Resend Domain verifiziert
2. DNS Records für Deliverability einrichtet (SPF, DKIM, DMARC)
3. Logo als PNG mit transparentem Hintergrund konvertiert
4. Supabase Edge Function für Auth Emails erstellt
5. Professionelle HTML Email Templates mit Corporate Design baut

## Voraussetzungen

- Resend Account (https://resend.com)
- Verifizierte Domain in Resend
- Supabase Projekt mit Edge Functions
- Logo als SVG Datei

## 1. Resend Setup

### Domain verifizieren

1. In Resend Dashboard → Domains → Add Domain
2. Domain eingeben (z.B. `shortselect.com`)
3. DNS Records hinzufügen die Resend anzeigt

### API Key erstellen

1. Settings → API Keys → Create API Key
2. Key sicher speichern (beginnt mit `re_`)

## 2. DNS Records für Deliverability

### Erforderliche Records

```
# SPF Record (TXT)
Host: @
Value: v=spf1 include:resend.com ~all

# DKIM Record (wird von Resend bereitgestellt)
Host: resend._domainkey
Value: [von Resend Dashboard kopieren]

# DMARC Record (TXT)
Host: _dmarc
Value: v=DMARC1; p=none;
```

### DNS via Hostinger API

```bash
curl -X PUT "https://developers.hostinger.com/api/dns/v1/zones/DOMAIN" \
  -H "Authorization: Bearer $HOSTINGER_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "overwrite": false,
    "zone": [
      {"type": "TXT", "host": "@", "value": "v=spf1 include:resend.com ~all", "ttl": 3600},
      {"type": "TXT", "host": "_dmarc", "value": "v=DMARC1; p=none;", "ttl": 3600}
    ]
  }'
```

### DNS via Cloudflare API

```bash
CF_TOKEN="your-cloudflare-token"
ZONE_ID="your-zone-id"

# SPF Record
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"TXT","name":"@","content":"v=spf1 include:resend.com ~all","ttl":3600}'

# DMARC Record
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"TXT","name":"_dmarc","content":"v=DMARC1; p=none;","ttl":3600}'
```

## 3. Logo für E-Mails vorbereiten

### Problem
- E-Mail Clients blockieren SVGs
- Screenshots haben weißen Hintergrund
- Logo muss als PNG mit Transparenz vorliegen

### Lösung: SVG zu PNG mit rsvg-convert

```bash
# Installation (macOS)
brew install librsvg

# Konvertierung mit 3x Auflösung für Retina
rsvg-convert -w 960 logo.svg -o logo-email.png

# Ergebnis prüfen
file logo-email.png
# Sollte zeigen: PNG image data, 960 x XXX, 8-bit/color RGBA
```

### Logo auf Supabase Storage hochladen

```bash
# 1. Storage Bucket erstellen (einmalig)
# Via SQL oder Supabase Dashboard

# 2. Logo hochladen
curl -X POST "https://PROJECT.supabase.co/storage/v1/object/assets/logo-email.png" \
  -H "apikey: ANON_KEY" \
  -H "Authorization: Bearer ANON_KEY" \
  -H "Content-Type: image/png" \
  --data-binary "@logo-email.png"

# 3. Public URL
# https://PROJECT.supabase.co/storage/v1/object/public/assets/logo-email.png
```

### Storage Policy für öffentlichen Zugriff

```sql
-- Bucket erstellen
INSERT INTO storage.buckets (id, name, public)
VALUES ('assets', 'assets', true);

-- Public Read Policy
CREATE POLICY "Public read access for assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Upload Policy (optional, für authentifizierte User)
CREATE POLICY "Authenticated upload to assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets');
```

## 4. Supabase Edge Function

### Dateistruktur

```
supabase/
└── functions/
    └── send-auth-email/
        └── index.ts
```

### Edge Function Code

```typescript
// supabase/functions/send-auth-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_URL = "https://api.resend.com/emails";
const SENDER_EMAIL = "noreply@yourdomain.com";
const SENDER_NAME = "YourCompany";
const LOGO_URL = "https://PROJECT.supabase.co/storage/v1/object/public/assets/logo-email.png";

interface AuthEmailPayload {
  user: {
    id: string;
    email: string;
    user_metadata?: Record<string, unknown>;
  };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_link: string;
    site_url: string;
  };
}

// Header mit Logo
const getHeader = () => `
  <tr>
    <td style="background: #ffffff; padding: 32px 40px; text-align: center; border-bottom: 1px solid #e9ecef;">
      <img src="${LOGO_URL}" alt="${SENDER_NAME}" width="220" style="display: block; margin: 0 auto;" />
    </td>
  </tr>`;

// Footer
const getFooter = () => `
  <tr>
    <td style="background: #f8f9fa; padding: 24px 40px; border-top: 1px solid #e9ecef;">
      <p style="color: #adb5bd; font-family: 'Segoe UI', Arial, sans-serif; font-size: 12px; margin: 0; text-align: center;">
        © ${new Date().getFullYear()} ${SENDER_NAME} · Ihr Slogan hier
      </p>
    </td>
  </tr>`;

// Email Templates
const templates: Record<string, { subject: string; getHtml: (link: string) => string }> = {
  magiclink: {
    subject: "Ihr Login-Link",
    getHtml: (link: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
          ${getHeader()}
          <tr>
            <td style="padding: 48px 40px;">
              <h1 style="color: #1a1a1a; font-family: 'Segoe UI', Arial, sans-serif; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
                Willkommen zurück! 👋
              </h1>
              <p style="color: #4a5568; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0;">
                Klicken Sie auf den Button, um sich sicher anzumelden. Der Link ist 60 Minuten gültig.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin: 0 auto 32px auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #8B0000 0%, #DC2626 100%); border-radius: 10px; box-shadow: 0 4px 14px rgba(220, 38, 38, 0.4);">
                    <a href="${link}" style="display: inline-block; color: #ffffff; font-family: 'Segoe UI', Arial, sans-serif; font-size: 16px; font-weight: 600; text-decoration: none; padding: 16px 40px;">
                      Jetzt anmelden →
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color: #9ca3af; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; line-height: 1.5; margin: 0; text-align: center;">
                Sie haben diese Anmeldung nicht angefordert?<br>
                Ignorieren Sie diese E-Mail einfach.
              </p>
            </td>
          </tr>
          ${getFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  },

  signup: {
    subject: "Bestätigen Sie Ihre E-Mail-Adresse",
    getHtml: (link: string) => `<!-- Signup Template hier -->`,
  },

  recovery: {
    subject: "Passwort zurücksetzen",
    getHtml: (link: string) => `<!-- Recovery Template hier -->`,
  },

  invite: {
    subject: "Sie wurden eingeladen",
    getHtml: (link: string) => `<!-- Invite Template hier -->`,
  },
};

serve(async (req) => {
  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload = await req.json();
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/");
    let emailType = pathParts[pathParts.length - 1];

    if (!emailType || emailType === "send-auth-email") {
      emailType = payload.email_type || "magiclink";
    }

    const { user, email_data } = payload as AuthEmailPayload;

    if (!user?.email) {
      throw new Error("Missing user email");
    }

    const template = templates[emailType] || templates.magiclink;
    const actionLink = email_data?.email_action_link || email_data?.redirect_to || "";

    if (!actionLink) {
      throw new Error("Missing email action link");
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: [user.email],
        subject: template.subject,
        html: template.getHtml(actionLink),
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, emailId: result.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### Deployment

```bash
# Secret setzen
supabase secrets set RESEND_API_KEY=re_xxxx --project-ref PROJECT_REF

# Function deployen (no-verify-jwt für Auth Hooks!)
supabase functions deploy send-auth-email --no-verify-jwt --project-ref PROJECT_REF
```

## 5. Supabase Auth Hook konfigurieren

### Via Supabase Dashboard

1. Authentication → Hooks
2. "Send Email" Hook aktivieren
3. Edge Function URL eintragen:
   `https://PROJECT.supabase.co/functions/v1/send-auth-email`

### Via Management API

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/PROJECT_REF/config/auth" \
  -H "Authorization: Bearer SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "hook_send_email_enabled": true,
    "hook_send_email_uri": "https://PROJECT.supabase.co/functions/v1/send-auth-email"
  }'
```

## 6. Testen

### Direkt via Resend API

```bash
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer re_xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "Company <noreply@domain.com>",
    "to": ["test@example.com"],
    "subject": "Test Email",
    "html": "<h1>Test</h1>"
  }'
```

### Via Supabase Auth (Magic Link)

```bash
curl -X POST "https://PROJECT.supabase.co/auth/v1/magiclink" \
  -H "apikey: ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Edge Function Logs prüfen

```bash
supabase functions logs send-auth-email --project-ref PROJECT_REF
```

## Troubleshooting

### E-Mail landet im Spam
- SPF, DKIM, DMARC Records prüfen
- Domain in Resend verifizieren
- Reputation aufbauen (langsam starten)

### Logo wird nicht angezeigt
- URL öffentlich erreichbar? (curl testen)
- HTTPS verwenden
- PNG Format (kein SVG!)
- Größe: max 100KB empfohlen

### Edge Function Fehler
- Logs prüfen: `supabase functions logs`
- RESEND_API_KEY Secret gesetzt?
- `--no-verify-jwt` beim Deploy?

### Rate Limit
- Supabase Auth: 4 Emails/Stunde pro User
- Resend Free: 100 Emails/Tag
- Für Tests: Direkt Resend API nutzen

## Best Practices

### Logo
- 3x Auflösung für Retina (z.B. 960px breit, angezeigt bei 320px)
- PNG mit transparentem Hintergrund
- Auf CDN/Storage hosten (nicht Base64)

### Templates
- Inline CSS (kein externes Stylesheet)
- Table-basiertes Layout für Outlook
- System Fonts (Arial, Helvetica, sans-serif)
- Max-width: 600px für mobile

### Sicherheit
- API Keys nie im Code
- Secrets via Supabase Dashboard
- Rate Limiting beachten

### Deliverability
- Konsistenter Absender-Name
- Klare Betreffzeilen
- Unsubscribe-Link (bei Marketing)
- Text-Version als Fallback
