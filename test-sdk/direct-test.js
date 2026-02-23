import HelmAnalytics from 'helm-analytics';

// Initialize Helm Analytics Middleware
const helm = new HelmAnalytics({
  siteId: 'c851a52e-ac85-4151-ae53-c1cfcaac4822',
  apiKey: 'helm_889319b3490ea183a886c9b35bdedc4001e1efb15a05a006d87a164fea1f359c',
  apiUrl: 'https://api.helm-analytics.com',
});

const req = {
  originalUrl: '/direct-test',
  headers: {
    'user-agent': 'TestScript/1.0',
    'x-forwarded-for': '127.0.0.1'
  }
};

console.log("Starting track event...");
helm.track(req, 'pageview', { pageTitle: "Direct SDK Test" })
  .then(success => console.log("Track returned:", success))
  .catch(err => console.error("Track error:", err));

// Keep process alive briefly so fetch can resolve (since it's fire-and-forget inside track)
setTimeout(() => {
    console.log("Done waiting.");
}, 3000);
