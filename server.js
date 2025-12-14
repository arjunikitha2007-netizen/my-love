const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // Use 3000 for local development (Change to process.env.PORT for deployment)
const locationFile = 'locations.txt'; // This is the file where data will be saved

// Middleware to parse incoming JSON bodies from the front-end
app.use(express.json()); 

// Serve the HTML file and other static assets from the current directory
app.use(express.static(path.join(__dirname))); 

// Define the POST endpoint that the front-end will call
app.post('/save-location', (req, res) => {
    // 1. Extract the location data from the request
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
        // Log error internally for debugging
        console.error('--- SERVER ERROR --- Received request with missing data.');
        return res.status(400).send('Error: Latitude and Longitude data is missing.');
    }

    // 2. Prepare the data string with a timestamp
    const timestamp = new Date().toISOString();
    const locationData = `[${timestamp}] Latitude: ${latitude}, Longitude: ${longitude}\n`;

    // 3. Append the data to the text file
    fs.appendFile(locationFile, locationData, (err) => {
        if (err) {
            // This handles the "Could not write location data to file" error
            console.error('--- SERVER ERROR --- Failed to save location data:', err);
            return res.status(500).send('Server Error: Could not save location data to file.');
        }

        console.log(`[LOG] Location saved: ${latitude}, ${longitude}`);
        res.send(`Success! Location saved to ${locationFile}`);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running and listening on port ${port}`);
    console.log(`Open your browser to: http://localhost:${port}/anagha_stealth.html`);
    console.log('Press Ctrl+C to stop the server.');
});