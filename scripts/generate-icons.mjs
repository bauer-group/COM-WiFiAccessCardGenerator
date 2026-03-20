/**
 * Generates PWA icons as PNG files from an SVG template.
 * Uses sharp for high-quality SVG → PNG conversion.
 *
 * Usage: node scripts/generate-icons.mjs
 */
import sharp from 'sharp';
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

for (const size of [192, 512]) {
  const svg = Buffer.from(generateSVGIcon(size));
  await sharp(svg).resize(size, size).png().toFile(`public/icon-${size}x${size}.png`);
  console.log(`Generated public/icon-${size}x${size}.png (${size}x${size})`);
}

// Also generate favicon
const faviconSvg = Buffer.from(generateSVGIcon(32));
await sharp(faviconSvg).resize(32, 32).png().toFile('public/favicon.ico');
console.log('Generated public/favicon.ico (32x32)');

console.log('\nDone! PWA icons are ready.');
