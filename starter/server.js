const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const WEB_ROOT = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const PAGES = new Map([
  ['/', 'index.html'],
  ['/about', 'about.html'],
  ['/contact', 'contact.html']
]);

function safeJoin(rootDir, urlPath) {
  // Decode URL safely and strip query string
  const clean = decodeURIComponent(urlPath.split('?')[0]);

  // Normalize and prevent traversal
  const joined = path.join(rootDir, clean);
  const normalized = path.normalize(joined);

  if (!normalized.startsWith(rootDir)) return null;
  return normalized;
}

async function sendFile(res, absolutePath, statusCode = 200) {
  const ext = path.extname(absolutePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';

  const data = await fs.readFile(absolutePath);
  res.writeHead(statusCode, { 'Content-Type': type });
  res.end(data);
}

async function sendNotFound(res) {
  const notFoundPage = path.join(WEB_ROOT, '404.html');
  try {
    await sendFile(res, notFoundPage, 404);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 - Not Found');
  }
}

async function sendServerError(res, err) {
  console.error(err);

  const errorPage = path.join(WEB_ROOT, '500.html');
  try {
    await sendFile(res, errorPage, 500);
  } catch {
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('500 - Server Error');
  }
}

const server = http.createServer(async (req, res) => {
  console.log(`${req.method} ${req.url}`);

  try {
    const urlPath = (req.url || '/').split('?')[0];

    // API endpoint
    if (req.method === 'GET' && urlPath === '/api/time') {
      const payload = {
        datetime: new Date().toISOString(),
        timestamp: Date.now()
      };
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(payload));
      return;
    }
if (req.method === 'GET' && urlPath === '/api/version') {
  res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify({
    ok: true,
    version: "render-check-1",
    pages: Array.from(PAGES.keys())
  }));
  return;
}

    // Only serve pages/static content for GET
    if (req.method !== 'GET') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('405 - Method Not Allowed');
      return;
    }

    // Page routes
    if (PAGES.has(urlPath)) {
      const pageFile = PAGES.get(urlPath);
      const pagePath = path.join(WEB_ROOT, pageFile);
      await sendFile(res, pagePath, 200);
      return;
    }

    // Static files   
    const staticPath = safeJoin(WEB_ROOT, urlPath);
    if (!staticPath) {
      await sendNotFound(res);
      return;
    }

    try {
      await sendFile(res, staticPath, 200);
    } catch (e) {
      if (e && e.code === 'ENOENT') {
        await sendNotFound(res);
      } else {
        await sendServerError(res, e);
      }
    }
  } catch (err) {
    await sendServerError(res, err);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
