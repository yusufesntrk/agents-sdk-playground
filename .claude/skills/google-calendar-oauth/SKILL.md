---
name: google-calendar-oauth
description: Setup Google Calendar OAuth 2.0 integration with Supabase Edge Functions. Use when implementing calendar sync, Google Calendar connection, OAuth flow for calendars, or when user asks to "connect calendar", "add Google Calendar", "calendar integration".
---

# Google Calendar OAuth Integration

Setup einer vollständigen Google Calendar OAuth 2.0 Integration mit Supabase Edge Functions.

## Wann diesen Skill verwenden

- User will Google Calendar verbinden
- Kalender-Sync implementieren
- Interview-Scheduling mit externem Kalender
- OAuth 2.0 Flow für Google APIs

## Voraussetzungen

- Google Cloud CLI (`gcloud`) authentifiziert
- Supabase Projekt mit Edge Functions
- Supabase CLI oder MCP Tool Zugriff

## Kompletter Setup-Workflow

### Phase 1: Google Cloud Projekt

```bash
# 1. Projekt erstellen
gcloud projects create PROJECT_ID --name="Project Name"

# 2. Projekt aktivieren
gcloud config set project PROJECT_ID

# 3. Calendar API aktivieren
gcloud services enable calendar-json.googleapis.com

# 4. IAP API für OAuth Brand
gcloud services enable iap.googleapis.com

# 5. OAuth Brand erstellen
gcloud alpha iap oauth-brands create \
  --application_title="App Name" \
  --support_email="email@domain.com" \
  --project=PROJECT_ID
```

### Phase 2: OAuth Client erstellen

**WICHTIG:** Der IAP-generierte Client kann KEINE Redirect URIs haben!

**Manuell in Google Cloud Console:**
1. https://console.cloud.google.com/apis/credentials?project=PROJECT_ID
2. "+ CREATE CREDENTIALS" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `App Calendar Client`
5. Authorized redirect URIs:
   ```
   https://PROJECT_REF.supabase.co/functions/v1/calendar-oauth-callback
   ```
6. CREATE → Client ID + Secret kopieren

**Warum nicht via CLI?**
Google bietet KEINE API für OAuth Client Redirect URIs - nur über Console möglich (Sicherheitsgründe).

### Phase 3: Datenbank (Supabase)

```sql
-- ENUM für Provider
CREATE TYPE calendar_provider AS ENUM ('google', 'microsoft');

-- Kalender-Verbindungen Tabelle
CREATE TABLE calendar_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider calendar_provider NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamptz,
  calendar_id text DEFAULT 'primary',
  sync_enabled boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, provider)
);

-- RLS aktivieren
ALTER TABLE calendar_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies (User kann nur eigene sehen/bearbeiten)
CREATE POLICY "Users can view own" ON calendar_connections
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own" ON calendar_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own" ON calendar_connections
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own" ON calendar_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_calendar_connections_user_provider
  ON calendar_connections(user_id, provider);
```

### Phase 4: Edge Function - OAuth Initiate

```typescript
// supabase/functions/calendar-oauth-initiate/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.readonly",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      SUPABASE_URL,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // State mit user_id für CSRF-Schutz
    const state = btoa(JSON.stringify({
      user_id: user.id,
      timestamp: Date.now(),
      nonce: crypto.randomUUID(),
    }));

    const redirectUri = `${SUPABASE_URL}/functions/v1/calendar-oauth-callback`;

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GOOGLE_SCOPES);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    return new Response(
      JSON.stringify({ url: authUrl.toString() }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("OAuth initiate error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
```

### Phase 5: Edge Function - OAuth Callback

```typescript
// supabase/functions/calendar-oauth-callback/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID")!;
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FRONTEND_URL = Deno.env.get("FRONTEND_URL") || "http://localhost:5173";

Deno.serve(async (req: Request) => {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=${encodeURIComponent(error)}`, 302);
    }

    if (!code || !state) {
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=missing_params`, 302);
    }

    // State validieren
    let stateData: { user_id: string; timestamp: number };
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=invalid_state`, 302);
    }

    // State max 10 Minuten alt
    if (Date.now() - stateData.timestamp > 10 * 60 * 1000) {
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=state_expired`, 302);
    }

    const redirectUri = `${SUPABASE_URL}/functions/v1/calendar-oauth-callback`;

    // Token Exchange
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      console.error("Token exchange failed:", await tokenResponse.text());
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=token_exchange_failed`, 302);
    }

    const tokens = await tokenResponse.json();
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Tenant ID vom User holen
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("user_id", stateData.user_id)
      .single();

    if (!profile?.tenant_id) {
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=profile_not_found`, 302);
    }

    // Verbindung speichern
    const { error: dbError } = await supabase
      .from("calendar_connections")
      .upsert({
        user_id: stateData.user_id,
        tenant_id: profile.tenant_id,
        provider: "google",
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt,
        calendar_id: "primary",
        sync_enabled: true,
      }, { onConflict: "user_id,provider" });

    if (dbError) {
      console.error("DB error:", dbError);
      return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=db_error`, 302);
    }

    return Response.redirect(`${FRONTEND_URL}/settings?calendar_connected=google`, 302);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return Response.redirect(`${FRONTEND_URL}/settings?calendar_error=unknown`, 302);
  }
});
```

### Phase 6: Supabase Secrets setzen

```bash
# Mit Supabase CLI
npx supabase secrets set \
  GOOGLE_CLIENT_ID="YOUR_CLIENT_ID.apps.googleusercontent.com" \
  GOOGLE_CLIENT_SECRET="GOCSPX-YOUR_SECRET" \
  FRONTEND_URL="http://localhost:5173" \
  --project-ref YOUR_PROJECT_REF

# Oder mit Access Token
export SUPABASE_ACCESS_TOKEN="sbp_xxx"
npx supabase secrets set ... --project-ref xxx
```

### Phase 7: Frontend Hook

```typescript
// src/hooks/useCalendarConnection.ts
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export function useInitiateOAuth() {
  return useMutation({
    mutationFn: async (provider: 'google' | 'microsoft') => {
      if (provider === 'microsoft') {
        toast.info('Microsoft Outlook Integration kommt bald!');
        return { provider, status: 'not_implemented' };
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nicht eingeloggt');

      const response = await fetch(`${SUPABASE_URL}/functions/v1/calendar-oauth-initiate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'OAuth Initiierung fehlgeschlagen');
      }

      const { url } = await response.json();
      window.location.href = url;

      return { provider, status: 'redirecting' };
    },
    onError: (error) => {
      toast.error(`Fehler: ${(error as Error).message}`);
    },
  });
}
```

## Deployment Checkliste

- [ ] Google Cloud Projekt erstellt
- [ ] Calendar API aktiviert
- [ ] OAuth Web Client erstellt (NICHT IAP Client!)
- [ ] Redirect URI in Console hinzugefügt
- [ ] `calendar_connections` Tabelle mit RLS
- [ ] Edge Function `calendar-oauth-initiate` deployed (verify_jwt: true)
- [ ] Edge Function `calendar-oauth-callback` deployed (verify_jwt: false!)
- [ ] Supabase Secrets gesetzt (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL)
- [ ] Frontend Hook implementiert

## Bekannte Einschränkungen

1. **Redirect URI nur via Console** - Google bietet keine API dafür
2. **IAP Clients** können keine Redirect URIs haben - immer Web Application Client erstellen
3. **Token Refresh** muss separat implementiert werden (für langlebige Verbindungen)
4. **OAuth Consent Screen** muss für externe User auf "Published" gesetzt werden

## Nächste Schritte nach Setup

- [ ] Token Refresh Logik implementieren
- [ ] Kalender-Events abrufen (Calendar API)
- [ ] Events in externen Kalender schreiben
- [ ] Webhook für bidirektionale Sync
