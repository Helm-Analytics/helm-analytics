import { useState } from 'react';
import { Book, Code, Shield, BarChart3, Activity, Zap, Globe, CheckCircle, ExternalLink, Copy, Check } from 'lucide-react';

const DocsPage = () => {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const sections = [
    {
      id: 'quick-start',
      icon: Zap,
      title: 'Quick Start',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">Get started with Helm Analytics in under 5 minutes.</p>
          
          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">1. Get Your Site ID</h4>
            <p className="text-sm text-muted-foreground">
              Go to your dashboard and create a new site. Copy your unique Site ID.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2 flex items-center justify-between">
              2. Add the Tracking Script
              <button
                onClick={() => copyToClipboard(`<script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" data-site-id="YOUR_SITE_ID"></script>`, 'install')}
                className="p-2 hover:bg-secondary rounded"
              >
                {copied === 'install' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mt-2">
              <code>{`<script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" 
        data-site-id="YOUR_SITE_ID">
</script>`}</code>
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Add this just before the closing <code className="text-accent">&lt;/body&gt;</code> tag.
            </p>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">3. Start Tracking</h4>
            <p className="text-sm text-muted-foreground">
              That's it! Helm will automatically track pageviews, errors, and performance metrics.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      icon: BarChart3,
      title: 'Core Features',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Analytics Dashboard
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground ml-7">
              <li>• Real-time visitor tracking</li>
              <li>• Pageviews, unique visitors, bounce rate</li>
              <li>• Traffic sources, referrers, countries</li>
              <li>• Device, browser, and OS breakdowns</li>
              <li>• Custom date ranges</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Session Replay
            </h4>
            <p className="text-sm text-muted-foreground ml-7">
              Watch recordings of user sessions to understand behavior and identify UX issues.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Heatmaps
            </h4>
            <p className="text-sm text-muted-foreground ml-7">
              See exactly where users click on your pages. Identify high-engagement areas.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Error Tracking
            </h4>
            <p className="text-sm text-muted-foreground ml-7">
              Automatically catch JavaScript errors before users report them. Includes stack traces.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Funnels & Goals
            </h4>
            <p className="text-sm text-muted-foreground ml-7">
              Track multi-step conversions. Identify where users drop off in your funnel.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'custom-events',
      icon: Activity,
      title: 'Custom Events',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Track any user action beyond pageviews with custom events.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">Basic Event</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{`helm.trackEvent('button_clicked', { 
  location: 'header',
  text: 'Sign Up' 
});`}</code>
            </pre>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">E-Commerce</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{`helm.trackEvent('purchase', {
  order_id: 'ORD-123',
  amount: 99.99,
  currency: 'USD',
  product_id: 'prod_456'
});`}</code>
            </pre>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h4 className="font-bold mb-2">Auto-Tracked Events</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• <code className="text-accent">outbound_click</code> - External link clicks</li>
              <li>• <code className="text-accent">file_download</code> - PDF, ZIP, DOCX downloads</li>
              <li>• <code className="text-accent">scroll_depth</code> - 25%, 50%, 75%, 100% milestones</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security Features',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold mb-2">Bot Detection</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Every visitor gets a Trust Score (0-100) based on behavior, IP reputation, and browser fingerprint.
            </p>
            <div className="bg-secondary/50 rounded-lg p-3 text-sm">
              <p className="font-medium">Score Ranges:</p>
              <ul className="space-y-1 mt-2 text-muted-foreground">
                <li>• 80-100: Trusted Human</li>
                <li>• 50-79: Likely Human</li>
                <li>• 0-49: Likely Bot</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-2">Firewall</h4>
            <p className="text-sm text-muted-foreground">
              Block traffic by IP address, country, or data center (ASN). Perfect for stopping scrapers and click fraud.
            </p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h4 className="font-bold mb-2">⚡ Shield Mode (Pro/Cloud)</h4>
            <p className="text-sm text-muted-foreground">
              Automatically block bad traffic at the server level before it reaches your site. Saves bandwidth and server costs.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'sdk',
      icon: Code,
      title: 'Server-Side SDKs',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Track events from your backend to bypass ad-blockers.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">Node.js</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mb-2">
              <code>{`npm install helm-analytics`}</code>
            </pre>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{`const helm = require('helm-analytics');

const analytics = new helm.HelmAnalytics({
  siteId: 'YOUR_SITE_ID',
  apiUrl: 'https://api-sentinel.getmusterup.com'
});

app.use(analytics.middleware());`}</code>
            </pre>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">Python</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mb-2">
              <code>{`pip install helm-analytics`}</code>
            </pre>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{`from helm_analytics import HelmAnalytics

helm = HelmAnalytics(
    site_id="YOUR_SITE_ID",
    api_url="https://api-sentinel.getmusterup.com"
)

app.before_request(helm.flask_middleware())`}</code>
            </pre>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">Go</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto mb-2">
              <code>{`go get github.com/helm-analytics/helm-go`}</code>
            </pre>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{`import "github.com/helm-analytics/helm-go"

analytics := helm.New(helm.Config{
    SiteID: "YOUR_SITE_ID",
    APIURL: "https://api-sentinel.getmusterup.com",
})

http.ListenAndServe(":80", analytics.Middleware(mux))`}</code>
            </pre>
          </div>
        </div>
      )
    },
    {
      id: 'self-host',
      icon: Globe,
      title: 'Self-Hosting',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Deploy Helm on your own infrastructure with Docker.
          </p>

          <div className="bg-secondary/50 rounded-lg p-4">
            <h4 className="font-bold mb-2">Quick Deploy</h4>
            <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
              <code>{`git clone https://github.com/helm-analytics/helm.git
cd helm
cp .env.example .env
docker-compose up -d`}</code>
            </pre>
            <p className="text-sm text-muted-foreground mt-2">
              Access at <code className="text-accent">http://localhost:3000</code>
            </p>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h4 className="font-bold mb-2">Pro License</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Unlock premium features for self-hosted instances:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• AI Consultant (page analysis)</li>
              <li>• Shield Auto-Block</li>
              <li>• White-label branding</li>
              <li>• Priority support</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-3">
              <strong>$199/year</strong> · <a href="https://helm.io/pricing" className="text-accent hover:underline">Get License →</a>
            </p>
          </div>
        </div>
      )
    }
  ];

  const [activeSection, setActiveSection] = useState('quick-start');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Helm Analytics Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Privacy-first analytics with AI and security built-in
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="md:col-span-1">
          <nav className="sticky top-6 space-y-1">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary text-muted-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{section.title}</span>
                </button>
              );
            })}

            <a
              href="https://helm.io"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left hover:bg-secondary text-muted-foreground transition-colors mt-4"
            >
              <ExternalLink className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium">helm.io</span>
            </a>
          </nav>
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          <div className="bg-card border border-border rounded-xl p-8">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  className={activeSection === section.id ? 'block' : 'hidden'}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Icon className="w-6 h-6 text-accent" />
                    </div>
                    <h2 className="text-3xl font-bold">{section.title}</h2>
                  </div>
                  {section.content}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="mt-6 p-6 bg-accent/5 border border-accent/20 rounded-xl">
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Join our Discord community or email us at support@helm.io
            </p>
            <div className="flex gap-3">
              <a
                href="https://discord.gg/helm"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 text-sm font-medium"
              >
                Discord
              </a>
              <a
                href="mailto:support@helm.io"
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm font-medium"
              >
                Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
