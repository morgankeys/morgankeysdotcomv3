#!/usr/bin/env node

/**
 * Generate a raster placeholder image for testing the image pipeline.
 * This proves the responsive srcset generation works (SVGs bypass sharp).
 */

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const outputPath = join(__dirname, "../src/assets/placeholder-raster.jpg");

// Create a 1600×900 gradient image (16:9 aspect ratio, typical hero size)
const width = 1600;
const height = 900;

// Create an SVG that sharp can render to raster
const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2B638B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#4A9BC7;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)" />
  <text x="50%" y="50%" font-family="sans-serif" font-size="64" font-weight="bold" 
        text-anchor="middle" dominant-baseline="middle" fill="white">
    Placeholder Image
  </text>
  <text x="50%" y="55%" font-family="sans-serif" font-size="32" 
        text-anchor="middle" dominant-baseline="middle" fill="rgba(255,255,255,0.8)">
    ${width} × ${height}
  </text>
</svg>
`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 85, mozjpeg: true })
  .toFile(outputPath);

console.log(`✓ Generated placeholder: ${outputPath}`);
