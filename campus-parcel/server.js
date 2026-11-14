// server.js - Lightweight static server for Campus Parcel Management
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// Resolve base directory: if 'campus-parcel' exists as a subfolder, use it; otherwise use __dirname
let BASE_DIR = __dirname;
if (fs.existsSync(path.join(__dirname, 'campus-parcel', 'HTML'))) {
  BASE_DIR = path.join(__dirname, 'campus-parcel');
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  let reqPath = decodeURI(req.url.split('?')[0]);

  // Default redirect root to login page
  if (reqPath === '/' || reqPath === '') {
    res.writeHead(302, { 'Location': '/HTML/login.html' });
    res.end();
    return;
  }

  // Strip leading /campus-parcel if present
  if (reqPath.startsWith('/campus-parcel/')) {
    reqPath = reqPath.replace('/campus-parcel', '');
  }

  let filePath = path.join(BASE_DIR, reqPath);

  // If path doesn't exist in BASE_DIR, try __dirname
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, reqPath);
  }

  // Check if directory
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexHtml = path.join(filePath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      filePath = indexHtml;
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>Path: ${reqPath}</p><p><a href="/HTML/login.html">Go to Login</a></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n====================================================`);
  console.log(`Campus Parcel Management Server running at:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`http://localhost:${PORT}/HTML/login.html`);
  console.log(`====================================================\n`);
});

