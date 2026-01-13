const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

class HelmAnalytics {
  constructor(options = {}) {
    this.siteId = options.siteId || process.env.HELM_SITE_ID;
    this.apiUrl = (options.apiUrl || 'https://api.helm-analytics.com').replace(/\/$/, '').replace(/\/track$/, '');
    
    if (!this.siteId) {
      console.warn('HelmAnalytics: No Site ID provided. Tracking will be disabled.');
    }
  }

  // Check if request should be blocked
  async checkShield(payload) {
    if (!this.siteId) return { allowed: true };

    try {
        const checkPayload = {
            siteId: payload.siteId,
            ip: payload.clientIp,
            userAgent: payload.userAgent,
            url: payload.url
        };

        const res = await fetch(`${this.apiUrl}/api/shield/decision`, {
            method: 'POST',
            body: JSON.stringify(checkPayload),
            headers: { 'Content-Type': 'application/json' }
        });

        if (res.ok) {
            const decision = await res.json();
            if (decision.action === 'block') {
                return { allowed: false, reason: decision.reason };
            }
        }
    } catch (err) {
        // Fail open
        console.error('Helm Shield Error:', err);
    }
    return { allowed: true };
  }

  // Generic track method
  async track(req, eventType = 'pageview', metadata = {}, shield = false) {
    if (!this.siteId) return true;

    try {
      const payload = {
        siteId: this.siteId,
        sessionId: req.headers['x-helm-session-id'] || req.sessionId || '', // Support session stitching
        url: req.originalUrl || req.url,
        userAgent: req.headers['user-agent'] || '',
        referrer: req.headers['referer'] || req.headers['referrer'] || '',
        // ClientIP logic: Headers or socket
        clientIp: req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : (req.socket ? req.socket.remoteAddress : ''),
        eventType: eventType,
        isServerSide: true,
        ...metadata
      };

      // Shield Checking (Blocking)
      if (shield) {
        const { allowed, reason } = await this.checkShield(payload);
        if (!allowed) {
            console.warn(`[Helm Shield] Blocked IP: ${payload.clientIp} Reason: ${reason}`);
            return false;
        }
      }

      // Fire and forget
      fetch(`${this.apiUrl}/track`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => {});

      return true;

    } catch (err) {
      return true; // Fail open
    }
  }

  // Custom event tracking
  async trackEvent(req, eventName, properties = {}) {
    if (!this.siteId) return true;

    try {
      const payload = {
        siteId: this.siteId,
        sessionId: req.headers['x-helm-session-id'] || req.sessionId || '',
        eventName: eventName,
        properties: properties,
        url: req.originalUrl || req.url,
        referrer: req.headers['referer'] || req.headers['referrer'] || '',
        isServerSide: true
      };

      fetch(`${this.apiUrl}/track/event`, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' }
      }).catch(err => {});

      return true;
    } catch (err) {
      return true;
    }
  }

  // Express Middleware
  middleware(options = {}) {
    const shield = options.shield || false;
    
    return async (req, res, next) => {
      const allowed = await this.track(req, 'pageview', {}, shield);
      if (!allowed) {
        return res.status(403).send('Forbidden by Helm Aegis');
      }
      next();
    };
  }
}

module.exports = HelmAnalytics;
