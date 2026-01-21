const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json'
};

// Create HTTP server
const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    try {
        // Handle /api/time endpoint (Task 6 - Bonus)
        if (req.url === '/api/time' && req.method === 'GET') {
            const currentDateTime = new Date().toISOString();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                datetime: currentDateTime,
                timestamp: Date.now()
            }));
            return;
        }

        // Route mapping for HTML pages
        let filePath;
        if (req.url === '/') {
            // GET / -> public/index.html
            filePath = path.join(PUBLIC_DIR, 'index.html');
        } else if (req.url === '/about') {
            // GET /about -> public/about.html
            filePath = path.join(PUBLIC_DIR, 'about.html');
        } else if (req.url === '/contact') {
            // GET /contact -> public/contact.html
            filePath = path.join(PUBLIC_DIR, 'contact.html');
        } else if (req.url.startsWith('/styles/')) {
            // GET /styles/* -> public/styles/<file>
            filePath = path.join(PUBLIC_DIR, req.url);
            
            // Prevent path traversal attacks
            const normalizedPath = path.normalize(filePath);
            if (!normalizedPath.startsWith(PUBLIC_DIR)) {
                handle404(res);
                return;
            }
        } else {
            // Unknown path -> 404
            handle404(res);
            return;
        }

        // Get file extension for MIME type
        const extname = path.extname(filePath);
        const contentType = MIME_TYPES[extname] || 'text/html';

        // Read and serve the file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    // File not found
                    handle404(res);
                } else {
                    // Server error
                    handleServerError(res, err);
                }
            } else {
                // Success
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(content, 'utf-8');
            }
        });

    } catch (error) {
        // Catch any unexpected errors
        handleServerError(res, error);
    }
});

// 404 Error Handler
function handle404(res) {
    const notFoundHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 - Not Found</title>
    <link rel="stylesheet" href="/styles/style.css">
    <style>
        .error-container {
            text-align: center;
            padding: 3rem;
        }
        .error-code {
            font-size: 5rem;
            color: #e8491d;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <header>
        <h1>Page Not Found</h1>
        <nav>
            <a href="/">Home</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
        </nav>
    </header>
    <main>
        <div class="error-container">
            <div class="error-code">404</div>
            <h2>Oops! Page not found</h2>
            <p>The page you are looking for doesn't exist or has been moved.</p>
            <p><a href="/">Go back to home</a></p>
        </div>
    </main>
</body>
</html>
    `;
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(notFoundHTML);
}

// 500 Server Error Handler
function handleServerError(res, error) {
    console.error('Server error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 - Internal Server Error');
}

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('Available routes:');
    console.log('  GET /              -> index.html');
    console.log('  GET /about         -> about.html');
    console.log('  GET /contact       -> contact.html');
    console.log('  GET /styles/*      -> CSS files');
    console.log('  GET /api/time      -> Current date/time (JSON)');
});
