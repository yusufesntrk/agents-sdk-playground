---
name: image-extractor
description: This skill should be used when the user asks to "extract images from website", "download images from URL", "scrape images", "get pictures from page", "download testimonial images", "extract avatars from site", "find photo of person", "get LinkedIn profile picture", "download team member photo", or needs to bypass CDN protection to download web images. Also use when LinkedIn photo resolution is too low and a higher quality alternative is needed.
---

# Image Extractor

Extract and download images from websites, including CDN-protected images that block direct downloads.

## When to Use

- Extracting images from any website
- Downloading testimonial/avatar images
- Scraping product images or logos
- Bypassing CDN protection (Webflow, Cloudflare, etc.)
- Batch downloading multiple images
- **Finding person photos** (LinkedIn, Google Images, company websites)
- **Low resolution fallback** - when LinkedIn only provides 200x200px

## Three-Step Workflow

### Step 1: Discover Image URLs with WebFetch

Use WebFetch to analyze the page and find image URLs:

```
WebFetch:
  url: "https://example.com"
  prompt: "Find all image URLs, especially in the testimonial/team section. List all img src URLs."
```

This returns a list of image URLs found on the page.

### Step 2: Attempt Direct Download with curl

Try downloading directly first (works for most images):

```bash
curl -L -o "output-filename.jpg" "https://cdn.example.com/image.jpg"
```

**Verify the download:**
```bash
file output-filename.jpg
ls -la output-filename.jpg
```

If the file is very small (< 1KB) or contains XML/HTML, the CDN blocked the request. Proceed to Step 3.

### Step 3: Use Playwright for Protected Images

For CDN-protected images, use the bundled Playwright script:

```bash
node .claude/skills/image-extractor/scripts/download-protected-image.mjs \
  "https://example.com" \
  "search-term" \
  "./output-directory"
```

**Parameters:**
- `url` - The webpage URL containing the images
- `search-term` - Keyword to filter images (matches src, alt, or class)
- `output-directory` - Where to save downloaded images (optional, defaults to current dir)

**How it works:**
1. Launches headless Chromium browser
2. Navigates to the page with proper headers/cookies
3. Finds images matching the search term
4. Downloads using browser context (bypasses CDN restrictions)
5. Saves with original filenames

## Quick Reference

| Scenario | Method |
|----------|--------|
| Public images | `curl -L -o file.jpg "URL"` |
| CDN-protected | Playwright script |
| Find URLs first | WebFetch with prompt |
| Verify download | `file filename.jpg` |

## Common CDN Protections

These CDNs often block direct curl requests:
- **Webflow** (website-files.com)
- **Cloudflare**
- **AWS CloudFront** with signed URLs
- **Imgix** with tokens

Signs of blocked download:
- File size < 1KB
- `file` command shows "XML" or "HTML" instead of image type
- Content contains "Access Denied" or "403 Forbidden"

## Example: Full Workflow

**Task:** Extract testimonial images from leyaltech.de

**1. Discover URLs:**
```
WebFetch url="https://leyaltech.de" prompt="Find testimonial image URLs"
```
Returns: `https://cdn.prod.website-files.com/.../testimonial.png`

**2. Try direct download:**
```bash
curl -L -o testimonial.png "https://cdn.prod.website-files.com/.../testimonial.png"
file testimonial.png  # Shows "XML" = blocked!
```

**3. Use Playwright:**
```bash
node .claude/skills/image-extractor/scripts/download-protected-image.mjs \
  "https://leyaltech.de" \
  "testimonial" \
  "./"
```
Result: Images downloaded successfully with browser context.

## Person Photos (Testimonials, Team Members)

When downloading photos of people (e.g., for testimonials), follow this priority:

### Priority 1: LinkedIn Profile Photo

LinkedIn is the preferred source for professional photos:

```bash
node .claude/skills/image-extractor/scripts/download-protected-image.mjs \
  "https://www.linkedin.com/in/person-name/" \
  "profile" \
  "./public/testimonials/"
```

**Problem:** LinkedIn only serves 200x200px images without login.

### Priority 2: Google Image Search (Higher Resolution)

If LinkedIn resolution is too low, use Google Image Search to find better photos:

```javascript
// get-photo.mjs - Run from project root
import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

// Search Google Images
await page.goto('https://www.google.com/search?q=PERSON+NAME+COMPANY&tbm=isch', {
  waitUntil: 'networkidle',
  timeout: 30000
});
await page.waitForTimeout(2000);

// Accept cookies (German Google)
const acceptBtn = await page.$('button:has-text("Alle akzeptieren")');
if (acceptBtn) {
  await acceptBtn.click();
  await page.waitForTimeout(2000);
}
await page.waitForTimeout(3000);

// Extract original image URLs from HTML
const html = await page.content();

// Find potential portrait images
const imageRegex = /https:\/\/[^"'\s]+\.(?:jpg|jpeg|png|webp)/gi;
const matches = html.match(imageRegex) || [];

// Filter for portraits (exclude logos, icons, Google assets)
const portraits = [...new Set(matches)]
  .filter(url =>
    !url.includes('logo') &&
    !url.includes('Logo') &&
    !url.includes('icon') &&
    !url.includes('badge') &&
    !url.includes('google') &&
    !url.includes('gstatic') &&
    url.length < 500
  );

console.log('Found portraits:', portraits.slice(0, 5));

// Download first valid image
for (const url of portraits) {
  try {
    const response = await page.request.get(url);
    const buffer = await response.body();
    if (buffer.length > 5000) {  // Skip tiny/blocked images
      writeFileSync('./public/testimonials/person-name.jpg', buffer);
      console.log('Saved! Size:', buffer.length, 'bytes');
      break;
    }
  } catch (e) {
    console.log('Failed:', url);
  }
}

await browser.close();
```

Run with: `node get-photo.mjs && rm get-photo.mjs`

### Quality Check

Always verify the downloaded image:

```bash
file person-name.jpg  # Should show "JPEG image data"
ls -la person-name.jpg  # Check file size (> 10KB is good)
```

**Good resolution:** 400x400px or larger
**Acceptable:** 200x200px (LinkedIn default)
**Too small:** < 100x100px (find alternative)

### Common Sources for Person Photos

| Source | Resolution | Notes |
|--------|------------|-------|
| LinkedIn (public) | 200x200 | Low quality without login |
| Company website | Varies | Often high quality |
| XING | 1024x1024 | Good quality |
| Google Images | Original | Best for finding alternatives |
| Gravatar | Up to 2048px | Use `?s=SIZE` parameter |

### Workflow Summary

1. **Try LinkedIn first** (professional, consistent)
2. **Check resolution** with `file` command
3. **If < 400px**, use Google Image Search
4. **Extract original URLs** from Google HTML (not thumbnails)
5. **Download largest valid image** that's not a logo

## Troubleshooting

### Script times out
Increase timeout or use `waitUntil: 'domcontentloaded'` instead of `networkidle`.

### No images found
Run script without search term to list all images on page, then refine search.

### Images still blocked
Some sites require authentication. Consider:
- Adding cookies to browser context
- Using authenticated session state

## Bundled Resources

- `scripts/download-protected-image.mjs` - Playwright script for CDN-protected images
