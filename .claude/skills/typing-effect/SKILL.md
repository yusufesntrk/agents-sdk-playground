# Typing Effect Skill

Erstelle einen Typewriter/Typing-Effekt für rotierende Texte in Hero-Sektionen.

## Trigger

- "Typing Effekt", "Typewriter", "Text Animation"
- "Wörter rotieren", "Text wechselt"
- "wie bei Finanzerfahrungen"

## Komponente erstellen

### 1. Tailwind Animation hinzufügen

In `tailwind.config.ts` unter `keyframes` und `animation`:

```ts
keyframes: {
  // ... andere keyframes
  "blink": {
    "0%, 50%": { opacity: "1" },
    "51%, 100%": { opacity: "0" },
  },
},
animation: {
  // ... andere animations
  "blink": "blink 1s step-end infinite",
},
```

### 2. Komponente erstellen

Datei: `src/components/ui/typing-effect.tsx`

```tsx
import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
  /** Text(e) die getippt werden sollen */
  texts: string[];
  /** Geschwindigkeit des Tippens in ms (default: 100) */
  typingSpeed?: number;
  /** Geschwindigkeit des Löschens in ms (default: 50) */
  deletingSpeed?: number;
  /** Pause nach vollständigem Text in ms (default: 2000) */
  pauseDuration?: number;
  /** Pause vor dem Löschen in ms (default: 1000) */
  pauseBeforeDelete?: number;
  /** Nur einmal tippen, nicht loopen (default: false) */
  once?: boolean;
  /** Cursor anzeigen (default: true) */
  showCursor?: boolean;
  /** Cursor-Zeichen (default: |) */
  cursor?: string;
  /** Zusätzliche CSS-Klassen */
  className?: string;
  /** CSS-Klassen für den Cursor */
  cursorClassName?: string;
}

export function TypingEffect({
  texts,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  pauseBeforeDelete = 1000,
  once = false,
  showCursor = true,
  cursor = '|',
  className,
  cursorClassName,
}: TypingEffectProps) {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const currentText = texts[textIndex];

  const handleTyping = useCallback(() => {
    if (isComplete) return;

    if (!isDeleting) {
      // Tippen
      if (displayText.length < currentText.length) {
        setDisplayText(currentText.slice(0, displayText.length + 1));
      } else {
        // Text vollständig getippt
        if (once && textIndex === texts.length - 1) {
          setIsComplete(true);
          return;
        }
        // Pause, dann löschen
        setTimeout(() => {
          setIsDeleting(true);
        }, pauseBeforeDelete);
      }
    } else {
      // Löschen
      if (displayText.length > 0) {
        setDisplayText(displayText.slice(0, -1));
      } else {
        // Zum nächsten Text
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % texts.length);
      }
    }
  }, [displayText, isDeleting, currentText, textIndex, texts.length, once, pauseBeforeDelete, isComplete]);

  useEffect(() => {
    const speed = isDeleting ? deletingSpeed : typingSpeed;
    const delay = displayText.length === currentText.length && !isDeleting ? pauseDuration : speed;

    const timer = setTimeout(handleTyping, delay);
    return () => clearTimeout(timer);
  }, [handleTyping, isDeleting, typingSpeed, deletingSpeed, pauseDuration, displayText.length, currentText.length]);

  return (
    <span className={cn('inline', className)}>
      {displayText}
      {showCursor && (
        <span
          className={cn(
            'inline-block ml-0.5 animate-blink',
            cursorClassName
          )}
        >
          {cursor}
        </span>
      )}
    </span>
  );
}

// Einfache Variante: Nur einmal tippen
interface SimpleTypingProps {
  text: string;
  speed?: number;
  showCursor?: boolean;
  cursor?: string;
  className?: string;
  cursorClassName?: string;
  onComplete?: () => void;
}

export function SimpleTyping({
  text,
  speed = 100,
  showCursor = true,
  cursor = '|',
  className,
  cursorClassName,
  onComplete,
}: SimpleTypingProps) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (displayText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    } else if (!isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [displayText, text, speed, isComplete, onComplete]);

  return (
    <span className={cn('inline', className)}>
      {displayText}
      {showCursor && !isComplete && (
        <span
          className={cn(
            'inline-block ml-0.5 animate-blink',
            cursorClassName
          )}
        >
          {cursor}
        </span>
      )}
    </span>
  );
}
```

## Verwendung

### Rotierende Texte (Loop)

```tsx
import { TypingEffect } from '@/components/ui/typing-effect';

<h1>
  Sales-Systeme für{' '}
  <TypingEffect
    texts={[
      'Recruiting-Agenturen',
      'Personalvermittler',
      'Headhunter',
      'Personalberatungen',
    ]}
    typingSpeed={80}
    deletingSpeed={40}
    pauseDuration={2500}
    pauseBeforeDelete={1500}
    className="text-primary"
  />
</h1>
```

### Einmaliges Tippen

```tsx
import { SimpleTyping } from '@/components/ui/typing-effect';

<h1>
  <SimpleTyping
    text="Willkommen bei LeyalTech"
    speed={100}
    onComplete={() => console.log('Fertig!')}
  />
</h1>
```

## Props

| Prop | Default | Beschreibung |
|------|---------|--------------|
| `texts` | - | Array von Texten zum Rotieren |
| `typingSpeed` | 100ms | Tipp-Geschwindigkeit |
| `deletingSpeed` | 50ms | Lösch-Geschwindigkeit |
| `pauseDuration` | 2000ms | Pause nach vollem Text |
| `pauseBeforeDelete` | 1000ms | Pause vor dem Löschen |
| `once` | false | Nur einmal tippen |
| `showCursor` | true | Blinkenden Cursor anzeigen |
| `cursor` | `|` | Cursor-Zeichen |
| `className` | - | CSS für den Text |
| `cursorClassName` | - | CSS für den Cursor |

## Beispiel-Effekt

```
Sales-Systeme für Recruiting-Agenturen|
Sales-Systeme für Recruiting-Agenture|
Sales-Systeme für Recruiting-Agent|
Sales-Systeme für Recruiting-|
Sales-Systeme für |
Sales-Systeme für P|
Sales-Systeme für Pe|
Sales-Systeme für Personalvermittler|
... (loop)
```
