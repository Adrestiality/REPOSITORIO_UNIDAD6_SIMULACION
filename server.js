/**
 * ============================================================================
 * SERVIDOR DE DESARROLLO LOCAL (DEV SERVER)
 * Unidad 6: Agentes Autónomos - Simulación UPB
 * ============================================================================
 * Servidor HTTP nativo en Node.js de cero dependencias.
 * Soporta Git Bash, PowerShell, CMD y abre el navegador automáticamente.
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let PORT = parseInt(process.env.PORT, 10) || 3000;

// Mapa completo de tipos MIME
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURIComponent(req.url.split('?')[0]);
  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const safePath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(__dirname, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: El archivo "${reqPath}" no existe en el servidor.`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Soporte para streaming de audio MP3
    const range = req.headers.range;
    if (range && ext === '.mp3') {
      const totalSize = stats.size;
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });

      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    const url = `http://localhost:${portToTry}`;
    console.log(`\n============================================================`);
    console.log(`  🦢 UPB · SIMULACIÓN UNIDAD 6: AGENTES AUTÓNOMOS`);
    console.log(`  🎵 Tema: BTS Black Swan (Performance Interactivo)`);
    console.log(`  🚀 Servidor activo en: \x1b[36m${url}\x1b[0m`);
    console.log(`  ⌨️  Presiona Ctrl+C en Git Bash para detener`);
    console.log(`============================================================\n`);

    const startCmd = process.platform === 'win32'
      ? `start "" "${url}"`
      : process.platform === 'darwin'
      ? `open "${url}"`
      : `xdg-open "${url}"`;

    exec(startCmd, () => {});
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️  Puerto ${PORT} en uso, intentando puerto ${PORT + 1}...`);
    PORT++;
    startServer(PORT);
  } else {
    console.error('Error al iniciar el servidor:', err);
  }
});

startServer(PORT);
