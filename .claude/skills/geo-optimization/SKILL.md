---
name: geo-optimization
description: Generative Engine Optimization for AI visibility. Use when optimizing content for AI search engines like ChatGPT, Perplexity, Google AI Overviews, or when user asks about AI-Zitierung, LLM visibility, or AI-SEO.
---

# GEO (Generative Engine Optimization) Skill

## Trigger
Verwende diesen Skill wenn:
- User fragt nach "GEO", "AI-Optimierung", "ChatGPT SEO", "LLM Sichtbarkeit"
- Website für AI-Zitierung optimiert werden soll
- Content für ChatGPT, Claude, Perplexity optimiert werden soll
- Schema Markup für AI-Engines erweitert werden soll

## Was ist GEO?

GEO (Generative Engine Optimization) optimiert Websites dafür, von AI-Systemen (ChatGPT, Claude, Perplexity, Google AI Overviews) zitiert zu werden. Anders als SEO (Ranking in SERPs) geht es um **Zitierung in AI-Antworten**.

**Kernstatistiken:**
- AI-Traffic stieg 2025 um 527%
- ChatGPT hat 400+ Mio. wöchentliche Nutzer
- LLMs zitieren nur 2-7 Domains pro Antwort (vs. 10 Google-Ergebnisse)
- H2→H3→Bulletpoint-Struktur = 40% mehr Zitierungen
- Direkte Antworten = 67% mehr Zitierungen
- Seiten mit Original-Daten = 4.1x mehr Zitierungen

---

## 1) Content für AI-Zitierung

### Headlines als Fragen (H2/H3)

**Schlecht:**
```
"Sales-Systeme für Recruiting-Agenturen"
"3 Schritte zum Erfolg"
```

**Gut:**
```
"Was ist ein Sales-System für Recruiting-Agenturen?"
"Wie kann ich als Recruiting-Agentur mehr Kunden gewinnen?"
"Welche Voraussetzungen brauche ich für ein automatisiertes Vertriebssystem?"
```

### Direkte Antwort (erste 2-3 Sätze)

Direkt unter jeder Frage-Headline eine kurze, klare Antwort:

```tsx
<h2>Was kostet ein Sales-System für Recruiting-Agenturen?</h2>
<p className="text-lg font-medium">
  Ein professionelles Sales-System kostet zwischen 2.000 und 6.000 Euro.
  Der Preis hängt von Zielmarktgröße, Automatisierungstiefe und Funktionsumfang ab.
</p>
```

### TL;DR-Block Template

```tsx
const TLDRBlock = ({ summary }: { summary: string }) => (
  <div className="bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6">
    <p className="font-semibold text-sm text-primary mb-1">TL;DR</p>
    <p className="text-foreground">{summary}</p>
  </div>
);
```

### E-E-A-T sichtbar machen

1. **Experience**: Mini-Cases einbauen
   - "In 47 Projekten mit Recruiting-Agenturen haben wir..."
   - "Unsere Kunden erreichen durchschnittlich +200% mehr Bewerbungen"

2. **Expertise**: Autor-Bio mit Credentials
   ```tsx
   <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
     <img src="/team/yusuf.jpg" className="w-16 h-16 rounded-full" />
     <div>
       <p className="font-bold">Yusuf Esentürk</p>
       <p className="text-sm text-muted-foreground">
         Gründer LeyalTech | 5+ Jahre Sales-Automatisierung |
         100+ Recruiting-Agenturen betreut
       </p>
     </div>
   </div>
   ```

3. **Authoritativeness**: Externe Quellen zitieren
   - "Laut einer Studie von XYZ..."
   - Statistiken mit Quellenangabe

4. **Trustworthiness**: Grenzen/Objections ansprechen
   - "Wann ist unser System NICHT geeignet?"
   - "Für wen funktioniert das nicht?"

### Formatierung die AI liebt

1. **Bulletpoints & Numbered Steps**
   ```tsx
   <ol className="list-decimal pl-6 space-y-2">
     <li>Termin auswählen (45 Min. einplanen)</li>
     <li>Formular mit Agentur-Details ausfüllen</li>
     <li>Roadmap im 1:1 Gespräch erhalten</li>
   </ol>
   ```

2. **FAQs im Q/A-Stil**
   - Frage als `<dt>` oder Accordion-Trigger
   - Kurze, eindeutige Antwort (max. 2-3 Sätze)

3. **Tabellen für Vergleiche**
   ```tsx
   <table>
     <thead>
       <tr>
         <th>Kriterium</th>
         <th>Mit LeyalTech</th>
         <th>Ohne System</th>
       </tr>
     </thead>
     <tbody>
       <tr>
         <td>Neukunden/Monat</td>
         <td>2-3 garantiert</td>
         <td>0-1 (zufällig)</td>
       </tr>
     </tbody>
   </table>
   ```

### Semantik statt Keyword-Spam

Verwandte Begriffe natürlich einbauen:
- Recruiting-Agentur, Personalvermittlung, Headhunter, HR-Dienstleister
- Sales-System, Vertriebsautomatisierung, Outreach, Lead-Generierung
- Neukunden, Aufträge, Mandate, Kunden gewinnen

---

## 2) Technische Basics

### robots.txt für AI-Crawler

```txt
# AI Crawlers - Willkommen!
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /

Sitemap: https://www.example.com/sitemap.xml
```

### llms.txt erstellen

Neuer Standard für AI-Engines - in `public/llms.txt`:

```txt
# [Firmenname] - AI Instructions

> [Einzeiler-Beschreibung]

## What We Do
[2-3 Sätze Kerngeschäft]

## Key Facts
- Zielgruppe: [...]
- Ergebnis: [...]
- Investition: [...]
- Region: [...]

## Products/Services
- [Produkt 1]: [Beschreibung]
- [Produkt 2]: [Beschreibung]

## Contact
Website: https://...
Email: ...
```

### Bing Webmaster Tools

ChatGPT Search nutzt Bing-Index! Daher:
1. https://www.bing.com/webmasters aufrufen
2. Domain verifizieren (DNS oder Meta-Tag)
3. Sitemap einreichen

### HTML-Text statt nur JS

- Wichtige Inhalte als echten HTML-Text
- Alt-Texte für alle Bilder
- Video-Transkripte bereitstellen
- Sprechende Ankertexte ("Termin buchen" statt "hier klicken")

---

## 3) Schema Markup

### Organization Schema (Basis - bereits vorhanden)

```typescript
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LeyalTech",
  url: "https://www.leyaltech.de",
  logo: "https://www.leyaltech.de/logo.png",
  email: "info@leyaltech.de",
  address: { ... },
  sameAs: ["https://linkedin.com/company/..."]
};
```

### Person Schema (Gründer/Autor)

```typescript
const founderSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Yusuf Esentürk",
  jobTitle: "Gründer & Geschäftsführer",
  worksFor: {
    "@type": "Organization",
    name: "LeyalTech"
  },
  description: "Experte für Sales-Automatisierung mit Fokus auf Recruiting-Agenturen",
  sameAs: ["https://linkedin.com/in/..."]
};
```

### Review/Testimonial Schema

```typescript
const generateReviewSchema = (reviews: Review[]) => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LeyalTech",
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: reviews.length.toString()
  },
  review: reviews.map(r => ({
    "@type": "Review",
    author: {
      "@type": "Person",
      name: r.name
    },
    reviewBody: r.quote,
    reviewRating: {
      "@type": "Rating",
      ratingValue: "5"
    }
  }))
});
```

### HowTo Schema (für Steps/Prozesse)

```typescript
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Wie buche ich ein Erstgespräch bei LeyalTech?",
  description: "In 3 Schritten zum kostenlosen Strategiegespräch",
  step: [
    {
      "@type": "HowToStep",
      name: "Termin auswählen",
      text: "Wähle im Kalender einen freien Slot aus"
    },
    {
      "@type": "HowToStep",
      name: "Formular ausfüllen",
      text: "Beantworte die Fragen zu deiner Agentur"
    },
    {
      "@type": "HowToStep",
      name: "Roadmap erhalten",
      text: "Im 1:1 Gespräch erhältst du deine individuelle Roadmap"
    }
  ]
};
```

---

## 4) Authority & Trust

### On-Page Trust Signals

1. **Autorbox mit Credentials** auf jeder Seite
2. **Quellen/Studien** zitieren wo möglich
3. **Echte Zahlen** aus Kundenprojekten
4. **"Was wir NICHT tun"** - Grenzen kommunizieren

### Off-Page Trust (extern)

1. **Backlinks** von Branchenportalen
2. **Erwähnungen** in "Best of"-Listen
3. **Reviews** auf Google, ProvenExpert
4. **LinkedIn-Präsenz** des Gründers

### Topical Authority

Thema von allen Seiten abdecken:
- Hauptseite: Sales-Systeme für Recruiting
- Unterseite 1: Was kostet Vertriebsautomatisierung?
- Unterseite 2: Recruiting-Agentur skalieren: 7 Strategien
- Blog: Case Studies, How-Tos, Branchentrends

---

## 5) Tracking & Messung

### Brand Mentions tracken

Tools:
- Surfer AI Tracker
- Brand24
- Mention

### AI-Crawler in Analytics

```javascript
// Google Analytics Custom Dimension für AI-Traffic
if (navigator.userAgent.includes('GPTBot') ||
    navigator.userAgent.includes('ClaudeBot')) {
  gtag('event', 'ai_crawler_visit');
}
```

### Manuelle Tests

Regelmäßig in ChatGPT/Perplexity fragen:
- "Welche Firma hilft Recruiting-Agenturen bei der Kundenakquise?"
- "Was kostet ein Sales-System für Personalvermittler?"
- "LeyalTech Erfahrungen"

---

## Quick-Checkliste für neue Seiten

- [ ] H2/H3 als Fragen formuliert?
- [ ] TL;DR-Block am Anfang?
- [ ] Direkte Antwort in ersten 2-3 Sätzen?
- [ ] Zahlen/Statistiken eingebaut?
- [ ] FAQ-Sektion vorhanden?
- [ ] Schema Markup hinzugefügt?
- [ ] Alt-Texte für Bilder?
- [ ] Sprechende Ankertexte?
- [ ] Autor-Info sichtbar?

---

## Quellen

- [Profound - 10-Step GEO Framework](https://www.tryprofound.com/guides/generative-engine-optimization-geo-guide-2025)
- [Backlinko - GEO Guide](https://backlinko.com/generative-engine-optimization-geo)
- [Superprompt - AI Traffic Analysis](https://superprompt.com/blog/ai-traffic-up-527-percent-how-to-get-cited-by-chatgpt-claude-perplexity-2025)
- [Princeton GEO Research Paper](https://arxiv.org/pdf/2311.09735)
