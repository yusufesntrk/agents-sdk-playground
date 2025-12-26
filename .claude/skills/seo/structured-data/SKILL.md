---
name: seo-structured-data
description: Schema.org structured data (JSON-LD) for rich snippets in search results. Use when implementing Organization, LocalBusiness, FAQ, Article, Product, or other schema types.
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
  "name": "LeyalTech"
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
  "name": "LeyalTech",
  "alternateName": "LeyalTech GmbH",
  "url": "https://leyaltech.de",
  "logo": "https://leyaltech.de/logo.png",
  "description": "Automatisierung für Recruiting-Agenturen",
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
    "https://www.linkedin.com/company/leyaltech",
    "https://twitter.com/leyaltech"
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
  "name": "LeyalTech",
  "image": "https://leyaltech.de/office.jpg",
  "url": "https://leyaltech.de",
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
      "name": "Was kostet die Automatisierung?",
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
    "name": "LeyalTech"
  },
  "areaServed": {
    "@type": "Country",
    "name": "Germany"
  },
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Automatisierungs-Services",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "CRM Integration"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Workflow Automatisierung"
        }
      }
    ]
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
  "image": "https://leyaltech.de/blog/article-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://leyaltech.de/team/author"
  },
  "publisher": {
    "@type": "Organization",
    "name": "LeyalTech",
    "logo": {
      "@type": "ImageObject",
      "url": "https://leyaltech.de/logo.png"
    }
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://leyaltech.de/blog/prozessoptimierung"
  }
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
      "item": "https://leyaltech.de"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Services",
      "item": "https://leyaltech.de/services"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "CRM Automatisierung",
      "item": "https://leyaltech.de/services/crm"
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

// Usage
<StructuredData
  type="FAQPage"
  data={{
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  }}
/>
```

---

## Multiple Schemas

You can have multiple schemas on one page:

```tsx
const PageWithMultipleSchemas = () => (
  <Head>
    {/* Organization - site-wide */}
    <StructuredData type="Organization" data={orgData} />

    {/* BreadcrumbList - page navigation */}
    <StructuredData type="BreadcrumbList" data={breadcrumbData} />

    {/* FAQPage - page content */}
    <StructuredData type="FAQPage" data={faqData} />
  </Head>
);
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
- [ ] Publisher information
- [ ] Dates (published, modified)

### FAQ Sections
- [ ] FAQPage schema
- [ ] Each Q&A properly formatted

### All Pages
- [ ] Valid JSON-LD syntax
- [ ] Tested with Rich Results Test
- [ ] No duplicate schemas of same type
