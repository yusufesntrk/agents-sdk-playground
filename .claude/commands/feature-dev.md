# Feature Engineering: $ARGUMENTS

Du hilfst bei der Planung und Spezifikation eines Features. **KEINE Implementierung** - nur Analyse, Fragen, Dokumentation.

## Kernprinzipien

- **Fragen stellen**: Alle Unklarheiten identifizieren und klären
- **Verstehen vor Handeln**: Codebase und bestehende Patterns analysieren
- **Dokumentieren**: Alles in PRD.md und FEATURES.md festhalten
- **KEIN Code schreiben**: Implementierung erfolgt später via `/orchestrate`

---

## Phase 1: Discovery

**Ziel**: Verstehen was gebaut werden soll

**Request**: $ARGUMENTS

**Aktionen**:
1. TodoWrite mit allen Phasen erstellen
2. Falls unklar, User fragen:
   - Welches Problem wird gelöst?
   - Was soll das Feature tun?
   - Constraints oder Requirements?
3. Verständnis zusammenfassen und bestätigen lassen

---

## Phase 2: Kontext sammeln

**Ziel**: PRD.md und FEATURES.md prüfen

**Aktionen**:
1. **PRD.md prüfen**: Gibt es bereits Anforderungen für dieses Feature?
2. **FEATURES.md prüfen**: Was ist bereits implementiert? Was fehlt?
3. **Codebase erkunden**: Welche Patterns/Components existieren bereits?

**Output**:
- Kontext aus PRD.md
- Aktueller Stand aus FEATURES.md
- Relevante bestehende Patterns

---

## Phase 3: Klärungsfragen

**Ziel**: ALLE Unklarheiten beseitigen

**KRITISCH**: Diese Phase NICHT überspringen!

**Fragen-Kategorien**:

### Design & UI
- [ ] Welche UI-Komponente? (Card, Table, List, Modal, Widget?)
- [ ] Wo wird es eingebunden? (Welche Page, welcher Bereich?)
- [ ] Design-Referenzen? (Ähnliche Components im Projekt?)
- [ ] Spezielle Styling-Wünsche?

### Datenmodell
- [ ] Welche Felder/Properties?
- [ ] Beziehungen zu anderen Tabellen?
- [ ] Pflichtfelder vs. optional?
- [ ] Default-Werte?

### Funktionalität
- [ ] CRUD-Operationen? (Create, Read, Update, Delete)
- [ ] Filtering/Sorting?
- [ ] Pagination?
- [ ] Echtzeit-Updates?

### Permissions
- [ ] Wer darf was sehen? (Rollen-basiert?)
- [ ] Wer darf bearbeiten/löschen?
- [ ] Tenant-Isolation?

### Externe Abhängigkeiten
- [ ] API Keys benötigt?
- [ ] Externe Services? (E-Mail, Storage, etc.)
- [ ] Environment Variables?

**Aktionen**:
1. Relevante Fragen auswählen (nicht alle nötig)
2. **Alle Fragen auf einmal stellen**
3. **Auf Antworten warten** bevor weiter

---

## Phase 4: Architektur-Übersicht

**Ziel**: Technische Umsetzung skizzieren

**Aktionen**:
1. Betroffene Bereiche identifizieren:
   - Database: Neue Tabellen? Migrations?
   - Hooks: Neue React Query Hooks?
   - Components: Welche UI-Komponenten?
   - Pages: Neue Seiten oder Integration in bestehende?
   - Tests: Welche E2E Tests?

2. Abhängigkeiten zu anderen Features prüfen

3. Grobe Struktur vorschlagen:
   ```
   Feature: [Name]
   ├── Migration: [Tabellenname]
   ├── Hook: use[Feature]
   ├── Components:
   │   ├── [Feature]List
   │   ├── [Feature]Card
   │   └── [Feature]Form
   ├── Page: [Route]
   └── Tests: [feature].spec.ts
   ```

---

## Phase 5: Dokumentation in FEATURES.md

**Ziel**: Feature strukturiert in FEATURES.md eintragen

**PFLICHT**: Am Ende MUSS das Feature in FEATURES.md stehen!

**Aktionen**:

### 1. FEATURES.md öffnen und passende Phase finden
- Read FEATURES.md
- Identifiziere passende Phase (z.B. "Phase 3 – Erweiterte Features")
- Falls keine passende Phase existiert, neue erstellen

### 2. Feature-Eintrag erstellen (EXAKTES FORMAT!)

```markdown
### X.Y [Feature Name] ⏳
- [ ] [Haupt-Capability 1]
- [ ] [Haupt-Capability 2]
- [ ] [Haupt-Capability 3]

**Geplante Architektur:**
- **Database**: [Tabellenname(n)] mit Feldern: [feld1, feld2, ...]
- **Hooks**: use[Feature] - [Kurzbeschreibung]
- **Components**: [Component1], [Component2], ...
- **Page/Integration**: [Wo eingebunden wird]
- **Tests**: [feature].spec.ts

**Geklärte Anforderungen:**
- UI: [UI-Entscheidung]
- Permissions: [Wer darf was]
- Abhängigkeiten: [Falls vorhanden]
```

### 3. Edit-Tool nutzen um FEATURES.md zu aktualisieren
- Finde die richtige Stelle in der Datei
- Füge den Feature-Block ein
- Status-Symbol: ⏳ (Geplant)

### 4. PRD.md aktualisieren (falls nötig):
- Requirements dokumentieren
- Entscheidungen festhalten

### 5. Summary präsentieren:
```
## Feature: [Name] - Geplant ✅

### In FEATURES.md eingetragen:
Phase X.Y - [Feature Name]

### Geklärte Anforderungen:
- UI: ...
- Felder: ...
- Permissions: ...

### Betroffene Bereiche:
- Database: ...
- Hooks: ...
- Components: ...

### Nächster Schritt:
`/orchestrate [Feature Name]` um die Implementierung zu starten
```

---

## FEATURES.md Format-Referenz

**Status-Symbole:**
- ⏳ Geplant (nach /feature-dev)
- 🔄 In Arbeit (während /orchestrate)
- ✅ Implementiert (nach erfolgreichem /orchestrate)

**Beispiel-Eintrag nach /feature-dev:**

```markdown
### 3.5 E-Mail Templates ⏳
- [ ] Template CRUD (erstellen, bearbeiten, löschen)
- [ ] Variablen-Support ({{candidate_name}}, {{job_title}})
- [ ] Template-Vorschau
- [ ] Kategorien (Einladung, Absage, Angebot)

**Geplante Architektur:**
- **Database**: email_templates mit Feldern: id, name, subject, body, category, variables, tenant_id
- **Hooks**: useEmailTemplates - CRUD + Variablen-Parsing
- **Components**: EmailTemplateForm, EmailTemplateList, TemplatePreview
- **Page/Integration**: Settings Tab "E-Mail Templates"
- **Tests**: email-templates.spec.ts

**Geklärte Anforderungen:**
- UI: Settings Tab mit Liste + Modal für Bearbeitung
- Permissions: admin, recruiter dürfen erstellen/bearbeiten
- Abhängigkeiten: Keine externen APIs nötig (nur Template-Speicherung)
```

---

## Wichtige Regeln

1. **KEIN Code schreiben** - nur planen und dokumentieren
2. **Alle Fragen auf einmal stellen** - nicht einzeln nachfragen
3. **FEATURES.md MUSS aktualisiert werden** - Feature mit ⏳ eintragen (PFLICHT!)
4. **Strukturiertes Format verwenden** - siehe Format-Referenz oben
5. **Am Ende auf `/orchestrate` verweisen** für Implementierung

⚠️ **NIEMALS beenden ohne FEATURES.md zu aktualisieren!**

---

## Beispiel-Ablauf

```
User: /feature-dev E-Mail Templates

1. Discovery: "Du willst E-Mail Templates für automatische Benachrichtigungen?"

2. Kontext: PRD.md und FEATURES.md geprüft, bestehende Settings-Patterns gefunden

3. Fragen:
   - UI: Eigene Page oder in Settings integriert?
   - Felder: Name, Subject, Body - weitere?
   - Variablen: {{candidate_name}}, {{job_title}} unterstützen?
   - Permissions: Wer darf Templates erstellen?

4. Architektur:
   Feature: E-Mail Templates
   ├── Migration: email_templates
   ├── Hook: useEmailTemplates
   ├── Components: EmailTemplateForm, EmailTemplateList
   └── Page: /settings/email-templates

5. FEATURES.md aktualisieren (PFLICHT!):
   → Edit-Tool nutzen um folgenden Block einzufügen:

   ### 3.5 E-Mail Templates ⏳
   - [ ] Template CRUD
   - [ ] Variablen-Support
   - [ ] Template-Vorschau

   **Geplante Architektur:**
   - Database: email_templates
   - Hooks: useEmailTemplates
   - Components: EmailTemplateForm, EmailTemplateList
   - Page: Settings Tab

   **Geklärte Anforderungen:**
   - UI: Settings Tab
   - Permissions: admin, recruiter

6. Output: "Feature in FEATURES.md eingetragen!
   Nutze `/orchestrate E-Mail Templates` für Implementierung"
```
