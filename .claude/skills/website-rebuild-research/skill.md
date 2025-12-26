---
name: website-rebuild-research
description: "Extrahiert Original-Style (Farben, Schriften) von einer bestehenden Website für Rebuilds. NUR für Nachbauen/Kopieren verwenden. Für NEUE Designs → /create-style-guide oder frontend-design Skill."
triggers:
  - "website nachbauen"
  - "website rebuild"
  - "website kopieren"
  - "mach die website nach"
  - "baue website nach"
autoApply: false
---

# Website Rebuild Research

**Zweck:** Original-Style einer bestehenden Website analysieren und übernehmen.

---

## ⚠️ Wann welchen Style-Approach?

| Situation | Was verwenden |
|-----------|---------------|
| **Website nachbauen** (Original-Style übernehmen) | ✅ Dieser Skill |
| **Neue Website** (eigenen Style erstellen) | → `/create-style-guide` Command |
| **Kreatives Redesign** (komplett neuer Look) | → `frontend-design` Skill |
| **Projekt dokumentieren** (bestehenden Code analysieren) | → `project-style-guide` Skill |

---

Bevor du eine Website neu baust, analysiere die bestehende:

## Schritt 1: Geschäftsmodell verstehen

```
WebFetch: https://[domain]
Prompt: "Was macht das Unternehmen? Welche Produkte/Dienstleistungen? Welche Sektionen?"
```

```
WebSearch: "[Firmenname] [Branche] Leistungen"
```

Dokumentiere:
- **Branche**: (z.B. Headhunter, Rechtsanwalt, Restaurant)
- **Leistungen**: (konkrete Services)
- **Team**: (Namen, Rollen)
- **USPs**: (Alleinstellungsmerkmale)
- **Fakten**: (Gründungsjahr, Statistiken)

## Schritt 2: Theme analysieren

```
WebFetch: https://[domain]
Prompt: "Analysiere das EXAKTE Farbschema mit Hex-Codes. Welche Farbe wird WO verwendet (Buttons, Text, Logo, Icons, Hintergrund)? Welche Schriftart?"
```

Dokumentiere:
- **Schriftart**: (z.B. Ubuntu, Inter, Roboto)
- **Stil**: (hell/dunkel, minimalistisch, corporate)

### Farben mit Verwendungszweck:

| Farbe | Hex-Code | Verwendung |
|-------|----------|------------|
| Dunkelblau | #091358 | Logo, Text, Icons |
| Rot | #ED1C24 | CTAs, Buttons |
| Hellblau | #1479E0 | Akzente, Links |

**WICHTIG:** Nicht einfach Farben sammeln, sondern verstehen WO sie eingesetzt werden:
- Welche Farbe haben die **Buttons/CTAs**?
- Welche Farbe hat das **Logo**?
- Welche Farbe haben **Text-Akzente**?
- Welche Farbe haben **Icons**?

## Schritt 3: Theme-Mapping erstellen

Bevor du baust, mappe die Farben:

```
--primary: [Farbe für Text, Icons, Logo]
--secondary: [Zweitfarbe]
--accent: [Farbe für CTAs, Buttons]
```

Die Button-Komponente muss ggf. angepasst werden, wenn CTAs eine andere Farbe als Primary haben.

## Schritt 4: Erst dann bauen

- Inhalte basieren auf recherchierten Fakten
- Theme übernimmt die EXAKTEN Farben UND deren Verwendung
- KEINE generischen Platzhalter
- KEINE Annahmen

## Checkliste

- [ ] WebFetch für Geschäftsmodell?
- [ ] WebSearch für mehr Kontext?
- [ ] Geschäftsmodell verstanden und dokumentiert?
- [ ] WebFetch für Theme-Analyse?
- [ ] Farben (Hex-Codes) notiert?
- [ ] Verwendungszweck jeder Farbe notiert? (Buttons, Text, Logo, Icons)
- [ ] Schriftart notiert?
- [ ] Theme-Mapping erstellt?
- [ ] Erst DANN mit Code angefangen?
