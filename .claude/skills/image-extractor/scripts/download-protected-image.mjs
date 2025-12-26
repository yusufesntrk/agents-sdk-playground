/**
 * Playwright script to download CDN-protected images
 * Usage: node download-protected-image.mjs <url> <image-selector-or-keyword> <output-path>
 *
 * Example:
 *   node download-protected-image.mjs "https://example.com" "testimonial" "./images"
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const [,, targetUrl, searchTerm, outputDir = '.'] = process.argv;

if (!targetUrl || !searchTerm) {
  console.error('Usage: node download-protected-image.mjs <url> <search-term> [output-dir]');
  console.error('Example: node download-protected-image.mjs "https://example.com" "avatar" "./downloads"');
  process.exit(1);
}

async function downloadImages() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
  });
  const page = await context.newPage();

  console.log(`Opening ${targetUrl}...`);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });

  // Wait for images to load
  await page.waitForTimeout(3000);

  // Find images matching the search term
  const images = await page.evaluate((term) => {
    const imgs = document.querySelectorAll('img');
    const termLower = term.toLowerCase();
    return Array.from(imgs)
      .map(img => ({
        src: img.src,
        alt: img.alt || '',
        className: img.className || '',
      }))
      .filter(img =>
        img.src.toLowerCase().includes(termLower) ||
        img.alt.toLowerCase().includes(termLower) ||
        img.className.toLowerCase().includes(termLower)
      );
  }, searchTerm);

  console.log(`Found ${images.length} matching images`);

  if (images.length === 0) {
    console.log('No images found. Listing all images on page...');
    const allImages = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src.substring(0, 100),
        alt: img.alt || '(no alt)',
      }));
    });
    console.log(JSON.stringify(allImages, null, 2));
    await browser.close();
    return;
  }

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Download each image using browser context (bypasses CDN protection)
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`Downloading [${i + 1}/${images.length}]: ${img.src.substring(0, 80)}...`);

    try {
      const response = await page.request.get(img.src);
      const buffer = await response.body();

      // Determine filename from URL or use index
      let filename = path.basename(new URL(img.src).pathname);
      filename = decodeURIComponent(filename).replace(/[^a-zA-Z0-9.-]/g, '_');

      if (!filename || filename === '/') {
        const ext = img.src.includes('.png') ? '.png' :
                   img.src.includes('.webp') ? '.webp' : '.jpg';
        filename = `image_${i + 1}${ext}`;
      }

      const outputPath = path.join(outputDir, filename);
      fs.writeFileSync(outputPath, buffer);
      console.log(`  Saved: ${outputPath} (${buffer.length} bytes)`);
    } catch (e) {
      console.error(`  Failed: ${e.message}`);
    }
  }

  await browser.close();
  console.log('Done!');
}

downloadImages().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
