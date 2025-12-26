/**
 * Visual Review Helper for UI Review Agent
 *
 * Takes screenshots of pages/dialogs for visual analysis.
 * Run with: npx ts-node .claude/agents/ui-review-agent/visual-review.ts <route> [action]
 *
 * Examples:
 *   npx ts-node visual-review.ts /candidates
 *   npx ts-node visual-review.ts /candidates/123 "click:button:Bearbeiten"
 */

import { chromium, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = 'http://localhost:5173';
const SCREENSHOT_DIR = 'qa-screenshots/visual-review';
const AUTH_STATE = 'tests/.auth/state.json';

async function takeScreenshot(route: string, action?: string): Promise<string> {
  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    storageState: fs.existsSync(AUTH_STATE) ? AUTH_STATE : undefined,
  });
  const page = await context.newPage();

  try {
    // Navigate to route
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000); // Wait for animations

    // Perform action if specified (e.g., open a dialog)
    if (action) {
      await performAction(page, action);
      await page.waitForTimeout(500);
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const routeName = route.replace(/\//g, '-').replace(/^-/, '') || 'home';
    const filename = `${routeName}${action ? '-action' : ''}-${timestamp}.png`;
    const filepath = path.join(SCREENSHOT_DIR, filename);

    // Take screenshot
    await page.screenshot({
      path: filepath,
      fullPage: true,
      animations: 'disabled'
    });

    console.log(`Screenshot saved: ${filepath}`);
    return filepath;

  } finally {
    await browser.close();
  }
}

async function performAction(page: Page, action: string): Promise<void> {
  // Parse action string: "click:button:Bearbeiten" or "click:text:Kandidat bearbeiten"
  const [type, selector, value] = action.split(':');

  switch (type) {
    case 'click':
      if (selector === 'button') {
        await page.getByRole('button', { name: value }).click();
      } else if (selector === 'text') {
        await page.getByText(value).click();
      } else if (selector === 'testid') {
        await page.getByTestId(value).click();
      }
      break;
    case 'hover':
      await page.getByText(value).hover();
      break;
    case 'wait':
      await page.waitForTimeout(parseInt(value) || 1000);
      break;
  }
}

// CLI execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: npx ts-node visual-review.ts <route> [action]');
  console.log('Example: npx ts-node visual-review.ts /candidates "click:button:Bearbeiten"');
  process.exit(1);
}

takeScreenshot(args[0], args[1])
  .then((filepath) => {
    console.log(`\nVisual review screenshot ready.`);
    console.log(`To analyze: Read the file ${filepath}`);
  })
  .catch((error) => {
    console.error('Screenshot failed:', error);
    process.exit(1);
  });
