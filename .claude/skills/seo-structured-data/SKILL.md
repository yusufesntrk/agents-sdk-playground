---
name: seo-structured-data
description: This skill should be used when the user asks to "add structured data", "implement Schema.org", "add JSON-LD", "create FAQ schema", "add Organization markup", or needs guidance on rich snippets, Article schema, LocalBusiness, or BreadcrumbList.
---

# Structured Data (Schema.org)

JSON-LD implementation for rich search results.

---

## Why Structured Data?

Structured data enables rich snippets:

```
Normal result:
LeyalTech | Automatisierung
https://leyaltech.de
Description text here...

Rich result:
LeyalTech | Automatisierung ⭐⭐⭐⭐⭐ (23 reviews)
https://leyaltech.de
Description text here...
├── Service 1
├── Service 2
└── FAQ: How does it work?
```

---

## JSON-LD Format

Always use JSON-LD (recommended by Google):

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name"
}
</script>
```

---

## Organization Schema

For company/brand pages:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "alternateName": "Company GmbH",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "Company description here",
  "foundingDate": "2023",
  "founders": [
    {
      "@type": "Person",
      "name": "Founder Name"
    }
  ],
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Musterstraße 1",
    "addressLocality": "Berlin",
    "postalCode": "10115",
    "addressCountry": "DE"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+49-XXX-XXXXXXX",
    "contactType": "customer service",
    "availableLanguage": ["German", "English"]
  },
  "sameAs": [
    "https://www.linkedin.com/company/example",
    "https://twitter.com/example"
  ]
}
```

---

## LocalBusiness Schema

For businesses with physical location:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "image": "https://example.com/office.jpg",
  "url": "https://example.com",
  "telephone": "+49-XXX-XXXXXXX",
  "priceRange": "€€€",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Musterstraße 1",
    "addressLocality": "Berlin",
    "postalCode": "10115",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 52.5200,
    "longitude": 13.4050
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "18:00"
    }
  ]
}
```

---

## FAQ Schema

For FAQ pages/sections (shows in search):

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Was kostet der Service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die Kosten hängen vom Umfang ab. Wir bieten Pakete ab 2.000€ monatlich an."
      }
    },
    {
      "@type": "Question",
      "name": "Wie lange dauert die Implementierung?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Die Implementierung dauert typischerweise 2-4 Wochen."
      }
    }
  ]
}
```

---

## Service Schema

For service pages:

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Business Process Automation",
  "name": "CRM Automatisierung",
  "description": "Automatisiere dein CRM und spare 20 Stunden pro Woche.",
  "provider": {
    "@type": "Organization",
    "name": "Company Name"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Germany"
  }
}
```

---

## Article Schema

For blog posts:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "10 Wege zur Prozessoptimierung",
  "description": "Erfahre, wie du deine Geschäftsprozesse optimieren kannst.",
  "image": "https://example.com/blog/article-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Company Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20"
}
```

---

## BreadcrumbList Schema

For navigation breadcrumbs:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://example.com/services"
    }
  ]
}
```

---

## React Implementation

```tsx
interface SchemaProps {
  type: "Organization" | "FAQPage" | "Article" | "Service";
  data: Record<string, any>;
}

const StructuredData = ({ type, data }: SchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
```

---

## Testing & Validation

### Google Tools
- [Rich Results Test](https://search.google.com/test/rich-results)
- [Schema Markup Validator](https://validator.schema.org/)

### What to Check
- No errors in validation
- All required properties present
- URLs are absolute (not relative)
- Images are accessible

---

## Checklist

### Homepage
- [ ] Organization schema
- [ ] Logo URL is absolute
- [ ] Social profiles linked (sameAs)

### Service Pages
- [ ] Service schema
- [ ] BreadcrumbList
- [ ] Provider linked to Organization

### Blog/Articles
- [ ] Article schema
- [ ] Author information
- [ ] Dates (published, modified)

### FAQ Sections
- [ ] FAQPage schema
- [ ] Each Q&A properly formatted

### All Pages
- [ ] Valid JSON-LD syntax
- [ ] Tested with Rich Results Test
