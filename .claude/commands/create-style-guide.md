# Create Style Guide

Interaktiver Style Guide Generator mit intelligenter Erkennung bestehender Styles.

---

## Workflow

### Phase 1: Style-Erkennung

**ZUERST prüfen ob bereits Styles existieren:**

```bash
# Prüfe auf bestehenden Style Guide
Glob("**/STYLE-GUIDE.md")
Glob("**/style-guide.md")

# Prüfe auf konfigurierte Styles
Read("tailwind.config.ts") oder Read("tailwind.config.js")
Read("src/index.css") oder Read("src/globals.css")

# Prüfe auf bestehende UI-Komponenten
Glob("src/components/ui/*.tsx")
```

**Entscheidungsbaum:**

| Situation | Aktion |
|-----------|--------|
| `STYLE-GUIDE.md` existiert | Phase 2A: Erweitern |
| Tailwind Config mit Custom Theme | Phase 2A: Extrahieren & Erweitern |
| UI-Komponenten mit einheitlichem Style | Phase 2A: Analysieren & Dokumentieren |
| Nichts gefunden | Phase 2B: Neu erstellen |

---

### Phase 2A: Bestehender Style erkannt

**Informiere den User:**
> "Ich habe bestehende Styles gefunden: [was gefunden wurde]. Ich werde diese als Basis verwenden."

**Extrahiere automatisch:**
- Farbpalette aus CSS Variables / Tailwind Config
- Typografie (Fonts, Sizes, Weights)
- Border Radius Werte
- Shadow Definitionen
- Bestehende Animationen

**Dann stelle NUR ergänzende Fragen** (siehe Phase 3).

---

### Phase 2B: Kein Style vorhanden

**Informiere den User:**
> "Kein bestehender Style Guide gefunden. Lass uns einen erstellen!"

**Stelle ALLE Fragen** (Basis + Erweitert, siehe Phase 3).

---

## Phase 3: Fragen stellen

Nutze `AskUserQuestion` Tool mit max. 4 Fragen pro Block.

### Block 1: Basis-Fragen (nur wenn kein Style existiert)

**Frage 1: Projekt-Typ**
- Header: "Projekt-Typ"
- Frage: "Was für ein Projekt wird erstellt?"
- Optionen:
  - **SaaS / Web App** - Dashboard, Admin Panel, komplexe UI
  - **Corporate Website** - Unternehmensseite, professionell
  - **Landing Page** - Marketing, Conversion-fokussiert
  - **E-Commerce** - Shop, Produkte, Checkout

**Frage 2: Stil-Richtung**
- Header: "Stil"
- Frage: "Welchen visuellen Stil bevorzugst du?"
- Optionen:
  - **Modern & Minimalistisch** - Clean, viel Whitespace, reduziert
  - **Tech & Futuristisch** - Glassmorphism, Gradients, Neon-Akzente
  - **Bold & Expressiv** - Kräftige Farben, große Typografie
  - **Elegant & Premium** - Subtil, hochwertig, dezent

**Frage 3: Farbschema**
- Header: "Farben"
- Frage: "Welche Farbrichtung passt zum Projekt?"
- Optionen:
  - **Blau** - Vertrauen, Professionalität, Tech
  - **Grün** - Wachstum, Natur, Finanzen, Health
  - **Violett** - Kreativität, Premium, Innovation
  - **Orange/Rot** - Energie, Action, Dringlichkeit

**Frage 4: Dark Mode**
- Header: "Dark Mode"
- Frage: "Soll Dark Mode unterstützt werden?"
- Optionen:
  - **Ja, beide Modi** - Light + Dark mit Toggle
  - **Nur Light Mode** - Heller Standard
  - **Nur Dark Mode** - Dunkles Interface
  - **System-basiert** - Folgt OS-Einstellung

### Block 2: Animationen (IMMER fragen)

**Frage 1: Animations-Level**
- Header: "Animation"
- Frage: "Wie viel Animation soll die UI haben?"
- Optionen:
  - **Minimal** - Nur Hover/Focus Transitions (Performance-fokussiert)
  - **Subtil** - Sanfte Einblendungen, Micro-Interactions
  - **Expressiv** - Auffällige Animationen, Page Transitions, Scroll-Effects
  - **Immersiv** - Komplexe Animationen, Parallax, 3D-Effekte

**Frage 2: Spezielle Animations-Typen** (multiSelect: true)
- Header: "Animationsarten"
- Frage: "Welche speziellen Animationen sollen verwendet werden?"
- Optionen:
  - **Typing-Effekt** - Text wird Buchstabe für Buchstabe getippt
  - **Schwebende Elemente** - Icons/Shapes die sanft schweben
  - **Scroll-Animationen** - Elemente erscheinen beim Scrollen
  - **Hover-Transformationen** - 3D-Rotationen, Scale-Effekte bei Hover

**Frage 3: Motion Design**
- Header: "Motion"
- Frage: "Welchen Motion-Stil bevorzugst du?"
- Optionen:
  - **Bounce/Spring** - Elastische, spielerische Bewegungen
  - **Smooth/Ease** - Sanfte, professionelle Übergänge
  - **Sharp/Linear** - Schnelle, direkte Bewegungen
  - **Stagger** - Elemente animieren nacheinander ein

**Frage 4: Lottie/GIF Animationen**
- Header: "Lottie/GIF"
- Frage: "Sollen Lottie oder GIF Animationen verwendet werden?"
- Optionen:
  - **Ja, Lottie** - Vektorbasierte Animationen (performant, skalierbar)
  - **Ja, GIF** - Klassische animierte Bilder
  - **Beides** - Je nach Anwendungsfall
  - **Nein** - Nur CSS/JS Animationen

### Block 3: UI Details (IMMER fragen)

**Frage 1: Border Radius**
- Header: "Ecken"
- Frage: "Wie sollen die Ecken aussehen?"
- Optionen:
  - **Rund** - Weiche, freundliche Ecken (16px+)
  - **Moderat** - Leicht gerundet (8-12px)
  - **Scharf** - Minimale Rundung (4px)
  - **Eckig** - Keine Rundung (0px)

**Frage 2: Schatten-Stil**
- Header: "Schatten"
- Frage: "Wie sollen Schatten aussehen?"
- Optionen:
  - **Soft/Diffuse** - Weiche, ausgedehnte Schatten
  - **Hard/Layered** - Mehrere Schatten-Layer, Tiefe
  - **Colored** - Farbige Schatten passend zur Primary Color
  - **Minimal** - Kaum sichtbare, dezente Schatten

**Frage 3: Glassmorphism / Effekte**
- Header: "Effekte"
- Frage: "Sollen spezielle Effekte verwendet werden?"
- Optionen:
  - **Glassmorphism** - Blur + Transparenz (backdrop-blur)
  - **Gradients** - Farbverläufe für Backgrounds/Buttons
  - **Grain/Noise** - Subtile Textur für Retro/Analog Look
  - **Keine** - Solide Farben, klassisches Design

**Frage 4: Interaktions-Feedback**
- Header: "Feedback"
- Frage: "Wie soll Interaktions-Feedback aussehen?"
- Optionen:
  - **Dezent** - Subtile Farbänderungen bei Hover/Active
  - **Deutlich** - Klare visuelle Änderungen (Scale, Color)
  - **Playful** - Animierte Responses, Ripple-Effekte
  - **Minimal** - Nur Cursor-Änderung, kaum visuell

---

## Phase 4: Style Guide generieren

Basierend auf den Antworten, erstelle:

### 1. STYLE-GUIDE.md

```markdown
# [Projektname] Style Guide

## Farben
[Generierte Farbpalette als CSS Variables]

## Typografie
[Fonts, Größen, Weights]

## Spacing & Layout
[Spacing Scale, Container Widths]

## Border Radius
[Radius Tokens]

## Shadows
[Shadow Definitionen]

## Animationen
[Transition Tokens, Keyframes, Spezielle Effekte]

## Komponenten-Patterns
[Button, Card, Input Styles]
```

### 2. Optional: Config-Dateien aktualisieren

Frage am Ende:
- "Soll ich `tailwind.config.ts` mit den neuen Tokens erweitern?"
- "Soll ich `src/index.css` mit den CSS Variables aktualisieren?"

---

## Spezielle Animations-Definitionen

### Typing-Effekt
```css
@keyframes typing {
  from { width: 0 }
  to { width: 100% }
}
@keyframes blink-caret {
  50% { border-color: transparent }
}
.typing-effect {
  overflow: hidden;
  border-right: 2px solid;
  white-space: nowrap;
  animation: typing 3.5s steps(40) 1s forwards,
             blink-caret 0.75s step-end infinite;
}
```

### Schwebende Elemente
```css
@keyframes float {
  0%, 100% { transform: translateY(0) }
  50% { transform: translateY(-10px) }
}
.floating {
  animation: float 3s ease-in-out infinite;
}
```

### Scroll-Reveal
```css
@keyframes reveal {
  from { opacity: 0; transform: translateY(20px) }
  to { opacity: 1; transform: translateY(0) }
}
.scroll-reveal {
  animation: reveal 0.6s ease-out forwards;
}
```

### Bounce/Spring Motion
```css
/* Cubic-bezier für Spring-Effekt */
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
```

### Stagger Animation (für Listen)
```css
.stagger-item {
  opacity: 0;
  animation: reveal 0.5s ease-out forwards;
}
.stagger-item:nth-child(1) { animation-delay: 0.1s; }
.stagger-item:nth-child(2) { animation-delay: 0.2s; }
.stagger-item:nth-child(3) { animation-delay: 0.3s; }
/* ... */
```

---

## Lottie Integration

Falls Lottie gewählt:
```bash
npm install lottie-react
```

```tsx
import Lottie from 'lottie-react';
import animationData from './animation.json';

<Lottie animationData={animationData} loop autoplay />
```

**Lottie Quellen:**
- LottieFiles: https://lottiefiles.com/
- IconScout: https://iconscout.com/lottie-animations

---

## Beispiel-Kombinationen

### Tech Startup Landing
- Stil: Tech & Futuristisch
- Animationen: Expressiv
- Spezial: Typing-Effekt, Schwebende Icons, Glassmorphism
- Motion: Bounce/Spring
- Lottie: Ja

### Enterprise SaaS
- Stil: Modern & Minimalistisch
- Animationen: Subtil
- Spezial: Scroll-Animationen
- Motion: Smooth/Ease
- Schatten: Soft/Diffuse

### Creative Agency
- Stil: Bold & Expressiv
- Animationen: Immersiv
- Spezial: Alle
- Motion: Stagger
- Effekte: Gradients, Grain
