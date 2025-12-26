/**
 * Animation Extractor - Extract Animation Block
 *
 * Extracts a specific animation block from HTML source based on wrapper ID.
 *
 * Usage: node extract-animation.cjs <source-file> <wrapper-id> [output-file]
 *
 * Example:
 *   node extract-animation.cjs page-source.html calendar-animation-wrapper
 *   node extract-animation.cjs page-source.html calendar-animation-wrapper calendar.html
 */

const fs = require('fs');

const sourceFile = process.argv[2];
const wrapperId = process.argv[3];
const outputFile = process.argv[4];

if (!sourceFile || !wrapperId) {
  console.error('Usage: node extract-animation.cjs <source-file> <wrapper-id> [output-file]');
  console.error('Example: node extract-animation.cjs page-source.html calendar-animation-wrapper');
  process.exit(1);
}

if (!fs.existsSync(sourceFile)) {
  console.error(`File not found: ${sourceFile}`);
  process.exit(1);
}

const content = fs.readFileSync(sourceFile, 'utf-8');

// Find the wrapper start
const wrapperPattern = new RegExp(`<div[^>]*id=["']${wrapperId}["'][^>]*>`, 'i');
const startMatch = content.match(wrapperPattern);

if (!startMatch) {
  console.error(`Wrapper not found: #${wrapperId}`);
  console.error(`\nAvailable wrappers in file:`);

  // List available wrappers
  const wrappers = content.match(/id=["'][^"']*animation[^"']*wrapper[^"']*["']/gi);
  if (wrappers) {
    wrappers.forEach(w => console.log(`  ${w}`));
  } else {
    console.log('  (none found)');
  }
  process.exit(1);
}

const startIndex = content.indexOf(startMatch[0]);

// Find associated style tag (look backwards for closest style)
let styleStart = content.lastIndexOf('<style>', startIndex);
let styleContent = '';

if (styleStart !== -1 && startIndex - styleStart < 5000) {
  // Style is close enough, likely belongs to this animation
  const styleEnd = content.indexOf('</style>', styleStart);
  if (styleEnd !== -1) {
    styleContent = content.slice(styleStart, styleEnd + 8) + '\n\n';
  }
}

// Find closing tag - count nested divs
let depth = 1;
let endIndex = startIndex + startMatch[0].length;

while (depth > 0 && endIndex < content.length) {
  const nextOpen = content.indexOf('<div', endIndex);
  const nextClose = content.indexOf('</div>', endIndex);

  if (nextClose === -1) break;

  if (nextOpen !== -1 && nextOpen < nextClose) {
    depth++;
    endIndex = nextOpen + 4;
  } else {
    depth--;
    endIndex = nextClose + 6;
  }
}

// Find associated script tag
let scriptContent = '';
const scriptSearch = content.slice(endIndex, endIndex + 3000);
const scriptMatch = scriptSearch.match(/<script>([\s\S]*?)<\/script>/);

if (scriptMatch) {
  scriptContent = '\n\n<script>\n' + scriptMatch[1].trim() + '\n</script>';
}

// Extract the full block
const animationBlock = styleContent + content.slice(startIndex, endIndex) + scriptContent;

console.log(`\n--- Extracted Animation: #${wrapperId} ---`);
console.log(`Style block: ${styleContent ? 'Yes' : 'No'}`);
console.log(`Script block: ${scriptContent ? 'Yes' : 'No'}`);
console.log(`Total size: ${animationBlock.length.toLocaleString()} characters`);

if (outputFile) {
  fs.writeFileSync(outputFile, animationBlock);
  console.log(`\nSaved to: ${outputFile}`);
} else {
  console.log(`\n--- Content Preview (first 500 chars) ---`);
  console.log(animationBlock.slice(0, 500) + '...');
  console.log(`\nTo save, run with output file:`);
  console.log(`  node extract-animation.cjs ${sourceFile} ${wrapperId} animation.html`);
}
