const express = require('express');
const HelmAnalytics = require('helm-analytics');

const app = express();

// 1. Initialize Helm
const helm = new HelmAnalytics({ 
    siteId: 'e3d3d060-dc0d-4301-894a-5994f65e2216', // User's Site ID
    apiUrl: 'https://api-sentinel.getmusterup.com/track' // Optional: defaults to prod
});

// 2. USE THE MIDDLEWARE (This is the magic line)
// This strictly tracks every single request automatically.
// No manual tracking needed for standard page views.
app.use(helm.middleware());

// Define routes as normal
app.get('/', (req, res) => {
    res.send('<h1>Home Page</h1><p>Visit /about or /contact to see more events.</p>');
});

app.get('/about', (req, res) => {
    res.send('<h1>About Us</h1>');
});

app.get('/contact', (req, res) => {
    res.send('<h1>Contact</h1>');
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
    console.log('Helm Analytics Middleware is active! 🚀');
});
