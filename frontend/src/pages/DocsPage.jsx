import { useState } from 'react';
import { Zap, Code, Shield, Server, Book, ExternalLink, Copy, Check, ChevronRight, Activity, Globe, Eye, Lock } from 'lucide-react';

export default function DocsPage() {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('quick-start');

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sections = [
    { id: 'quick-start', label: 'Quick Start', icon: Zap },
    { id: 'about', label: 'About Helm', icon: Activity },
    { id: 'features', label: 'Core Features', icon: Eye },
    { id: 'custom-events', label: 'Custom Events', icon: Code },
    { id: 'security', label: 'Security Features', icon: Shield },
    { id: 'server-sdks', label: 'Server SDKs', icon: Server },
    { id: 'self-hosting', label: 'Self-Hosting', icon: Server },
  ];

  const siteId = "your-site-id";
  const trackingScript = `<script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" 
  data-site-id="${siteId}"></script>`;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Book className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Helm Analytics <span className="text-accent">Documentation</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Privacy-first web analytics with AI-powered insights and built-in security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-2 bg-card rounded-lg border border-border p-4">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Contents</h3>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                    {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Quick Start */}
            {activeSection === 'quick-start' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-6 h-6" />
                    <h2 className="text-3xl font-bold">Quick Start</h2>
                  </div>
                  <p className="opacity-90">Get started with Helm Analytics in under 5 minutes.</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">1</span>
                    Get Your Site ID
                  </h3>
                  <p className="text-muted-foreground mb-4">Go to your dashboard and create a new site. Copy your unique Site ID.</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">2</span>
                    Add the Tracking Script
                  </h3>
                  <p className="text-muted-foreground mb-4">Add this just before the closing <code className="px-2 py-1 bg-secondary rounded text-sm">&lt;/body&gt;</code> tag:</p>
                  <div className="relative">
                    <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
                      {trackingScript}
                    </pre>
                    <button
                      onClick={() => copyCode(trackingScript)}
                      className="absolute top-3 right-3 p-2 bg-card hover:bg-secondary rounded-md transition-colors border border-border"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
                    </button>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-accent-foreground text-sm font-bold">3</span>
                    Start Tracking
                  </h3>
                  <p className="text-muted-foreground">That's it! Helm will automatically track pageviews, errors, performance metrics, and user behavior.</p>
                </div>
              </div>
            )}

            {/* About Helm */}
            {activeSection === 'about' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">What is Helm Analytics?</h2>
                  <p className="text-lg opacity-90">
                    Helm is a privacy-first, open-source analytics platform that gives you complete control over your website data while providing powerful insights powered by AI.
                  </p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-2xl font-bold mb-4">Why Helm?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Lock className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Privacy-First</h4>
                        <p className="text-muted-foreground text-sm">No cookies, fully GDPR/CCPA compliant, complete data ownership</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Real-Time Insights</h4>
                        <p className="text-muted-foreground text-sm">See visitor activity as it happens with live dashboards</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Built-in Security</h4>
                        <p className="text-muted-foreground text-sm">Bot detection, firewall rules, and threat monitoring included</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-bold mb-1">Open Source</h4>
                        <p className="text-muted-foreground text-sm">Transparent, self-hostable, community-driven development</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-2xl font-bold mb-4">Use Cases</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      E-commerce conversion tracking and optimization
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      SaaS product analytics and user behavior insights
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Content website performance monitoring
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Security monitoring and bot prevention
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Features */}
            {activeSection === 'features' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">Core Features</h2>
                  <p className="opacity-90">Everything you need to understand and protect your website</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Real-time Dashboard', desc: 'Monitor visitors as they browse', icon: Activity },
                    { title: 'Session Replay', desc: 'Watch user sessions anonymously', icon: Eye },
                    { title: 'Heatmaps', desc: 'Visualize clicks and engagement', icon: Activity },
                    { title: 'Error Tracking', desc: 'Catch and fix JavaScript errors', icon: Activity },
                    { title: 'Funnels', desc: 'Track conversion rates and drop-offs', icon: Activity },
                    { title: 'Web Vitals', desc: 'Monitor Core Web Vitals (LCP, FID, CLS)', icon: Activity },
                    { title: 'Bot Detection', desc: 'Identify and block malicious traffic', icon: Shield },
                    { title: 'Firewall', desc: 'Create custom blocking rules', icon: Shield },
                  ].map((feature, idx) => (
                    <div key={idx} className="bg-card rounded-lg border border-border p-6 hover:border-accent/50 transition-all">
                      <feature.icon className="w-10 h-10 text-accent mb-4" />
                      <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Events */}
            {activeSection === 'custom-events' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">Custom Events</h2>
                  <p className="opacity-90">Track any user action with custom events</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">Basic Event Tracking</h3>
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border mb-4">
{`// Track a button click
helm.trackEvent('button_clicked', {
  location: 'header',
  text: 'Sign Up'
});`}
                  </pre>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">E-commerce Tracking</h3>
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`// Track purchases
helm.trackEvent('purchase', {
  amount: 99.99,
  product: 'Pro License',
  category: 'subscription'
});`}
                  </pre>
                </div>
              </div>
            )}

            {/* Security */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">Security Features</h2>
                  <p className="opacity-90">Protect your site from bots and malicious traffic</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">Bot Detection</h3>
                  <p className="text-muted-foreground mb-4">Helm automatically detects and flags:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Known bot user agents
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Data center IPs
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Headless browsers
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Suspicious traffic patterns
                    </li>
                  </ul>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">Firewall Rules</h3>
                  <p className="text-muted-foreground">Block traffic by IP address, country, or ASN (data center) through the Security dashboard.</p>
                </div>
              </div>
            )}

            {/* Server SDKs */}
            {activeSection === 'server-sdks' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">Server-Side SDKs</h2>
                  <p className="opacity-90">Track events from your backend with official SDKs</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="w-6 h-6 text-accent" />
                    Node.js SDK
                  </h3>
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`const Helm = require('@helm-analytics/node');

const helm = new Helm({
  siteId: 'your-site-id',
  apiUrl: 'https://api.helm.io'
});

// Track an event
helm.track({
  event: 'purchase',
  properties: {
    amount: 99.99,
    product: 'Pro License'
  }
});`}
                  </pre>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="w-6 h-6 text-accent" />
                    Python SDK
                  </h3>
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`from helm_analytics import Helm

helm = Helm(
    site_id='your-site-id',
    api_url='https://api.helm.io'
)

# Track an event
helm.track(
    event='purchase',
    properties={
        'amount': 99.99,
        'product': 'Pro License'
    }
)`}
                  </pre>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Server className="w-6 h-6 text-accent" />
                    Go SDK
                  </h3>
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`package main

import "github.com/helm-analytics/helm-go"

func main() {
    client := helm.New(helm.Config{
        SiteID: "your-site-id",
        APIUrl: "https://api.helm.io",
    })

    // Track an event
    client.Track(helm.Event{
        Name: "purchase",
        Properties: map[string]interface{}{
            "amount":  99.99,
            "product": "Pro License",
        },
    })
}`}
                  </pre>
                </div>
              </div>
            )}

            {/* Self-Hosting */}
            {activeSection === 'self-hosting' && (
              <div className="space-y-6">
                <div className="bg-accent text-accent-foreground rounded-lg p-8">
                  <h2 className="text-3xl font-bold mb-4">Self-Hosting</h2>
                  <p className="opacity-90">Run Helm on your own infrastructure</p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">Docker Compose (Recommended)</h3>
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border mb-4">
{`git clone https://github.com/Helm-Analytics/sentinel-mvp.git
cd sentinel-mvp
docker-compose up -d`}
                  </pre>
                  <p className="text-muted-foreground">Access the dashboard at <code className="px-2 py-1 bg-secondary rounded text-sm">http://localhost:3000</code></p>
                </div>

                <div className="bg-card rounded-lg border border-border p-6">
                  <h3 className="text-xl font-bold mb-4">Requirements</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      Docker & Docker Compose
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      PostgreSQL (included in docker-compose)
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-accent" />
                      ClickHouse (included in docker-compose)
                    </li>
                  </ul>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <ExternalLink className="w-4 h-4 text-accent" />
                  <a href="https://github.com/Helm-Analytics/sentinel-mvp" className="text-accent hover:underline">
                    View on GitHub
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
