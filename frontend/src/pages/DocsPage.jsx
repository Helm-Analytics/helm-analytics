import React from 'react';
import { Book, Terminal, Code, Shield, Activity, Zap, ChevronRight, Copy, Check, BarChart3, Globe, Clock, MousePointerClick } from 'lucide-react';

const DocsPage = () => {
    const [copied, setCopied] = React.useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const metrics = [
        {
            title: "Total Views",
            desc: "The total number of page loads. Includes reloads and internal navigation."
        },
        {
            title: "Unique Visits",
            desc: "Individual sessions identified by a privacy-preserving hash. A user visiting 5 pages counts as 1 visit."
        },
        {
            title: "Bounce Rate",
            desc: "The percentage of visitors who leave after viewing only one page. Lower is generally better."
        },
        {
            title: "Avg. Duration",
            desc: "The average time spent on your site per session. We use a 15s heartbeat for high accuracy."
        }
    ];

    const webVitals = [
        {
            title: "LCP (Largest Contentful Paint)",
            stat: "Loading Speed",
            desc: "How long it takes for the main content to load. < 2.5s is good."
        },
        {
            title: "CLS (Cumulative Layout Shift)",
            stat: "Visual Stability",
            desc: "Measures unexpected layout shifts. < 0.1 is good."
        },
        {
            title: "FID (First Input Delay)",
            stat: "Interactivity",
            desc: "Delay before the browser responds to a click. < 100ms is good."
        }
    ];

    const quickStartCode = `<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="YOUR_SITE_ID"></script>`;
    const spiderTrapCode = `<a href="/track/trap?siteId=YOUR_SITE_ID" style="display:none" aria-hidden="true">Health Check</a>`;

    const integrations = [
        {
            name: "Node.js (Express)",
            icon: Code,
            code: `app.use((req, res, next) => {
  fetch('https://api-sentinel.getmusterup.com/track/server', {
    method: 'POST',
    body: JSON.stringify({
      siteId: 'YOUR_SITE_ID',
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }),
    headers: { 'Content-Type': 'application/json' }
  }).catch(() => {});
  next();
});`
        },
        {
            name: "Python (Flask)",
            icon: Code,
            code: `@app.before_request
def helm_track():
    payload = {
        "siteId": "YOUR_SITE_ID",
        "url": request.url,
        "ip": request.remote_addr,
        "userAgent": request.headers.get('User-Agent'),
    }
    threading.Thread(target=lambda: requests.post("https://api-sentinel.getmusterup.com/track/server", json=payload)).start()`
        }
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-8">
                <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-2xl mb-2">
                    <Book className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-5xl font-heading font-extrabold text-foreground tracking-tight">Helm Knowledge Base</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Everything you need to master <strong>Helm Analytics</strong>. From integration to advanced security and AI-driven insights.
                </p>
            </div>

            {/* Get Started Guide */}
            <div className="space-y-12">
                <h2 className="text-3xl font-heading font-extrabold text-foreground text-center">Get Started in 60 Seconds</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[15%] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-accent/0 via-accent/30 to-accent/0 border-t border-dashed border-accent/50 z-0"></div>

                    {/* Step 1 */}
                    <div className="premium-card relative bg-[#0F172A] z-10 shadow-2xl hover:scale-105 transition-transform duration-300">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-accent/20 rotate-3 border border-white/20 ring-4 ring-background">1</div>
                        <h3 className="text-xl font-bold text-white mb-3 mt-4">Add Site</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Click the <span className="bg-accent/20 text-accent px-1.5 rounded font-bold">+</span> button in the sidebar. Enter your website's domain name to generate your unique tracking ID.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="premium-card relative bg-[#0F172A] z-10 shadow-2xl hover:scale-105 transition-transform duration-300">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-accent/20 rotate-3 border border-white/20 ring-4 ring-background">2</div>
                        <h3 className="text-xl font-bold text-white mb-3 mt-4">Install Script</h3>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            Copy this snippet into the <code className="bg-white/10 px-1 rounded text-accent">&lt;head&gt;</code> of your website.
                        </p>
                        <div className="relative group">
                            <div className="bg-black/50 rounded-lg p-3 font-mono text-[10px] text-emerald-400 border border-white/10 overflow-x-auto">
                                <pre>{quickStartCode}</pre>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(quickStartCode, 'quickstart')}
                                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-md transition-colors border border-white/5"
                            >
                                {copied === 'quickstart' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-white" />}
                            </button>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="premium-card relative bg-[#0F172A] z-10 shadow-2xl hover:scale-105 transition-transform duration-300">
                        <div className="absolute -top-4 -left-4 w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-accent/20 rotate-3 border border-white/20 ring-4 ring-background">3</div>
                         <h3 className="text-xl font-bold text-white mb-3 mt-4">Deploy & Live</h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Deploy your changes to production. Visit your site to trigger the first event. Your dashboard will light up with real-time data instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="space-y-6">
                <h2 className="text-3xl font-heading font-extrabold text-foreground">Understanding Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((m, i) => (
                        <div key={i} className="premium-card p-6 space-y-3">
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wide">{m.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Deep Dive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Intelligence */}
                <div className="premium-card space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                        <h2 className="text-xl font-heading font-extrabold text-foreground">Helm Intelligence AI</h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Our AI engine analyzes your traffic patterns every 10 minutes to identify anomalies, growth opportunities, and technical issues.
                    </p>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                            <span><strong>Anomaly Detection:</strong> Sudden spikes or drops in traffic.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                            <span><strong>Conversion Insights:</strong> Why users are dropping off.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-accent mt-0.5" />
                            <span><strong>Smart Caching:</strong> Reports are cached for 15 mins to save resources. Use the refresh button for instant updates.</span>
                        </li>
                    </ul>
                </div>

                {/* Web Vitals */}
                <div className="premium-card space-y-6">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-heading font-extrabold text-foreground">Core Web Vitals</h2>
                    </div>
                    <div className="space-y-4">
                        {webVitals.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg border border-border/50">
                                <div>
                                    <div className="font-bold text-foreground text-sm">{v.title}</div>
                                    <div className="text-xs text-muted-foreground">{v.desc}</div>
                                </div>
                                <div className="text-xs font-bold text-accent px-2 py-1 bg-accent/10 rounded uppercase tracking-wider whitespace-nowrap">
                                    {v.stat}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* Security Section */}
             <div className="premium-card bg-slate-900 border-none space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8">
                     <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-500/20 rounded-lg">
                                <Shield className="w-5 h-5 text-rose-500" />
                            </div>
                            <h2 className="text-xl font-heading font-extrabold text-white">Advanced Security Suite</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Helm includes enterprise-grade protection features out of the box.
                        </p>
                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="text-white font-bold mb-1">Shield Mode</h4>
                                <p className="text-xs text-slate-400">Automatically blocks traffic from known data centers (AWS, GCP, Azure) and bad bot user-agents.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                <h4 className="text-white font-bold mb-1">Spider Trap 🕸️</h4>
                                <p className="text-xs text-slate-400">A hidden link that only bots see. If accessed, the visitor's IP is permanently banned.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="p-4 bg-black/40 rounded-t-xl border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Spider Trap Implementation</span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                            </div>
                        </div>
                        <div className="flex-1 bg-black/60 p-6 font-mono text-xs text-rose-300 border-x border-b border-white/10 rounded-b-xl overflow-x-auto relative">
                             <pre>{spiderTrapCode}</pre>
                             <button 
                                onClick={() => copyToClipboard(spiderTrapCode, 'trap')}
                                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                {copied === 'trap' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-white" />}
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-4 italic">
                            Place this link anywhere in your HTML body. It is hidden with CSS so real users won't click it.
                        </p>
                    </div>
                </div>
            </div>

            {/* Server Side Integration */}
            <div className="space-y-6">
                 <h2 className="text-2xl font-heading font-extrabold text-foreground">Server-Side Tracking</h2>
                 <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed mb-6">
                    For mission-critical analytics, track events directly from your backend.
                    <br />
                    <span className="text-accent font-bold text-xs uppercase tracking-wide bg-accent/10 px-2 py-1 rounded-full mt-2 inline-block">
                        Coming Soon: Official NPM & PyPI Packages
                    </span>
                 </p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {integrations.map((int, idx) => (
                        <div key={idx} className="premium-card p-0 overflow-hidden">
                             <div className="bg-secondary/30 p-4 border-b border-border/50 flex items-center justify-between">
                                <span className="font-bold text-sm flex items-center gap-2">
                                    <Terminal className="w-4 h-4 text-accent" />
                                    {int.name}
                                </span>
                                <button 
                                    onClick={() => copyToClipboard(int.code, `int-${idx}`)}
                                    className="p-1.5 hover:bg-secondary rounded transition-colors"
                                >
                                    {copied === `int-${idx}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                                </button>
                             </div>
                             <div className="p-4 bg-slate-950 overflow-x-auto">
                                <pre className="text-[11px] font-mono text-slate-300">{int.code}</pre>
                             </div>
                        </div>
                    ))}
                 </div>
            </div>

             {/* Footer FAQ-style mini tips */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/50">
                <div className="flex gap-4">
                    <Activity className="w-8 h-8 text-accent shrink-0" />
                    <div>
                         <h4 className="font-bold text-foreground mb-1">Real-time Heartbeat</h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">The tracker sends a heartbeat every 15 seconds to ensure 'Time on Page' metrics are 100% accurate even if the user closes the tab.</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Shield className="w-8 h-8 text-accent shrink-0" />
                    <div>
                         <h4 className="font-bold text-foreground mb-1">Privacy First</h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">Helm is cookieless. We use privacy-compliant session hashes that expire naturally, ensuring GDPR and CCPA compliance by default.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Missing Imports
function CheckCircle2(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    )
}

export default DocsPage;
