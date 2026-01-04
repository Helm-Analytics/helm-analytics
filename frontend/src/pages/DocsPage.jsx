import { useState } from 'react';
import { Zap, Code, Shield, Sparkles, Server, Book, ExternalLink, Copy, Check, ChevronRight } from 'lucide-react';

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
    { id: 'core-features', label: 'Core Features', icon: Sparkles },
    { id: 'custom-events', label: 'Custom Events', icon: Code },
    { id: 'security', label: 'Security Features', icon: Shield },
    { id: 'sdks', label: 'SDKs', icon: Server },
    { id: 'self-hosting', label: 'Self-Hosting', icon: Server },
  ];

  const siteId = "your-site-id";
  const trackingScript = `<script src="https://api.helm.io/static/tracker-v5.js" 
  data-site-id="${siteId}"></script>`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1.5 rounded-full text-sm font-medium mb-4 shadow-lg shadow-blue-500/20">
            <Book className="w-4 h-4" />
            Documentation
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Helm Analytics Documentation
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Privacy-first analytics with AI and security built-in
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">Contents</h3>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                        : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-foreground'
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
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold">Quick Start</h2>
                  </div>
                  <p className="text-blue-100 mb-6">Get started with Helm Analytics in under 5 minutes.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold">1</span>
                    Get Your Site ID
                  </h3>
                  <p className="text-muted-foreground mb-4">Go to your dashboard and create a new site. Copy your unique Site ID.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold">2</span>
                    Add the Tracking Script
                  </h3>
                  <p className="text-muted-foreground mb-4">Add this just before the closing <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm">&lt;/body&gt;</code> tag:</p>
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                      {trackingScript}
                    </pre>
                    <button
                      onClick={() => copyCode(trackingScript)}
                      className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-orange-600 text-white text-sm font-bold">3</span>
                    Start Tracking
                  </h3>
                  <p className="text-muted-foreground">That's it! Helm will automatically track pageviews, errors, and performance metrics.</p>
                </div>
              </div>
            )}

            {/* Core Features */}
            {activeSection === 'core-features' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold">Core Features</h2>
                  </div>
                  <p className="text-purple-100">Everything you need to understand your website's performance.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { title: 'Real-time Dashboard', desc: 'See visitors as they browse your site', color: 'from-blue-500 to-cyan-500' },
                    { title: 'Session Replay', desc: 'Watch recordings of user sessions', color: 'from-purple-500 to-pink-500' },
                    { title: 'Heatmaps', desc: 'Visualize where users click', color: 'from-orange-500 to-red-500' },
                    { title: 'Error Tracking', desc: 'Catch and fix errors fast', color: 'from-green-500 to-emerald-500' },
                    { title: 'Funnels', desc: 'Track conversion rates', color: 'from-indigo-500 to-purple-500' },
                    { title: 'Web Vitals', desc: 'Monitor performance metrics', color: 'from-yellow-500 to-orange-500' },
                  ].map((feature, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center text-white font-bold text-xl mb-4`}>
                        {idx + 1}
                      </div>
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
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Code className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold">Custom Events</h2>
                  </div>
                  <p className="text-green-100">Track any user action with custom events.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">Basic Event Tracking</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4">
                    {`// Track a button click
helm.trackEvent('button_clicked', {
  location: 'header',
  text: 'Sign Up'
});`}
                  </pre>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <h3 className="text-xl font-bold mb-4">E-commerce Tracking</h3>
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
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

            {/* More sections... */}
            {activeSection === 'security' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                <h2 className="text-2xl font-bold mb-2">Security Features</h2>
                <p className="text-muted-foreground">Bot detection, firewall, and more coming soon!</p>
              </div>
            )}

            {activeSection === 'sdks' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 shadow-sm text-center">
                <Server className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h2 className="text-2xl font-bold mb-2">SDKs & Integrations</h2>
                <p className="text-muted-foreground">React, Vue, Angular SDKs coming soon!</p>
              </div>
            )}

            {activeSection === 'self-hosting' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Server className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold">Self-Hosting</h2>
                  </div>
                  <p className="text-indigo-100">Run Helm on your own infrastructure.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                  <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
                    {`git clone https://github.com/helm-analytics/helm.git
cd helm
docker-compose up -d`}
                  </pre>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="w-4 h-4" />
                  <a href="https://github.com/helm-analytics/helm" className="hover:text-blue-600 transition-colors">
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
