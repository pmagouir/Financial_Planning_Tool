// Generates the social share card (Open Graph / Twitter) at public/og-image.png.
// Rendered as an on-brand 1200x630 SVG and rasterized with sharp (2x supersample).
// Regenerate after changing the hero copy or palette:  node scripts/generate-og.mjs
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.png');

// Design-system palette (CLAUDE.md §UI/UX)
const C = {
  bg0: '#0b1120',
  bg1: '#0f172a',
  bg2: '#15213c',
  slate: '#475569',
  slate400: '#94a3b8',
  slate500: '#64748b',
  blue: '#3b82f6',
  blueLt: '#93c5fd',
  blueEy: '#60a5fa',
  emerald: '#10b981',
  white: '#f8fafc',
};

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const MONO = "'Menlo', 'SF Mono', Monaco, monospace";

// Smooth compound-growth curve — stays low/flat under the text on the left,
// then sweeps up on the right where there is no copy.
const curve =
  'M 0,548 C 220,544 430,536 620,516 C 770,500 830,476 905,430 C 985,378 1052,290 1130,180';

// Faint horizontal gridlines (financial-dashboard feel)
const gridY = [110, 200, 290, 380, 470, 560]
  .map((y) => `<line x1="0" y1="${y}" x2="1200" y2="${y}" stroke="#233149" stroke-width="1" opacity="0.45"/>`)
  .join('');

const svg = `<svg width="2400" height="1260" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.bg0}"/>
      <stop offset="0.55" stop-color="${C.bg1}"/>
      <stop offset="1" stop-color="${C.bg2}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.82" cy="0.18" r="0.6">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.20"/>
      <stop offset="1" stop-color="${C.blue}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.emerald}"/>
      <stop offset="1" stop-color="${C.blue}"/>
    </linearGradient>
    <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.blue}" stop-opacity="0.30"/>
      <stop offset="0.6" stop-color="${C.emerald}" stop-opacity="0.10"/>
      <stop offset="1" stop-color="${C.emerald}" stop-opacity="0"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  ${gridY}

  <!-- growth curve -->
  <path d="${curve} L 1130,630 L 0,630 Z" fill="url(#fill)"/>
  <path d="${curve}" fill="none" stroke="url(#line)" stroke-width="4" stroke-linecap="round"/>
  <circle cx="1130" cy="180" r="20" fill="${C.blue}" opacity="0.22"/>
  <circle cx="1130" cy="180" r="7.5" fill="${C.blue}" stroke="${C.white}" stroke-width="2.5"/>
  <text x="1112" y="150" text-anchor="end" font-family="${MONO}" font-size="30" font-weight="600" fill="${C.blueLt}">$1.27M</text>

  <!-- brand mark: three ascending bars (growth + the three frameworks) -->
  <rect x="80" y="74"  width="15" height="26" rx="4" fill="${C.slate}"/>
  <rect x="103" y="62" width="15" height="38" rx="4" fill="${C.blue}"/>
  <rect x="126" y="48" width="15" height="52" rx="4" fill="${C.emerald}"/>

  <!-- eyebrow -->
  <text x="162" y="86" font-family="${SANS}" font-size="22" font-weight="700" letter-spacing="3.5" fill="${C.blueEy}">SPENDING · INVESTING · BEHAVIOR</text>

  <!-- headline -->
  <text x="78" y="222" font-family="${SANS}" font-size="92" font-weight="800" fill="${C.white}">Find Your</text>
  <text x="78" y="322" font-family="${SANS}" font-size="92" font-weight="800" fill="${C.blue}">Retirement Number.</text>

  <!-- subline -->
  <text x="80" y="392" font-family="${SANS}" font-size="30" font-weight="500" fill="${C.slate400}">Five steps. No accounts. No data leaving your browser.</text>

  <!-- footer -->
  <text x="80" y="588" font-family="${SANS}" font-size="22" font-weight="500" fill="${C.slate500}">Built on Sethi · Collins · Housel</text>
  <text x="1120" y="588" text-anchor="end" font-family="${SANS}" font-size="20" font-weight="500" fill="${C.slate}">Educational tool · not financial advice</text>
</svg>`;

await sharp(Buffer.from(svg)).resize(1200, 630).png({ compressionLevel: 9 }).toFile(OUT);
console.log('Wrote', OUT);
