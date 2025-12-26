# UI Consistency Patterns & Rules

Zentrale Dokumentation für konsistente und benutzerfreundliche UI/UX im ShortSelect-Projekt.

## WICHTIGSTE REGEL
**User Experience vor Komplexität** - Jede UI-Entscheidung muss sich am Benutzer orientieren, nicht an technischer Eleganz.

---

## 1. Header Patterns (KRITISCH)

### Problem: Redundante Header
Doppelte Überschriften verschlechtern die UX erheblich:
```
❌ FALSCH:
Card Header: "Skills"
Inside:     "Skills (5)"

✅ RICHTIG:
Card Header: "Skills (5)"
Inside:     [Content only, no header]
```

### Regel 1.1: Card Components dürfen NUR einen Title haben
- Card Title steht im `<CardHeader>` mit Icon und Count
- Innere Components (NotesSection, SkillsManager) verstecken ihren Header mit `showHeader={false}`

**Beispiel:**
```tsx
<Card>
  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <Star className="h-5 w-5" />
      Skills ({skills?.length || 0})
    </CardTitle>
  </CardHeader>
  <CardContent>
    <SkillsManager
      candidateId={id}
      skills={skills}
      showHeader={false}  // ← Versteckt inneren Header
    />
  </CardContent>
</Card>
```

### Regel 1.2: Count-Anzeigen gehören IMMER in Card Titles
Nicht neben dem Title, nicht im Body - IN dem Title in Klammern:
```
✅ "Bewerbungen (5)"
✅ "Skills (3)"
✅ "Notizen"  [wenn nur 0 oder 1]

❌ "Bewerbungen" mit separatem Badge
❌ "Skills" mit Counter im Body
```

### Regel 1.3: Sections innerhalb einer Komponente nutzen `h4` mit `font-semibold`
Für Sub-Sections (z.B. in Dialogs):
```tsx
<div className="space-y-3">
  <h4 className="font-semibold">Notizen</h4>
  <NotesSection showHeader={false} />
</div>
```

---

## 2. Button Patterns (KRITISCH)

### Regel 2.0: KEINE doppelten Button-Texte in einem View
Zwei Buttons mit identischem Text verwirren Benutzer:
```
❌ FALSCH:
Dialog hat "Speichern" Button
Eingebettete Komponente hat auch "Speichern" Button
→ User weiß nicht welchen er klicken soll

✅ RICHTIG:
Haupt-Button: "Speichern"
Neben-Button: "Notizen speichern" (spezifisch + variant="outline")
```

### Regel 2.0.1: Eingebettete Komponenten mit eigenen Buttons
Wenn eine Komponente in einem Dialog eingebettet wird und eigene Speichern-Buttons hat:
- Button-Text MUSS spezifisch sein (z.B. "Notizen speichern", "Skills speichern")
- Button-Variant MUSS sich unterscheiden (`variant="outline"`)
- ODER: Komponente soll keinen eigenen Button haben, wenn Parent speichert

**Beispiel NotesSection in Dialog:**
```tsx
// NotesSection.tsx
<Button
  size="sm"
  variant="outline"                    // ← Unterscheidbar
  onClick={handleSave}
>
  {isSaving ? "Speichert..." : "Notizen speichern"}  // ← Spezifisch
</Button>
```

### Regel 2.0.2: QA-Test prüft automatisch
Der QA-Agent prüft jeden Dialog auf doppelte Button-Texte.
Test schlägt fehl wenn gleicher Text mehrfach vorkommt.

---

## 3. Spacing & Layout Patterns

### Regel 2.1: Standard Gaps (immer Tailwind Spacing verwenden)
```tsx
// Zwischen Elementen in einer Liste
gap-2       // 8px - tight spacing
gap-3       // 12px - standard
gap-4       // 16px - comfortable
gap-6       // 24px - spacious

// NICHT verwenden: gap-1, gap-5, gap-7, gap-8 (außer Ausnahmen)
```

### Regel 2.2: Standard Padding
```tsx
// Card Bodies
p-3         // 12px - default
p-4         // 16px - forms/inputs
p-6         // 24px - large sections

// Nicht verwenden: p-2, p-5, p-7 (außer Ausnahmen)
```

### Regel 2.3: Vertical Spacing (Stack-Elemente)
```tsx
// Vertikale Abstände zwischen Elements
space-y-2   // 8px
space-y-3   // 12px (most common)
space-y-4   // 16px

// Beispiel:
<div className="space-y-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Regel 2.4: Grid Layouts
```tsx
// 2-Spalten Layout für Forms
<div className="grid grid-cols-2 gap-4">
  <input />
  <input />
</div>

// Responsive: 1 auf Mobile, 2 auf Tablet+
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
```

---

## 3. Icon Patterns

### Regel 3.1: Konsistente Icon-Größen
```tsx
// Inline in Text (neben Labels)
h-3 w-3     // 12px

// Standard (Cards, Buttons)
h-4 w-4     // 16px DEFAULT - verwende diesen meisten

// Section Headers
h-5 w-5     // 20px - bei CardTitles und großen Headings

// Page Headers
h-6 w-6     // 24px - nur bei h1 Titeln

// Nicht verwenden: h-7, h-8, w-7, w-8 (außer Spezialfälle)
```

### Regel 3.2: Icon-Styling
```tsx
// Mit Farbe
<Mail className="h-4 w-4 text-primary" />

// Mit muted Farbe
<Mail className="h-4 w-4 text-muted-foreground" />

// In Buttons (erben Farbe vom Button)
<Button variant="outline">
  <Plus className="h-4 w-4 mr-2" />
  Hinzufügen
</Button>
```

### Regel 3.3: Icon + Text Spacing
```tsx
// Icon vor Text: mr-2
<Plus className="h-4 w-4 mr-2" />

// Icon nach Text: ml-2
<span>Text <Chevron className="h-4 w-4 ml-2" /></span>

// Icon allein in Button: padding aber kein margin
<Button variant="ghost" size="icon">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

## 4. Component Usage Patterns

### Regel 4.1: Verwende NUR shadcn/ui Komponenten
```tsx
✅ Verwende diese:
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

❌ Nicht verwende:
- Custom HTML <button> Tags
- 3rd-party UI Libraries
- Inline styled DIVs ohne shadcn base
```

### Regel 4.2: Button Variants (CVA Pattern)
```tsx
// Primary Action (fill)
<Button>Speichern</Button>

// Secondary Action (outline)
<Button variant="outline">Abbrechen</Button>

// Tertiary (ghost)
<Button variant="ghost">Mehr</Button>

// Destructive
<Button variant="destructive">Löschen</Button>

// Disabled State
<Button disabled>Nicht verfügbar</Button>
```

### Regel 4.3: Badge Usage
```tsx
// Standard (aus Daten)
<Badge>Active</Badge>

// Secondary (Meta-Info)
<Badge variant="secondary">Berlin</Badge>

// Outline (Status)
<Badge variant="outline">Interview</Badge>
```

### Regel 4.4: Dialog Content Sizing
```tsx
// Standard Dialog
<DialogContent className="max-w-lg">

// Detail Dialog (größer)
<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">

// Kleiner Dialog
<DialogContent className="max-w-sm">
```

### Regel 4.5: DialogHeader und Close Button
Der shadcn/ui `DialogContent` hat einen absolut positionierten Close-Button (X) oben rechts (`right-4 top-4`).
Der `DialogHeader` MUSS `pr-8` haben, damit der Titel nicht mit dem X überlappt.

```tsx
// ✅ RICHTIG - DialogHeader hat pr-8 eingebaut (in dialog.tsx)
<DialogHeader>
  <DialogTitle>Kandidat bearbeiten</DialogTitle>
</DialogHeader>

// ❌ FALSCH - Langer Titel überlappt mit X
<DialogHeader className="pr-0">  {/* Niemals pr überschreiben! */}
  <DialogTitle>Sehr langer Dialog Titel der überlappt</DialogTitle>
</DialogHeader>
```

**Check:** Bei jedem Dialog prüfen ob Titel-Text den X-Button überlappt (besonders bei langen Titeln).

---

## 5. Typography Patterns

### Regel 5.1: Heading Hierarchy
```tsx
// Page Title
<h1 className="text-2xl font-display font-bold">
  Kandidatenname
</h1>

// Section Title
<h4 className="font-semibold text-base">
  Notizen
</h4>

// Label
<label className="text-sm font-medium">
  Email
</label>

// Help Text
<p className="text-xs text-muted-foreground">
  Optional information
</p>
```

### Regel 5.2: Text Truncation
```tsx
// Für lange Texte in Zeilen:
<div className="truncate">Sehr langer Text...</div>

// Bei mehreren Linien (Mobile):
<div className="line-clamp-2">
  Text wird nach 2 Zeilen gekürzt
</div>

// In Flex/Grid mit Bild:
<div className="flex items-center gap-2 min-w-0">
  <img src="..." className="h-10 w-10 flex-shrink-0" />
  <div className="min-w-0">
    <p className="font-medium truncate">Name</p>
    <p className="text-sm text-muted-foreground truncate">Email</p>
  </div>
</div>
```

---

## 6. Color & Theme Patterns

### Regel 6.0: Dark Mode Kompatibilität (KRITISCH!)

**Jede Farb-Klasse MUSS in beiden Themes funktionieren!**

```tsx
❌ GEFÄHRLICH - Nur Light Mode:
text-gray-800      → Unsichtbar auf dunklem Background
text-gray-900      → Noch schlimmer
text-slate-800     → Gleiches Problem
bg-white           → Weißer Kasten im Dark Mode
bg-gray-100        → Heller Fleck im Dark Mode

✅ SICHER - Theme-aware:
text-foreground              → Passt sich automatisch an
text-muted-foreground        → Für sekundäre Texte
text-primary                 → Theme-aware Akzentfarbe
bg-background                → Passt sich an
bg-card                      → Für Cards
bg-muted                     → Für Sections
```

### Regel 6.0.1: Wenn gray/slate nötig → IMMER dark: Variante

```tsx
// ❌ FALSCH - Kein dark: Fallback
<p className="text-gray-700">Text</p>

// ✅ RICHTIG - Mit dark: Variante
<p className="text-gray-700 dark:text-gray-300">Text</p>

// ✅ BESSER - Theme Token nutzen
<p className="text-foreground">Text</p>
```

### Regel 6.0.2: Border Colors

```tsx
// ❌ FALSCH
border-gray-200              → Kaum sichtbar im Dark Mode

// ✅ RICHTIG
border-border                → Theme-aware
border-gray-200 dark:border-gray-700   → Mit Fallback
```

### Regel 6.0.3: Agent-Pflicht bei Review

Der UI Review Agent MUSS bei jedem Review:
1. Nach `text-gray-*`, `text-slate-*` ohne `dark:` suchen
2. Nach `bg-white`, `bg-gray-*` ohne `dark:` suchen
3. Screenshots in BEIDEN Themes machen und vergleichen

### Regel 6.1: Theme Token Utilization (NIEMALS Hardcoded Colors)
```tsx
✅ RICHTIG:
<div className="bg-primary text-primary-foreground" />
<div className="bg-muted text-muted-foreground" />
<div className="bg-destructive text-destructive-foreground" />
<div className="border border-primary/20" />

❌ FALSCH:
<div className="bg-blue-500" />
<div className="bg-[#3870DD]" />
<div style={{ backgroundColor: 'rgb(56, 112, 221)' }} />
```

### Regel 6.2: Color Combinations
```tsx
// Primary Actions
className="bg-primary text-primary-foreground"

// Secondary (outlined)
className="border border-primary text-primary"

// Muted/Disabled
className="bg-muted text-muted-foreground"

// Destructive (Löschen)
className="bg-destructive text-destructive-foreground"

// Success (grün)
className="bg-success text-success-foreground"

// Info/Primary Background
className="bg-primary/10 text-primary"
```

### Regel 6.3: Transparency für Layering
```tsx
// Backgrounds hinter Content
<div className="bg-primary/5">  {/* Very light */}
<div className="bg-primary/10"> {/* Light */}
<div className="bg-primary/20"> {/* Medium */}

// Borders mit Transparenz
<div className="border border-primary/20">
<div className="border border-muted-foreground/50">
```

---

## 7. Common Mistakes & How to Avoid

### ❌ Mistake 1: Redundante Header
```tsx
// FALSCH:
<Card>
  <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
  <CardContent>
    <SkillsManager /> {/* hat intern auch "Skills" Header */}
  </CardContent>
</Card>

// RICHTIG:
<Card>
  <CardHeader><CardTitle>Skills ({skills.length})</CardTitle></CardHeader>
  <CardContent>
    <SkillsManager showHeader={false} />
  </CardContent>
</Card>
```

### ❌ Mistake 2: Inconsistent Icon Sizes
```tsx
// FALSCH:
<Briefcase className="h-6 w-6" /> {/* sollte h-5 w-5 sein */}
<Mail className="h-3 w-3" /> {/* sollte h-4 w-4 sein */}

// RICHTIG:
<Briefcase className="h-5 w-5" /> {/* in Section Headers */}
<Mail className="h-4 w-4" /> {/* default */}
```

### ❌ Mistake 3: Mixed Spacing Tokens
```tsx
// FALSCH:
<div className="space-y-2 gap-5">
<div className="p-2 pl-8">

// RICHTIG:
<div className="space-y-2">
<div className="p-3">
```

### ❌ Mistake 4: Hardcoded Colors
```tsx
// FALSCH:
<div className="bg-blue-500 text-white">

// RICHTIG:
<div className="bg-primary text-primary-foreground">
```

### ❌ Mistake 5: Missing State Props
```tsx
// FALSCH:
<NotesSection notes={data.notes} />

// RICHTIG:
<NotesSection
  notes={data.notes}
  onSave={handleSave}
  canEdit={true}
  isSaving={isPending}
  showHeader={false}
/>
```

### ❌ Mistake 6: Doppelte Buttons in Dialogen
```tsx
// FALSCH - DialogContent hat bereits eingebauten Close Button!
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Preview</DialogTitle>
      <Button onClick={close}>  {/* ← DOPPELT! */}
        <X className="h-4 w-4" />
      </Button>
    </DialogHeader>
  </DialogContent>
</Dialog>

// RICHTIG - Nutze den eingebauten Close Button von DialogContent
<Dialog>
  <DialogContent>  {/* ← Hat bereits Close Button */}
    <DialogHeader>
      <DialogTitle>Preview</DialogTitle>
      {/* Nur zusätzliche Buttons wie Download */}
      <Button variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
    </DialogHeader>
  </DialogContent>
</Dialog>
```

**Regel:** shadcn/ui `DialogContent` hat IMMER einen eingebauten Close-Button (X oben rechts).
Niemals manuell einen zweiten hinzufügen!

### ❌ Mistake 7: Button-Zählung ignorieren
Bei Containern wie Dialogen, Modals, Cards - immer prüfen:
- Wie viele Close/X Buttons gibt es? (Soll: 1)
- Wie viele Submit Buttons gibt es? (Soll: 1)
- Gibt es doppelte Actions? (Soll: Nein)

```tsx
// UI REVIEW CHECK:
// Container → Zähle Buttons mit gleicher Funktion → Max 1 pro Funktion
```

### ❌ Mistake 8: CardContent p-0 ohne internes Padding (KRITISCH)

**Problem:** Wenn `CardContent className="p-0"` verwendet wird, MUSS die innere Komponente eigenes Padding haben. Sonst sitzt der Content direkt am Kartenrand.

```tsx
/* ❌ FALSCH - p-0 ohne internes Padding */
<Card>
  <CardContent className="p-0">
    <MyComponent />  {/* Hat kein padding → Text am Rand */}
  </CardContent>
</Card>

/* ✅ RICHTIG - Option A: Innere Komponente hat Padding */
<Card>
  <CardContent className="p-0">
    <MyComponent />  {/* Intern: <div className="p-6">...</div> */}
  </CardContent>
</Card>

/* ✅ RICHTIG - Option B: Standard CardContent Padding nutzen */
<Card>
  <CardContent>  {/* Default padding */}
    <MyComponent />
  </CardContent>
</Card>
```

**Wann p-0 sinnvoll ist:**
- Komponente hat eigenes komplexes Layout (Tabs, Listen mit voller Breite)
- Komponente braucht edge-to-edge Design
- ABER: Dann MUSS die Komponente intern `p-4` oder `p-6` haben!

**Check:** Bei jedem `CardContent className="p-0"` → Prüfe ob innere Komponente Padding hat.

### ❌ Mistake 9: Tailwind 4 @theme für Dark Mode (KRITISCH)

**Problem:** `@theme` Direktive in Tailwind 4 erstellt STATISCHE CSS-Variablen, die `:root` und `.dark` überschreiben → Text wird unsichtbar!

```css
/* ❌ FALSCH - @theme ist statisch, reagiert NICHT auf class="dark" */
@theme {
  --color-foreground: hsl(222 47% 11%);
  --color-background: hsl(210 20% 98%);
}

/* ✅ RICHTIG - Dynamische Variablen für Theme Switching */
@import "tailwindcss";
@config "../tailwind.config.ts";

:root {
  --foreground: 222 47% 11%;
  --background: 210 20% 98%;
}

.dark {
  --foreground: 210 40% 98%;
  --background: 222 47% 11%;
}
```

**Symptom:** Text erscheint nur on hover, Schrift fehlt in Dialogen/Pipelines
**Ursache:** `@theme` Variablen werden zur Build-Zeit aufgelöst (statisch)
**Lösung:** Nur `:root` und `.dark` für dynamisches Theming verwenden

---

## 8. When to Break These Rules

Diese Regeln sind Guidelines, nicht absolute Gesetze. Break them wenn:

1. **Accessibility erfordert es:** z.B. größere Icons für Visibility
2. **User Research zeigt andere UX:** z.B. andere Spacing
3. **Technische Constraints:** z.B. third-party Integration
4. **Spezielle Komponenten:** z.B. Data Tables mit eigenem Design

**ABER:** Dokumentiere WARUM du die Regel breakest - im Code-Comment!

```tsx
// We use gap-5 here instead of gap-4 because the table cells
// need more visual separation for readability (user research)
<div className="space-y-5">
```

---

## 9. Checkliste für neue Komponenten

Vor dem Commit, checke:

- [ ] Hat die Komponente NUR einen Title (in Card)? (oder `showHeader={false}`)
- [ ] Nutzen Icons konsistente Größen (`h-4 w-4`)?
- [ ] Spacing nutzt standard Tokens (`gap-3`, `p-4`, `space-y-2`)?
- [ ] Alle Farben sind Theme-Tokens (kein Hardcoded Colors)?
- [ ] Buttons nutzen shadcn/ui Varianten (nicht custom)?
- [ ] Responsive Design berücksichtigt Mobile (`grid-cols-1 md:grid-cols-2`)?
- [ ] Labels und Placeholder sind aussagekräftig?
- [ ] Keine Typos oder Konsistenz-Fehler mit bestehenden Components?

---

## 10. Ressourcen

- **Tailwind Config:** `tailwind.config.ts` - Theme Token Definitionen
- **shadcn/ui:** `src/components/ui/` - Alle UI Komponenten
- **Beispiel Pages:** `src/pages/CandidateDetail.tsx` - Folgt allen Patterns
- **Zentraler Style:** `src/index.css` - Global CSS + Design Tokens

---

**Letzte Aktualisierung:** Dezember 2024
**Maintainer:** UI Review Agent
