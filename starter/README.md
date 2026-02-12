## Workshop 02 – Node.js HTTP Server with Routing

This project demonstrates a basic Node.js HTTP server with manual routing and static file serving using only core Node.js modules.

## Overview

The server includes:

HTTP server running on port 3000

Routing for multiple pages (index, about, contact)

Static CSS file serving

404 error handling for unknown routes

Bonus: /api/time endpoint returning current date/time in JSON

## Project Structure
```
starter/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── about.html
│   ├── contact.html
│   └── styles/
│       └── style.css
└── .gitignore
```

## How to Run

Navigate to the project folder:

cd starter


Start the server:

npm start


or:

node server.js


Open in your browser:

http://localhost:3000

## Available Routes

/ – Home page

/about – About page

/contact – Contact page

/styles/style.css – Stylesheet

/api/time – Returns current date/time in JSON

Any unknown route – 404 error

## Technologies Used

Node.js (core modules only)

http

fs

path

## Summary

This workshop demonstrates building a simple HTTP server, implementing routing, serving static files, handling 404 responses, and returning JSON from a basic API endpoint.
