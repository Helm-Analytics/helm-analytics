(function() {
    const scriptTag = document.querySelector('script[data-site-id]');
    if (!scriptTag) {
        console.error('Helm: data-site-id attribute not found on script tag.');
        return;
    }
    
    const siteId = scriptTag.getAttribute('data-site-id');
    
    // Auto-detect API URL from script source (for self-hosters)
    let apiBase = scriptTag.getAttribute('data-api');
    if (!apiBase && scriptTag.src) {
        try {
            const scriptUrl = new URL(scriptTag.src);
            apiBase = `${scriptUrl.protocol}//${scriptUrl.host}`;
        } catch (e) {
            apiBase = 'https://api-sentinel.getmusterup.com';
        }
    } else if (!apiBase) {
        apiBase = 'https://api-sentinel.getmusterup.com';
    }
    
    const apiEndpoint = `${apiBase}/track`;
    const clickEndpoint = `${apiBase}/track/click`;
    const errorEndpoint = `${apiBase}/track/error`;
    const customEventEndpoint = `${apiBase}/track/event`;
    const sessionEndpoint = `${apiBase}/session`;

    // Inject dependencies
    const rrwebScript = document.createElement('script');
    rrwebScript.src = 'https://cdn.jsdelivr.net/npm/rrweb@latest/dist/rrweb.min.js';
    document.head.appendChild(rrwebScript);

    const webVitalsScript = document.createElement('script');
    webVitalsScript.src = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';
    document.head.appendChild(webVitalsScript);

    rrwebScript.onload = function() {
        let events = [];
        let lastUrl = location.href;

        // Generate or retrieve Session ID
        let sessionId = sessionStorage.getItem('helm_session_id');
        if (!sessionId) {
            sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('helm_session_id', sessionId);
        }

        // Track initial page view
        track();

        // Heartbeat - send every 15 seconds to track visit duration
        setInterval(function() {
            track({ eventType: 'heartbeat' });
        }, 15000);

        // Core tracking function
        function track(payload = {}, options = {}) {
            const data = {
                siteId: siteId,
                sessionId: sessionId,
                url: window.location.href,
                referrer: document.referrer || '',
                screenWidth: window.screen.width,
                eventType: 'pageview',
                pageTitle: document.title,
                ...payload
            };

            // console.log('[Helm Tracker] Sending event:', data.eventType, data);

            fetch(apiEndpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).then(response => {
                if (!response.ok) {
                    console.error('[Helm Tracker] Server error:', response.status, response.statusText);
                }
            }).catch(err => console.error('[Helm Tracker] Network error:', err));
        }

        // Custom event tracking - PUBLIC API
        window.helm = window.helm || {};
        window.helm.trackEvent = function(eventName, properties = {}) {
            if (!eventName) {
                console.error('Helm: eventName is required');
                return;
            }

            const data = {
                siteId: siteId,
                eventName: eventName,
                properties: properties,
                url: window.location.href,
                referrer: document.referrer || ''
            };

            // console.log('[Helm Tracker] Custom event:', eventName, properties);

            fetch(customEventEndpoint, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                keepalive: true
            }).then(response => {
                if (!response.ok) {
                    console.error('[Helm Tracker] Custom event server error:', response.status, response.statusText);
                }
            }).catch(err => console.error('Helm event tracking error:', err));
        };

        // Auto-track outbound links
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href) {
                const isOutbound = !link.href.includes(location.hostname);
                const isDownload = /\.(pdf|zip|docx?|xlsx?|pptx?|txt|csv)$/i.test(link.href);

                if (isOutbound) {
                    window.helm.trackEvent('outbound_click', {
                        destination: link.href,
                        text: link.textContent.trim().substring(0, 100)
                    });
                } else if (isDownload) {
                    window.helm.trackEvent('file_download', {
                        filename: link.href.split('/').pop(),
                        url: link.href
                    });
                }
            }
        });

        // Scroll Depth Tracking
        let maxScrollDepth = 0;
        let scrollMilestones = [25, 50, 75, 100];
        let reachedMilestones = new Set();
        
        function trackScrollDepth() {
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            const scrollTop = window.scrollY;
            const scrollPercent = Math.min(100, Math.round((scrollTop + windowHeight) / documentHeight * 100));
            
            if (scrollPercent > maxScrollDepth) {
                maxScrollDepth = scrollPercent;
            }
            
            // Track milestones
            scrollMilestones.forEach(milestone => {
                if (scrollPercent >= milestone && !reachedMilestones.has(milestone)) {
                    reachedMilestones.add(milestone);
                    window.helm.trackEvent('scroll_depth', { depth: milestone, url: window.location.href });
                }
            });
        }
        
        // Throttle scroll events
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(trackScrollDepth, 150);
        });
        
        // Send final scroll depth on page exit
        window.addEventListener('beforeunload', function() {
            if (maxScrollDepth > 0) {
            if (maxScrollDepth > 0) {
                const blob = new Blob([JSON.stringify({
                    siteId,
                    eventName: 'scroll_final',
                    properties: { maxDepth: maxScrollDepth },
                    url: window.location.href,
                    referrer: document.referrer || ''
                })], { type: 'application/json' });
                navigator.sendBeacon(customEventEndpoint, blob);
            }
            }
        });

        // UTM Parameter Auto-Detection and Tracking
        function parseUTMParams() {
            const params = new URLSearchParams(window.location.search);
            const utmParams = {};
            
            // Extract UTM parameters
            ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
                if (params.has(param)) {
                    utmParams[param] = params.get(param);
                }
            });
            
            // Auto-detect channel if UTM params exist
            if (Object.keys(utmParams).length > 0) {
                utmParams.channel = classifyChannel(utmParams);
                
                // Store in session for attribution
                try {
                    sessionStorage.setItem('helm_utm_params', JSON.stringify(utmParams));
                } catch (e) {
                    // Ignore if storage fails
                }
                
                return utmParams;
            }
            
            // Try to retrieve from session
            try {
                const stored = sessionStorage.getItem('helm_utm_params');
                return stored ? JSON.parse(stored) : null;
            } catch (e) {
                return null;
            }
        }
        
        function classifyChannel(utmParams) {
            const medium = (utmParams.utm_medium || '').toLowerCase();
            const source = (utmParams.utm_source || '').toLowerCase();
            
            if (medium === 'cpc' || medium === 'ppc' || medium === 'paid') return 'Paid Search';
            if (medium === 'social' || ['facebook', 'twitter', 'linkedin', 'instagram'].includes(source)) return 'Social';
            if (medium === 'email') return 'Email';
            if (medium === 'display' || medium === 'banner') return 'Display';
            if (medium === 'affiliate') return 'Affiliate';
            if (medium === 'organic') return 'Organic Search';
            
            return 'Other';
        }

        // Track initial pageview with UTM params
        const utmParams = parseUTMParams();
        if (utmParams) {
            track({ 
                utm_source: utmParams.utm_source,
                utm_medium: utmParams.utm_medium,
                utm_campaign: utmParams.utm_campaign,
                utm_term: utmParams.utm_term,
                utm_content: utmParams.utm_content,
                channel: utmParams.channel
            });
        } else {
            track();
        }

        // Track SPA navigation (History API)
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
            originalPushState.apply(this, arguments);
            handleUrlChange();
        };

        history.replaceState = function() {
            originalReplaceState.apply(this, arguments);
            handleUrlChange();
        };

        window.addEventListener('popstate', handleUrlChange);

        function handleUrlChange() {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                // Defer slightly to allow page title to update
                setTimeout(() => track(), 100);
            }
        }

        // Session replay recording
        if (typeof window.rrweb !== 'undefined' && window.rrweb.record) {
            window.rrweb.record({
                emit(event) {
                    // Debug: Log first few events to check for snapshot
                    if (events.length < 5) {
                        console.log('[Sentinel v5] Event type:', event.type, 'Total events:', events.length);
                    }
                    events.push(event);
                    if (events.length > 2) {
                        sendEvents();
                    }
                },
                checkoutEveryNth: 100
            });
        }

        function sendEvents(isUnload = false) {
            if (events.length === 0) return;
            console.log('[Sentinel v5] Sending', events.length, 'events. First event type:', events[0]?.type);
            const body = JSON.stringify({ 
                siteId: siteId,
                sessionId: sessionId, 
                events: events 
            });
            events = [];
            fetch(sessionEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: body,
                keepalive: isUnload
            }).catch(err => console.error('Session replay error:', err));
        }

        setInterval(sendEvents, 5000);
        
        // Flush on exit - match v4 exactly
        const flushOnUnload = () => sendEvents(true);
        window.addEventListener('pagehide', flushOnUnload);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                sendEvents(true);
            }
        });

        // Click heatmap tracking
        document.addEventListener('click', function(e) {
            const x = e.pageX;
            const y = e.pageY;
            const target = e.target.tagName;
            const text = e.target.textContent ? e.target.textContent.substring(0, 50) : '';

            fetch(clickEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siteId,
                    sessionId,
                    url: window.location.href,
                    x, y, target, text
                }),
                keepalive: true
            }).catch(err => console.error('Click tracking error:', err));
        });

        // Error tracking
        window.addEventListener('error', function(event) {
            fetch(errorEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    siteId,
                    sessionId,
                    url: window.location.href,
                    message: event.message,
                    source: event.filename,
                    lineno: event.lineno,
                    colno: event.colno,
                    stack: event.error ? event.error.stack : null
                }),
                keepalive: true
            }).catch(err => console.error('Error tracking failed:', err));
        });

        // Web Vitals tracking - wait for script to load
        webVitalsScript.onload = function() {
            if (window.webVitals) {
                const { onCLS, onFID, onLCP } = window.webVitals;
                
                // Track web vitals with metric name as key (matching backend schema)
                const trackVital = (vital) => {
                    if (vital && vital.name && vital.value !== undefined) {
                        // console.log(`[Helm Tracker] Web Vital ${vital.name}:`, vital.value);
                        track({ 
                            [vital.name]: vital.value,
                            eventType: 'web-vital'
                        });
                    }
                };
                
                onCLS(trackVital);
                onFID(trackVital);
                onLCP(trackVital);
            }
        };
    };

    // Console branding
    console.log('%cHelm Analytics', 'font-size: 16px; font-weight: bold; color: #0ea5e9;');
    console.log('%cPrivacy-first analytics with AI built-in', 'font-size: 12px; color: #64748b;');
    console.log('%cTrack custom events: helm.trackEvent("event_name", { key: "value" })', 'font-size: 11px; color: #94a3b8;');
})();
