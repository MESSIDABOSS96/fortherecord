const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function optimizeLogo() {
  console.log('Starting logo optimization...');

  // Read the SVG file
  const svgPath = path.join(__dirname, '../public/logo.svg');
  const svgContent = fs.readFileSync(svgPath, 'utf8');

  // Extract base64 PNG data from SVG
  const base64Match = svgContent.match(/data:image\/png;base64,([^"]+)/);

  if (!base64Match) {
    console.error('No embedded base64 PNG found in SVG');
    process.exit(1);
  }

  console.log('Found embedded PNG, extracting...');
  const base64Data = base64Match[1];
  const imageBuffer = Buffer.from(base64Data, 'base64');

  console.log(`Original size: ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB`);

  // Optimize the image
  console.log('Optimizing image...');

  // Create optimized PNG version (for favicon)
  const optimizedPng = await sharp(imageBuffer)
    .resize(512, 512, { // Resize to reasonable size for favicon
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png({ quality: 90, compressionLevel: 9 })
    .toBuffer();

  console.log(`Optimized PNG size: ${(optimizedPng.length / 1024).toFixed(2)}KB`);

  // Create WebP version (for logo display - better compression)
  const optimizedWebP = await sharp(imageBuffer)
    .resize(512, 512, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 90 })
    .toBuffer();

  console.log(`Optimized WebP size: ${(optimizedWebP.length / 1024).toFixed(2)}KB`);

  // Save the optimized versions
  const publicDir = path.join(__dirname, '../public');
  const appDir = path.join(__dirname, '../app');

  // Save PNG version for favicon
  fs.writeFileSync(path.join(appDir, 'icon.png'), optimizedPng);
  console.log('Saved app/icon.png');

  // Save WebP version for logo display
  fs.writeFileSync(path.join(publicDir, 'logo.webp'), optimizedWebP);
  console.log('Saved public/logo.webp');

  // Also save PNG as fallback
  fs.writeFileSync(path.join(publicDir, 'logo.png'), optimizedPng);
  console.log('Saved public/logo.png');

  console.log('\n✅ Logo optimization complete!');
  console.log('Next steps:');
  console.log('1. Update components to use logo.webp (with PNG fallback)');
  console.log('2. Remove old logo.svg and icon.svg files');
}

optimizeLogo().catch(console.error);
