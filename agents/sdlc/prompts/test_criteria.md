# Test-Kriterien für E2E Tests

## KRITISCH: Diese Tests sind PFLICHT!

Jeder Test MUSS diese Kriterien prüfen. Keine Ausnahmen!

---

## 1. KLICK-VERHALTEN (User Interactions)

### Buttons
```typescript
// PFLICHT für JEDEN Button:
test('Button [name] ist klickbar und führt Aktion aus', async ({ page }) => {
  const button = page.getByRole('button', { name: 'Button Text' });

  // 1. Button ist sichtbar
  await expect(button).toBeVisible();

  // 2. Button ist NICHT disabled
  await expect(button).toBeEnabled();

  // 3. Klick funktioniert
  await button.click();

  // 4. Erwartete Aktion passiert (Navigation, Modal, State-Change)
  await expect(page.locator('[data-testid="result"]')).toBeVisible();
  // ODER
  await expect(page).toHaveURL('/expected-path');
});
```

### Links
```typescript
test('Link [name] navigiert korrekt', async ({ page }) => {
  const link = page.getByRole('link', { name: 'Link Text' });

  await expect(link).toBeVisible();
  await link.click();

  // Navigation prüfen
  await expect(page).toHaveURL(/expected-pattern/);
});
```

### Formulare
```typescript
test('Formular kann ausgefüllt und submitted werden', async ({ page }) => {
  // Input ausfüllen
  await page.fill('[name="email"]', 'test@example.com');

  // Submit klicken
  await page.click('button[type="submit"]');

  // Erfolg prüfen
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## 2. TEXT-SICHTBARKEIT (Abgeschnittene Texte)

### PFLICHT: Truncation-Check für JEDEN Text
```typescript
test('Text ist vollständig sichtbar und nicht abgeschnitten', async ({ page }) => {
  const textElement = page.locator('.card-title');

  // 1. Element ist sichtbar
  await expect(textElement).toBeVisible();

  // 2. Text ist nicht mit "..." abgeschnitten (außer gewollt)
  const text = await textElement.textContent();
  expect(text).not.toMatch(/\.\.\.$/);

  // 3. Overflow-Check: Text passt in Container
  const box = await textElement.boundingBox();
  const scrollWidth = await textElement.evaluate(el => el.scrollWidth);
  const clientWidth = await textElement.evaluate(el => el.clientWidth);

  // scrollWidth > clientWidth = Text ist abgeschnitten!
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
});
```

### Lange Texte in Cards
```typescript
test('Lange Texte in Cards werden korrekt behandelt', async ({ page }) => {
  // Teste mit langen Inhalten
  const cardTitle = page.locator('.card-title').first();

  // Check: Text hat entweder:
  // - truncate class UND title-Attribut für Tooltip
  // - ODER ist vollständig sichtbar
  const hasTruncate = await cardTitle.evaluate(
    el => el.classList.contains('truncate') || el.classList.contains('line-clamp-2')
  );

  if (hasTruncate) {
    // Wenn truncate, dann MUSS title-Attribut existieren
    await expect(cardTitle).toHaveAttribute('title');
  }
});
```

---

## 3. RESPONSIVE VERHALTEN

### Mobile Viewport
```typescript
test('Komponente funktioniert auf Mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  // Elemente sind sichtbar
  await expect(page.locator('.main-content')).toBeVisible();

  // Navigation ist erreichbar (Hamburger Menu?)
  const mobileNav = page.locator('[data-testid="mobile-menu"]');
  if (await mobileNav.isVisible()) {
    await mobileNav.click();
    await expect(page.locator('.nav-links')).toBeVisible();
  }
});
```

### Desktop Viewport
```typescript
test('Komponente funktioniert auf Desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });

  // Layout ist korrekt
  await expect(page.locator('.sidebar')).toBeVisible();
  await expect(page.locator('.main-content')).toBeVisible();
});
```

---

## 4. LOADING & ERROR STATES

### Loading State
```typescript
test('Loading State wird angezeigt', async ({ page }) => {
  // Langsame Antwort simulieren
  await page.route('**/api/**', route =>
    route.fulfill({ status: 200, body: '[]', delay: 2000 })
  );

  await page.goto('/');

  // Loading Indicator muss sichtbar sein
  await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  // ODER
  await expect(page.locator('.spinner')).toBeVisible();
  // ODER
  await expect(page.locator('[aria-busy="true"]')).toBeVisible();
});
```

### Error State
```typescript
test('Error State wird angezeigt bei Fehler', async ({ page }) => {
  // Fehler simulieren
  await page.route('**/api/**', route =>
    route.fulfill({ status: 500 })
  );

  await page.goto('/');

  // Error Message muss sichtbar sein
  await expect(page.locator('[data-testid="error"]')).toBeVisible();
  // ODER
  await expect(page.locator('.error-message')).toBeVisible();
});
```

### Empty State
```typescript
test('Empty State wird angezeigt wenn keine Daten', async ({ page }) => {
  await page.route('**/api/**', route =>
    route.fulfill({ status: 200, body: '[]' })
  );

  await page.goto('/');

  // Empty State anzeigen
  await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  // NICHT nur leerer Container!
});
```

---

## 5. NAVIGATION & ROUTING

### Zurück-Button
```typescript
test('Zurück-Button navigiert zur vorherigen Seite', async ({ page }) => {
  // Erst zu einer Detail-Seite
  await page.goto('/items/123');

  // Zurück-Button finden und klicken
  const backButton = page.locator('[data-testid="back-button"]');
  // ODER
  const backButton = page.getByRole('button', { name: /zurück|back/i });

  await expect(backButton).toBeVisible();
  await backButton.click();

  // Navigation prüfen
  await expect(page).toHaveURL('/items');
});
```

### Breadcrumbs
```typescript
test('Breadcrumbs sind klickbar', async ({ page }) => {
  await page.goto('/category/item/detail');

  const breadcrumb = page.locator('.breadcrumb a').first();
  await breadcrumb.click();

  await expect(page).not.toHaveURL('/category/item/detail');
});
```

---

## 6. MODAL & DIALOG VERHALTEN

```typescript
test('Modal öffnet und schließt korrekt', async ({ page }) => {
  // Modal öffnen
  await page.click('[data-testid="open-modal"]');
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Modal schließen mit X
  await page.click('[data-testid="close-modal"]');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();

  // Modal schließen mit ESC
  await page.click('[data-testid="open-modal"]');
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();

  // Modal schließen mit Klick außerhalb
  await page.click('[data-testid="open-modal"]');
  await page.click('.modal-backdrop');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

---

## 7. FORM VALIDATION

```typescript
test('Formular zeigt Validation Errors', async ({ page }) => {
  // Leeres Formular submitten
  await page.click('button[type="submit"]');

  // Error Messages müssen erscheinen
  await expect(page.locator('.field-error')).toBeVisible();
  // ODER
  await expect(page.locator('[aria-invalid="true"]')).toBeVisible();

  // Spezifische Feldname-Prüfung
  await expect(page.locator('[data-error="email"]')).toContainText(/required|pflicht/i);
});

test('Formular akzeptiert valide Eingaben', async ({ page }) => {
  await page.fill('[name="email"]', 'valid@email.com');
  await page.fill('[name="password"]', 'SecurePassword123!');

  await page.click('button[type="submit"]');

  // Keine Errors
  await expect(page.locator('.field-error')).not.toBeVisible();

  // Erfolg
  await expect(page.locator('.success-message')).toBeVisible();
});
```

---

## 8. VISUAL REGRESSIONS

### Screenshot-Vergleich
```typescript
test('Komponente sieht korrekt aus', async ({ page }) => {
  await page.goto('/component-page');

  // Warte auf vollständiges Laden
  await page.waitForLoadState('networkidle');

  // Screenshot-Vergleich
  await expect(page).toHaveScreenshot('component.png', {
    maxDiffPixels: 100  // Toleranz für kleine Änderungen
  });
});
```

---

## 9. ACCESSIBILITY BASICS

```typescript
test('Keyboard Navigation funktioniert', async ({ page }) => {
  await page.goto('/');

  // Tab durch interaktive Elemente
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => document.activeElement?.tagName);
  expect(focused).not.toBe('BODY');

  // Enter auf fokussiertem Button
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');

  // Aktion wurde ausgeführt
  await expect(page.locator('.action-result')).toBeVisible();
});

test('ARIA Labels sind vorhanden', async ({ page }) => {
  // Buttons haben accessible names
  const buttons = page.getByRole('button');
  const count = await buttons.count();

  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i);
    const name = await button.getAttribute('aria-label') ||
                 await button.textContent();
    expect(name?.trim()).not.toBe('');
  }
});
```

---

## 10. CONSOLE ERRORS CHECK

```typescript
test('Keine Console Errors', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Interaktionen durchführen
  await page.click('button').catch(() => {});

  // Keine Errors
  expect(errors).toHaveLength(0);
});
```

---

## CHECKLISTE FÜR JEDEN TEST

Bevor ein Test als "fertig" gilt:

- [ ] **Klicks funktionieren** - Jeder Button/Link wurde geklickt und Aktion verifiziert
- [ ] **Texte sind sichtbar** - Keine abgeschnittenen Texte ohne Tooltip
- [ ] **Navigation funktioniert** - Zurück-Buttons, Links, Breadcrumbs
- [ ] **Loading State existiert** - Bei API-Calls wird Loader angezeigt
- [ ] **Error State existiert** - Bei Fehlern wird Error angezeigt
- [ ] **Empty State existiert** - Bei leeren Daten wird Info angezeigt
- [ ] **Mobile funktioniert** - Viewport 375px getestet
- [ ] **Keyboard funktioniert** - Tab + Enter navigierbar
- [ ] **Keine Console Errors** - Keine JavaScript Fehler

---

## BEISPIEL: Vollständiger Feature-Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Task List Feature', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
  });

  // 1. KLICK-VERHALTEN
  test('Add Task Button öffnet Modal', async ({ page }) => {
    const addButton = page.getByRole('button', { name: /add|hinzufügen/i });
    await expect(addButton).toBeVisible();
    await expect(addButton).toBeEnabled();

    await addButton.click();

    await expect(page.locator('[role="dialog"]')).toBeVisible();
  });

  test('Task Card ist klickbar und öffnet Details', async ({ page }) => {
    const taskCard = page.locator('.task-card').first();
    await taskCard.click();

    await expect(page).toHaveURL(/\/tasks\/\d+/);
  });

  // 2. TEXT-SICHTBARKEIT
  test('Task Titel sind nicht abgeschnitten', async ({ page }) => {
    const titles = page.locator('.task-title');
    const count = await titles.count();

    for (let i = 0; i < count; i++) {
      const title = titles.nth(i);
      const scrollWidth = await title.evaluate(el => el.scrollWidth);
      const clientWidth = await title.evaluate(el => el.clientWidth);

      if (scrollWidth > clientWidth) {
        // Wenn abgeschnitten, muss title-Attribut existieren
        await expect(title).toHaveAttribute('title');
      }
    }
  });

  // 3. LOADING STATE
  test('Zeigt Loading während Daten laden', async ({ page }) => {
    await page.route('**/api/tasks', route =>
      route.fulfill({ body: '[]', delay: 1000 })
    );

    await page.reload();
    await expect(page.locator('[data-testid="loading"]')).toBeVisible();
  });

  // 4. EMPTY STATE
  test('Zeigt Empty State wenn keine Tasks', async ({ page }) => {
    await page.route('**/api/tasks', route =>
      route.fulfill({ body: '[]' })
    );

    await page.reload();
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible();
  });

  // 5. ERROR STATE
  test('Zeigt Error bei API Fehler', async ({ page }) => {
    await page.route('**/api/tasks', route =>
      route.fulfill({ status: 500 })
    );

    await page.reload();
    await expect(page.locator('[data-testid="error"]')).toBeVisible();
  });

  // 6. NAVIGATION
  test('Zurück-Button auf Detail-Seite funktioniert', async ({ page }) => {
    await page.locator('.task-card').first().click();
    await expect(page).toHaveURL(/\/tasks\/\d+/);

    await page.click('[data-testid="back-button"]');
    await expect(page).toHaveURL('/tasks');
  });

  // 7. MOBILE
  test('Funktioniert auf Mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await expect(page.locator('.task-list')).toBeVisible();

    // Add Button ist erreichbar
    const addButton = page.getByRole('button', { name: /add|hinzufügen/i });
    await expect(addButton).toBeVisible();
  });

  // 8. NO CONSOLE ERRORS
  test('Keine Console Errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});
```
