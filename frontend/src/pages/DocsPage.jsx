import { useState } from 'react';
import { Copy, Check, Code, Zap, BookOpen, Rocket } from 'lucide-react';

export default function DocsPage() {
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('quickstart');

  const copyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 2000);
  };

  const CopyButton = ({ text, id }) => (
    <button
      onClick={() => copyCode(text, id)}
      className="absolute top-3 right-3 p-2 bg-card hover:bg-secondary rounded-lg transition-colors border border-border"
    >
      {copied === id ? (
        <Check className="w-4 h-4 text-green-500" />
      ) : (
        <Copy className="w-4 h-4 text-muted-foreground" />
      )}
    </button>
  );

  const installSnippet = `<!-- Add this before </head> -->
<script 
  defer 
  data-site-id="YOUR_SITE_ID" 
  src="https://api-sentinel.getmusterup.com/static/tracker-v5.js">
</script>`;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3">
            Helm Documentation
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Privacy-first analytics with AI-powered insights. Get started in under 5 minutes.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab('quickstart')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'quickstart'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Rocket className="w-4 h-4 inline mr-2" />
            Quick Start
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'events'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Zap className="w-4 h-4 inline mr-2" />
            Track Events
          </button>
          <button
            onClick={() => setActiveTab('frameworks')}
            className={`px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'frameworks'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Code className="w-4 h-4 inline mr-2" />
            Frameworks
          </button>
        </div>

        {/* Quick Start Tab */}
        {activeTab === 'quickstart' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Follow these steps to add Helm Analytics to your website.
              </p>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">Get your Site ID</h3>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        Go to your dashboard → Sites → Click your website name → Copy the Site ID.
                      </p>
                      <div className="bg-secondary border border-border rounded-lg p-4">
                        <code className="text-sm text-accent">e.g., e3d3d060-dc0d-4301-894a-5994f65e2216</code>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">Add the tracking script</h3>
                      <p className="text-muted-foreground mb-3 leading-relaxed">
                        Paste this snippet in your website's <code className="text-sm bg-secondary px-1.5 py-0.5 rounded">&lt;head&gt;</code> section. Replace <code className="text-sm bg-secondary px-1.5 py-0.5 rounded">YOUR_SITE_ID</code> with your actual Site ID.
                      </p>
                      <div className="relative">
                        <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
                          {installSnippet}
                        </pre>
                        <CopyButton text={installSnippet} id="install" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold mb-2">You're done!</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Helm is now tracking pageviews, scroll depth, outbound clicks, and file downloads automatically. Visit your dashboard to see your analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Self-Hosting Note */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
              <h4 className="font-bold mb-2 text-blue-400">Self-Hosting?</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                If you're self-hosting, use your own API URL in the script src instead of <code className="bg-secondary px-1.5 py-0.5 rounded">https://api-sentinel.getmusterup.com</code>
              </p>
            </div>
          </div>
        )}

        {/* Track Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Track Custom Events</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Track user actions beyond pageviews. Choose between simple HTML attributes or JavaScript for dynamic data.
              </p>

              {/* Method 1: Data Attributes */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-500/20 text-green-400 rounded flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                  Simple: HTML Data Attributes
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  No JavaScript required! Just add a data attribute to any button or link.
                </p>
                
                <div className="relative mb-4">
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`<!-- Track button clicks -->
<button data-helm-event="signup_button">
  Sign Up
</button>

<!-- Track with properties -->
<a 
  href="/pricing" 
  data-helm-event="view_pricing" 
  data-helm-props='{"plan":"pro"}'>
  View Pricing
</a>`}
                  </pre>
                  <CopyButton 
                    text={`<!-- Track button clicks -->\n<button data-helm-event="signup_button">\n  Sign Up\n</button>\n\n<!-- Track with properties -->\n<a \n  href="/pricing" \n  data-helm-event="view_pricing" \n  data-helm-props='{"plan":"pro"}'>\n  View Pricing\n</a>`} 
                    id="data-attr" 
                  />
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-amber-400">Coming Soon:</strong> Data attribute tracking will be available in the next release. For now, use the JavaScript method below.
                  </p>
                </div>
              </div>

              {/* Method 2: JavaScript */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent/20 text-accent rounded flex items-center justify-center text-sm font-bold">
                    JS
                  </div>
                  Advanced: JavaScript API
                </h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  For dynamic data or programmatic tracking. Perfect for single-page apps and complex user flows.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold mb-2 text-sm">Basic Event</h4>
                    <div className="relative">
                      <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`helm.trackEvent('button_clicked');`}
                      </pre>
                      <CopyButton text="helm.trackEvent('button_clicked');" id="js-basic" />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-sm">Event with Properties</h4>
                    <div className="relative">
                      <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`helm.trackEvent('purchase', {
  amount: 99.99,
  product_id: '12345',
  currency: 'USD'
});`}
                      </pre>
                      <CopyButton 
                        text={`helm.trackEvent('purchase', {\n  amount: 99.99,\n  product_id: '12345',\n  currency: 'USD'\n});`} 
                        id="js-props" 
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-2 text-sm">In a Button Click</h4>
                    <div className="relative">
                      <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`<button onclick="helm.trackEvent('newsletter_signup')">
  Subscribe
</button>`}
                      </pre>
                      <CopyButton 
                        text={`<button onclick="helm.trackEvent('newsletter_signup')">\n  Subscribe\n</button>`} 
                        id="js-onclick" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Auto-Tracked Events */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">Auto-Tracked Events</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  These events are tracked automatically — no configuration needed:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-secondary border border-border rounded-lg p-3">
                    <code className="text-sm font-mono text-accent">scroll_depth</code>
                    <p className="text-xs text-muted-foreground mt-1">25%, 50%, 75%, 100%</p>
                  </div>
                  <div className="bg-secondary border border-border rounded-lg p-3">
                    <code className="text-sm font-mono text-accent">outbound_click</code>
                    <p className="text-xs text-muted-foreground mt-1">External links</p>
                  </div>
                  <div className="bg-secondary border border-border rounded-lg p-3">
                    <code className="text-sm font-mono text-accent">file_download</code>
                    <p className="text-xs text-muted-foreground mt-1">PDFs, ZIPs, etc.</p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Frameworks Tab */}
        {activeTab === 'frameworks' && (
          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">Framework Guides</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Integration examples for popular frameworks.
              </p>

              {/* React */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">React</h3>
                <div className="relative">
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`import { useEffect } from 'react';

function SignupButton() {
  const handleClick = () => {
    // Track the event
    helm.trackEvent('signup_clicked', {
      page: window.location.pathname
    });
  };

  return (
    <button onClick={handleClick}>
      Sign Up
    </button>
  );
}`}
                  </pre>
                  <CopyButton 
                    text={`import { useEffect } from 'react';\n\nfunction SignupButton() {\n  const handleClick = () => {\n    // Track the event\n    helm.trackEvent('signup_clicked', {\n      page: window.location.pathname\n    });\n  };\n\n  return (\n    <button onClick={handleClick}>\n      Sign Up\n    </button>\n  );\n}`} 
                    id="react" 
                  />
                </div>
              </div>

              {/* Next.js */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-3">Next.js</h3>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  Add the script to <code className="text-sm bg-secondary px-1.5 py-0.5 rounded">pages/_document.js</code>:
                </p>
                <div className="relative">
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
        <script 
          defer 
          data-site-id="YOUR_SITE_ID" 
          src="https://api-sentinel.getmusterup.com/static/tracker-v5.js"
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}`}
                  </pre>
                  <CopyButton 
                    text={`import { Html, Head, Main, NextScript } from 'next/document'\n\nexport default function Document() {\n  return (\n    <Html>\n      <Head>\n        <script \n          defer \n          data-site-id="YOUR_SITE_ID" \n          src="https://api-sentinel.getmusterup.com/static/tracker-v5.js"\n        />\n      </Head>\n      <body>\n        <Main />\n        <NextScript />\n      </body>\n    </Html>\n  )\n}`} 
                    id="nextjs" 
                  />
                </div>
              </div>

              {/* Vue */}
              <div>
                <h3 className="text-xl font-bold mb-3">Vue</h3>
                <p className="text-muted-foreground mb-3 leading-relaxed">
                  Add to <code className="text-sm bg-secondary px-1.5 py-0.5 rounded">public/index.html</code>:
                </p>
                <div className="relative">
                  <pre className="bg-secondary text-foreground p-4 rounded-lg overflow-x-auto text-sm font-mono border border-border">
{`<!DOCTYPE html>
<html>
  <head>
    <script 
      defer 
      data-site-id="YOUR_SITE_ID" 
      src="https://api-sentinel.getmusterup.com/static/tracker-v5.js">
    </script>
  </head>
  <body>
    <div id="app"></div>
  </body>
</html>`}
                  </pre>
                  <CopyButton 
                    text={`<!DOCTYPE html>\n<html>\n  <head>\n    <script \n      defer \n      data-site-id="YOUR_SITE_ID" \n      src="https://api-sentinel.getmusterup.com/static/tracker-v5.js">\n    </script>\n  </head>\n  <body>\n    <div id="app"></div>\n  </body>\n</html>`} 
                    id="vue" 
                  />
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
