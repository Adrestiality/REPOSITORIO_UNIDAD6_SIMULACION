/**
 * ============================================================================
 * SCRIPT DE BUILD PARA GITHUB PAGES (CI/CD DEPLOY)
 * ============================================================================
 * Empaqueta todos los archivos de la simulación 2D estática en la carpeta /dist
 * para despliegue automático en GitHub Pages sin dependencias pesadas.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, 'dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) return;

  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Limpiar o crear dist
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}
fs.mkdirSync(distDir, { recursive: true });

// 2. Elementos a copiar
const itemsToCopy = [
  'index.html',
  'style.css',
  'js',
  'assets',
  'BTS Black Swan (Orchestral Ver.) Instrumental.mp3'
];

itemsToCopy.forEach((item) => {
  const srcPath = path.join(__dirname, item);
  const destPath = path.join(distDir, item);

  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
    console.log(`✓ Copiado: ${item}`);
  }
});

console.log('\n✅ Build completado exitosamente en /dist listo para GitHub Pages.\n');
