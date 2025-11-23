(function() {
    const scriptTag = document.querySelector('script[data-site-id]');
    if (!scriptTag) {
        console.error('Sentinel: data-site-id attribute not found on script tag.');
        return;
    }
    const siteId = scriptTag.getAttribute('data-site-id');
    const apiEndpoint = 'https://api-sentinel.getmusterup.com/track';
    const sessionEndpoint = 'https://api-sentinel.getmusterup.com/session';

    // Inject rrweb
    const rrwebScript = document.createElement('script');
    rrwebScript.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js';
    document.head.appendChild(rrwebScript);

    // Inject Web Vitals (Standard IIFE)
    const webVitalsScript = document.createElement('script');
    webVitalsScript.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    document.head.appendChild(webVitalsScript);

    rrwebScript.onload = function() {
        // Initialize tracking logic once rrweb is ready
        let events = [];
        let lastUrl = location.href;

        function track(payload = {}) {
            const data = {
                siteId: siteId,
                url: window.location.href,
                referrer: document.referrer || '',
                screenWidth: window.screen.width,
                ...payload
            };

            fetch(apiEndpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true,
            }).catch(error => console.error('Sentinel tracking error:', error));
        }

        // Expose a global function for web-vitals to call
        window.trackWebVitals = (vital) => {
            // vital is like { name: 'LCP', value: 123.45 }
            // We need to flatten it to { LCP: 123.45 }
            if (vital && vital.name && vital.value !== undefined) {
                track({ [vital.name]: vital.value });
            }
        };
        
        // Initialize Web Vitals when script loads
        webVitalsScript.onload = function() {
             if (window.webVitals) {
                const { onCLS, onFID, onLCP } = window.webVitals;
                onCLS(window.trackWebVitals);
                onFID(window.trackWebVitals);
                onLCP(window.trackWebVitals);
             }
        };


        // --- SPA Tracking ---
        // Track initial page view
        track();

        const originalPushState = history.pushState;
        history.pushState = function(...args) {
            originalPushState.apply(this, args);
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                track(); // Track navigation
            }
        };

        window.addEventListener('popstate', () => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                track(); // Track navigation
            }
        });

        // --- RRWeb Session Recording ---
        // Check if rrweb is actually available
        if (window.rrweb) {
             window.rrweb.record({
                emit(event) {
                    events.push(event);
                },
            });
        } else {
            console.error("Sentinel: rrweb failed to load");
        }

        let sessionId = null;

        // Save events every 10 seconds
        setInterval(() => {
            if (events.length > 0) {
                const body = JSON.stringify({ siteId: siteId, events: events, sessionId: sessionId });
                events = []; // Clear buffer
                fetch(sessionEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body,
                    keepalive: true
                })
                .then(response => response.json())
                .then(data => {
                    if (data.sessionId) {
                        sessionId = data.sessionId;
                    }
                })
                .catch(err => console.error('Sentinel session recording error:', err));
            }
        }, 10 * 1000);
    }
})();
