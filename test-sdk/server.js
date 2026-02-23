import express from 'express';
import HelmAnalytics from 'helm-analytics';

const app = express();
const port = 3060;

// Initialize Helm Analytics Middleware
// Make sure to replace <YOUR_API_KEY> with the one generated from the Cloud Dashboard
const helm = new HelmAnalytics({
  siteId: 'c851a52e-ac85-4151-ae53-c1cfcaac4822',
  apiKey: 'helm_889319b3490ea183a886c9b35bdedc4001e1efb15a05a006d87a164fea1f359c',
  // Points to your API endpoint (e.g., your local cloud backend on 6060, or production https://api.helm-analytics.com)
  apiUrl: 'https://api.helm-analytics.com',
});

// Use the middleware to track requests
app.use(helm.middleware());

app.get('/', (req, res) => {
  res.send('Hello World! This request is being tracked by Helm Analytics.');
});

app.get('/test', (req, res) => {
  // You can also manually trigger events if needed using the underlying tracking tools
  res.send('This is a test route tracked by the middleware.');
});

app.listen(port, () => {
  console.log(`Test app listening at http://localhost:${port}`);
  console.log(`Helm Analytics Middleware Initialized!`);
});
