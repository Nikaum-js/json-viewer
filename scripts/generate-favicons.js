import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateFavicons() {
  const svgPath = path.join(__dirname, '../public/favicon.svg');
  const outputDir = path.join(__dirname, '../public');

  // Verificar se o SVG existe
  if (!fs.existsSync(svgPath)) {
    console.error('❌ favicon.svg não encontrado em public/');
    return;
  }

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 }
  ];

  console.log('🎨 Gerando favicons...');

  for (const { name, size } of sizes) {
    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(path.join(outputDir, name));
      
      console.log(`✅ ${name} gerado (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${name}:`, error.message);
    }
  }

  console.log('🎉 Favicons gerados com sucesso!');
}

generateFavicons().catch(console.error);
