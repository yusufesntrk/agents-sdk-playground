/**
 * Animation Extractor - Page Source Fetcher
 *
 * Usage: node get-source.cjs <url> [output-file]
 *
 * Example:
 *   node get-source.cjs https://example.com
 *   node get-source.cjs https://example.com my-page.html
 */

const { chromium } = require('playwright');
const fs = require('fs');

const url = process.argv[2];
const outputFile = process.argv[3] || 'page-source.html';

if (!url) {
  console.error('Usage: node get-source.cjs <url> [output-file]');
  console.error('Example: node get-source.cjs https://example.com');
  process.exit(1);
}

(async () => {
  console.log(`Launching browser...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  console.log(`Loading ${url}...`);

  try {
    await page.goto(url, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
  } catch (error) {
    console.error(`Failed to load page: ${error.message}`);
    await browser.close();
    process.exit(1);
  }

  // Get the full page source
  const content = await page.content();

  // Save to file
  fs.writeFileSync(outputFile, content);

  console.log(`\nPage source saved to: ${outputFile}`);
  console.log(`Total length: ${content.length.toLocaleString()} characters`);

  // Quick analysis
  const keyframeMatches = content.match(/@keyframes/g);
  const animationWrappers = content.match(/animation-wrapper/gi);

  console.log(`\n--- Animation Analysis ---`);
  console.log(`@keyframes found: ${keyframeMatches ? keyframeMatches.length : 0}`);
  console.log(`Animation wrappers found: ${animationWrappers ? animationWrappers.length : 0}`);

  if (animationWrappers) {
    console.log(`\nSearch for wrappers with:`);
    console.log(`  grep -n "animation-wrapper" ${outputFile}`);
  }

  await browser.close();
})();
