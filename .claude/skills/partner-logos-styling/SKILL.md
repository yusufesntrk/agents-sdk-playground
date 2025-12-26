---
name: partner-logos-styling
description: This skill should be used when the user asks to "add partner logos", "style client logos", "make logos uniform", "add company logos section", "trusted by logos", or needs to display multiple brand logos in a consistent, professional style on light or dark backgrounds.
---

# Partner Logos Styling

Pattern für einheitliche Darstellung von Partner-/Kundenlogos in "Trusted by" oder "Our Clients" Sektionen.

## Das Problem

Firmenlogos haben unterschiedliche:
- Farben (bunt, einfarbig, dunkel, hell)
- Formate (PNG, SVG, mit/ohne Transparenz)
- Größen und Proportionen

Ohne Vereinheitlichung wirkt die Logo-Sektion chaotisch und unprofessionell.

## Die Lösung: CSS Filter

### Variante 1: Schwarze Logos (für helle Hintergründe)

```tsx
<img
  src={logo}
  alt={name}
  className="h-8 md:h-9 w-auto object-contain brightness-0"
/>
```

`brightness-0` macht jedes Logo komplett schwarz - unabhängig von der Originalfarbe.

### Variante 2: Weiße Logos (für dunkle Hintergründe)

```tsx
<img
  src={logo}
  alt={name}
  className="h-8 md:h-9 w-auto object-contain brightness-0 invert"
/>
```

`brightness-0 invert` macht Logos erst schwarz, dann invertiert zu weiß.

### Variante 3: Corporate Color (z.B. Blau)

```tsx
<img
  src={logo}
  alt={name}
  className="h-8 md:h-9 w-auto object-contain"
  style={{
    filter: 'brightness(0) saturate(100%) invert(22%) sepia(97%) saturate(1500%) hue-rotate(200deg) brightness(95%)'
  }}
/>
```

Für spezifische Markenfarben den Filter mit einem Tool wie [CSS Filter Generator](https://codepen.io/sosuke/pen/Pjoqqp) generieren.

## Vollständiges Komponenten-Pattern

```tsx
const PartnerLogos = () => {
  const partners = [
    { name: "Company A", logo: "/logos/company-a.png" },
    { name: "Company B", logo: "/logos/company-b.svg" },
    { name: "Company C", initials: "C" }, // Fallback ohne Logo
  ];

  return (
    <section className="py-10 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Trust Headline */}
        <p className="text-sm font-medium text-muted-foreground mb-8 text-center">
          Vertraut von <span className="text-primary font-bold">10+</span> Unternehmen
        </p>

        {/* Logo Grid */}
        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center justify-center h-10 opacity-60 hover:opacity-100 transition-opacity duration-300"
            >
              {partner.logo ? (
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-8 md:h-9 w-auto object-contain brightness-0"
                />
              ) : (
                <span className="font-semibold text-foreground text-base md:text-lg tracking-wide">
                  {partner.initials || partner.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

## Styling-Details

### Container-Klassen

| Klasse | Zweck |
|--------|-------|
| `h-10` | Einheitliche Container-Höhe |
| `opacity-60` | Dezenter Normalzustand |
| `hover:opacity-100` | Volle Sichtbarkeit bei Hover |
| `transition-opacity duration-300` | Sanfte Animation |

### Logo-Klassen

| Klasse | Zweck |
|--------|-------|
| `h-8 md:h-9` | Responsive Logo-Höhe |
| `w-auto` | Proportionen beibehalten |
| `object-contain` | Kein Cropping |
| `brightness-0` | Schwarz (hell BG) |
| `brightness-0 invert` | Weiß (dunkel BG) |

### Grid-Klassen

| Klasse | Zweck |
|--------|-------|
| `flex flex-wrap` | Flexibles Wrapping |
| `items-center justify-center` | Zentriert |
| `gap-10 md:gap-14` | Großzügiger Abstand |

## Fallback für fehlende Logos

Wenn ein Partner kein Logo hat, Initials oder Namen anzeigen:

```tsx
{partner.logo ? (
  <img ... />
) : (
  <span className="font-semibold text-foreground">
    {partner.initials || partner.name}
  </span>
)}
```

## Häufige Fehler vermeiden

### Fehler 1: Weiße Logos auf weißem Hintergrund

```tsx
// FALSCH - unsichtbar auf hellem Hintergrund
className="brightness-0 invert"

// RICHTIG - schwarz auf hellem Hintergrund
className="brightness-0"
```

### Fehler 2: Unterschiedliche Logo-Höhen

```tsx
// FALSCH - jedes Logo andere Größe
className="w-24" // oder keine Höhe definiert

// RICHTIG - einheitliche Höhe, auto Breite
className="h-8 md:h-9 w-auto"
```

### Fehler 3: Zu wenig Abstand

```tsx
// FALSCH - Logos kleben zusammen
className="gap-4"

// RICHTIG - großzügiger Abstand
className="gap-10 md:gap-14"
```

### Fehler 4: Fehlender Hover-Effekt

```tsx
// BESSER - mit subtiler Interaktion
className="opacity-60 hover:opacity-100 transition-opacity"
```

## Responsive Überlegungen

- **Mobile:** Logos wrappen automatisch dank `flex-wrap`
- **Tablet/Desktop:** Einzeilige Darstellung wenn möglich
- **Große Screens:** `max-w-4xl` verhindert zu weite Streuung

## Barrierefreiheit

- Immer `alt`-Attribut mit Firmennamen setzen
- Opacity nicht unter 0.5 für ausreichenden Kontrast
- Logos sollten auch ohne Farbe erkennbar sein (daher funktioniert brightness-0 gut)
