(function() {
    const scriptTag = document.querySelector('script[data-site-id]');
    if (!scriptTag) {
        console.error('Sentinel: data-site-id attribute not found on script tag.');
        return;
    }
    const siteId = scriptTag.getAttribute('data-site-id');
    const apiEndpoint = 'https://api-sentinel.getmusterup.com/track';
    const clickEndpoint = 'https://api-sentinel.getmusterup.com/track/click';
    const errorEndpoint = 'https://api-sentinel.getmusterup.com/track/error';
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

        function track(payload = {}, options = {}) {
            const data = {
                siteId: siteId,
                url: window.location.href,
                referrer: document.referrer || '',
                screenWidth: window.screen.width,
                eventType: 'pageview', // Default to pageview if not overridden
                ...payload
            };

            fetch(apiEndpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: options.keepalive !== undefined ? options.keepalive : true,
            }).catch(error => console.error('Sentinel tracking error:', error));
        }

        // --- CLICK TRACKING ---
        document.addEventListener('click', (e) => {
            const data = {
                siteId: siteId,
                url: window.location.href,
                x: e.pageX,
                y: e.pageY,
                selector: getSelector(e.target)
            };
            fetch(clickEndpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(err => console.error('Sentinel click error:', err));
        });

        // Helper to generate a simple CSS selector
        function getSelector(el) {
            if (el.tagName.toLowerCase() === 'html') return 'html';
            if (el.tagName.toLowerCase() === 'body') return 'body';
            if (el.id) return '#' + el.id;
            if (el.className && typeof el.className === 'string') return '.' + el.className.split(' ').join('.');
            return el.tagName.toLowerCase();
        }

        // --- ERROR TRACKING ---
        window.addEventListener('error', (e) => {
             const data = {
                siteId: siteId,
                url: window.location.href,
                message: e.message,
                source: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                error: e.error ? e.error.toString() : ''
            };
            fetch(errorEndpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' },
                keepalive: true
            }).catch(err => console.error('Sentinel error tracking failed:', err));
        });

        window.addEventListener('unhandledrejection', (e) => {
            const data = {
               siteId: siteId,
               url: window.location.href,
               message: e.reason ? (e.reason.message || e.reason.toString()) : 'Unhandled Promise Rejection',
               source: 'Promise',
               lineno: 0,
               colno: 0,
               error: e.reason ? JSON.stringify(e.reason) : ''
           };
           fetch(errorEndpoint, {
               method: 'POST',
               body: JSON.stringify(data),
               headers: { 'Content-Type': 'application/json' },
               keepalive: true
           }).catch(err => console.error('Sentinel error tracking failed:', err));
       });


        // Expose a global function for web-vitals to call
        window.trackWebVitals = (vital) => {
            // vital is like { name: 'LCP', value: 123.45 }
            // We need to flatten it to { LCP: 123.45 }
            if (vital && vital.name && vital.value !== undefined) {
                track({ [vital.name]: vital.value, eventType: 'web-vital' });
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
                    // Optimization: If this is the very first batch (snapshot), send it sooner
                    if (!sessionId && events.length > 50) {
                        flushEvents();
                    }
                },
                checkoutEveryNth: 100, // Enforce snapshots periodically
            });
        } else {
            console.error("Sentinel: rrweb failed to load");
        }

        let sessionId = null;

        function flushEvents(isUnload = false) {
             if (events.length > 0) {
                const body = JSON.stringify({ siteId: siteId, events: events, sessionId: sessionId });
                events = []; // Clear buffer
                fetch(sessionEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body,
                    keepalive: isUnload // Only use keepalive on unload to avoid 64KB limit during session
                })
                .then(response => response.json())
                .then(data => {
                    if (data.sessionId) {
                        sessionId = data.sessionId;
                    }
                })
                .catch(err => console.error('Sentinel session recording error:', err));
            }
        }

        // Save events every 5 seconds
        setInterval(flushEvents, 5 * 1000);
        
        // Flush on exit
        const flushOnUnload = () => flushEvents(true);
        window.addEventListener('pagehide', flushOnUnload);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                flushEvents(true);
            }
        });

        // --- Heartbeat Tracking ---
        // Send a heartbeat every 15 seconds to track time-on-page accurately
        setInterval(() => {
            if (document.visibilityState === 'visible') {
               track({ eventType: 'heartbeat' });
            }
        }, 15000);
    }
})();