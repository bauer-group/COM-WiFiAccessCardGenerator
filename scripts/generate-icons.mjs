/**
 * Generates PWA icon placeholders.
 * For production, replace with actual brand icons from the Corporate Identity guide.
 *
 * Usage: node scripts/generate-icons.mjs
 */
import { writeFileSync } from 'fs';

function generateSVGIcon(size) {
  const padding = Math.round(size * 0.15);
  const iconSize = size - padding * 2;
  const cx = size / 2;
  const cy = size / 2;
  const r = iconSize / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.15)}" fill="#FF8500"/>
  <g transform="translate(${cx}, ${cy - r * 0.1})" fill="none" stroke="white" stroke-width="${Math.round(size * 0.04)}" stroke-linecap="round">
    <path d="M${-r * 0.65} ${-r * 0.3} A ${r * 0.9} ${r * 0.9} 0 0 1 ${r * 0.65} ${-r * 0.3}"/>
    <path d="M${-r * 0.45} ${-r * 0.05} A ${r * 0.6} ${r * 0.6} 0 0 1 ${r * 0.45} ${-r * 0.05}"/>
    <path d="M${-r * 0.25} ${r * 0.2} A ${r * 0.35} ${r * 0.35} 0 0 1 ${r * 0.25} ${r * 0.2}"/>
    <circle cx="0" cy="${r * 0.4}" r="${Math.round(size * 0.035)}" fill="white" stroke="none"/>
  </g>
</svg>`;
}

// Generate simple PNG-like SVGs (browsers accept SVG for PWA icons)
// For actual PNG generation, use a canvas library or design tool
for (const size of [192, 512]) {
  const svg = generateSVGIcon(size);
  writeFileSync(`public/icon-${size}x${size}.svg`, svg);
  console.log(`Generated public/icon-${size}x${size}.svg`);
}

console.log('\\nNote: For production, convert SVGs to PNGs and replace icon-*.png files.');
console.log('You can use: npx sharp-cli -i public/icon-512x512.svg -o public/icon-512x512.png resize 512 512');
