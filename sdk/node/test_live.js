const HelmAnalytics = require('helm-analytics');

// Use the same Site ID we used for Python
const SITE_ID = "e3d3d060-dc0d-4301-894a-5994f65e2216";

console.log(`Initializing Helm Analytics (Node.js) with Site ID: ${SITE_ID}`);
const helm = new HelmAnalytics({ siteId: SITE_ID });

const mockReq = {
    originalUrl: 'http://test-node-sdk.com/integration-test',
    url: 'http://test-node-sdk.com/integration-test',
    headers: {
        'user-agent': 'Helm-Node-SDK-Test/1.0',
        'referer': 'http://npmjs.org',
        'x-forwarded-for': '5.6.7.8'
    },
    socket: { remoteAddress: '5.6.7.8' }
};

console.log("Sending test event: 'node_sdk_test'...");

// track() is async but fires-and-forgets internally usually, 
// strictly speaking it returns a promise we can await if we want validation.
helm.track(mockReq, 'pageview', { status: 'success' })
    .then(() => {
        console.log("Event dispatched! Check your dashboard.");
        // Short delay to ensure network flush
        setTimeout(() => process.exit(0), 2000);
    })
    .catch(err => {
        console.error("Tracking Error:", err);
    });
