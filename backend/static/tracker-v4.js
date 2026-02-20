(function() {
    const scriptTag = document.querySelector('script[data-site-id]');
    if (!scriptTag) {
        console.error('Sentinel: data-site-id attribute not found on script tag.');
        return;
    }
    const siteId = scriptTag.getAttribute('data-site-id');
    
    let apiBase = scriptTag.getAttribute('data-api');
    if (!apiBase && scriptTag.src) {
        try {
            const scriptUrl = new URL(scriptTag.src);
            apiBase = `${scriptUrl.protocol}//${scriptUrl.host}`;
        } catch (e) {
            console.error('Sentinel: Unable to detect API URL');
        }
    }
    
    const apiEndpoint = `${apiBase}/track`;
    const clickEndpoint = `${apiBase}/track/click`;
    const errorEndpoint = `${apiBase}/track/error`;
    const sessionEndpoint = `${apiBase}/session`;

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

        // Generate or retrieve Session ID
        let sessionId = sessionStorage.getItem('sentinel_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('sentinel_session_id', sessionId);
        }

        function track(payload = {}, options = {}) {
            const data = {
                siteId: siteId,
                sessionId: sessionId,
                url: window.location.href,
                referrer: document.referrer || '',
                screenWidth: window.screen.width,
                eventType: 'pageview', // Default to pageview if not overridden
                pageTitle: document.title,
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
             console.log("Sentinel: 🚨 Caught Runtime Error:", e.message);
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
            console.log("Sentinel: 🚨 Caught Promise Rejection:", e.reason);
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
        // Note: we use the same sessionId from sessionStorage to keep replays continuous across refreshes
        if (window.rrweb) {
             window.rrweb.record({
                emit(event) {
                    events.push(event);
                    // Optimization: If this is the very first batch (snapshot), send it immediately
                    if (events.length > 2) {
                        flushEvents();
                    }
                },
                checkoutEveryNth: 100, // Enforce snapshots periodically
            });
        } else {
            console.error("Sentinel: rrweb failed to load");
        }

        function flushEvents(isUnload = false) {
             if (events.length > 0) {
                const body = JSON.stringify({ 
                    siteId: siteId, 
                    events: events, 
                    sessionId: sessionId 
                });
                events = []; // Clear buffer
                fetch(sessionEndpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: body,
                    keepalive: isUnload
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

        // --- Spider Trap (Honey Pot) ---
        (function() {
            const trap = document.createElement('a');
            trap.href = `${apiBase}/track/trap?siteId=${siteId}`;
            trap.style.display = 'none';
            trap.setAttribute('aria-hidden', 'true');
            trap.innerText = 'Health Check';
            document.body.appendChild(trap);
        })();

        // --- Heartbeat Tracking ---
        // Send a heartbeat every 15 seconds to track time-on-page accurately
        setInterval(() => {
            if (document.visibilityState === 'visible') {
               track({ eventType: 'heartbeat' });
            }
        }, 15000);
    }
})();