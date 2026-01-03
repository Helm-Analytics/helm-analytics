import React, { useState } from 'react';
import { Library, Terminal, Code2, Shield, Activity, BrainCircuit, Copy, Check, BarChart3, Timer, Plus, Fingerprint, Laptop, CheckCircle2 } from 'lucide-react';

const CodeBlock = ({ code, language = 'javascript', label = 'Code' }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative group rounded-xl overflow-hidden border border-white/10 bg-[#0F172A] shadow-md transition-all hover:border-white/20">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
                <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{label}</span>
                <button 
                    onClick={handleCopy}
                    className="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
            </div>
            <div className="p-4 overflow-x-auto custom-scrollbar">
                <pre className="font-mono text-[11px] leading-relaxed text-slate-300 whitespace-pre">{code}</pre>
            </div>
        </div>
    );
};

const DocsPage = () => {
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

    return (
        <div className="max-w-6xl mx-auto space-y-20 animate-in fade-in duration-700 pb-20">
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-12">
                <div className="inline-flex items-center justify-center p-5 bg-accent/10 rounded-3xl mb-4 border border-accent/20 ring-4 ring-accent/5">
                    <Library className="w-12 h-12 text-accent" />
                </div>
                <h1 className="text-5xl md:text-6xl font-heading font-extrabold text-foreground tracking-tight">Helm Knowledge Base</h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                    Everything you need to master <strong>Helm Analytics</strong>. From integration to advanced security and AI-driven insights.
                </p>
            </div>

            {/* Get Started Guide */}
            <div className="space-y-12">
                <h2 className="text-3xl font-heading font-extrabold text-foreground text-center">Get Started in 60 Seconds</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[24px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-border/0 via-border to-border/0 border-t border-dashed border-border z-0 opacity-50"></div>

                    {/* Step 1 */}
                    <div className="premium-card relative bg-[#0F172A] z-10 shadow-2xl hover:scale-105 transition-transform duration-300 border-border/60">
                        <div className="absolute -top-5 -left-5 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-xl shadow-accent/20 rotate-3 border-2 border-white/20 ring-4 ring-background">1</div>
                        <h3 className="text-xl font-bold text-white mb-3 mt-4 flex items-center gap-2">
                           <Laptop className="w-5 h-5 text-accent" />
                           Add Site
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Click the <span className="inline-flex items-center justify-center bg-accent/20 text-accent w-5 h-5 rounded mx-1 align-middle"><Plus className="w-3 h-3" /></span> button in the sidebar. Enter your website's domain name to generate your unique tracking ID.
                        </p>
                    </div>

                    {/* Step 2 */}
                    <div className="premium-card relative bg-[#0F172A] z-10 shadow-2xl hover:scale-105 transition-transform duration-300 border-border/60">
                        <div className="absolute -top-5 -left-5 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-xl shadow-accent/20 rotate-3 border-2 border-white/20 ring-4 ring-background">2</div>
                        <h3 className="text-xl font-bold text-white mb-3 mt-4 flex items-center gap-2">
                            <Code2 className="w-5 h-5 text-accent" />
                            Install Script
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                            Copy this snippet into the <code className="bg-white/10 px-1.5 py-0.5 rounded text-accent font-mono text-xs">&lt;head&gt;</code> of your website.
                        </p>
                        <CodeBlock code={quickStartCode} label="HTML Snippet" />
                    </div>

                    {/* Step 3 */}
                    <div className="premium-card relative bg-[#0F172A] z-10 shadow-2xl hover:scale-105 transition-transform duration-300 border-border/60">
                        <div className="absolute -top-5 -left-5 w-12 h-12 bg-accent rounded-2xl flex items-center justify-center font-black text-white text-xl shadow-xl shadow-accent/20 rotate-3 border-2 border-white/20 ring-4 ring-background">3</div>
                         <h3 className="text-xl font-bold text-white mb-3 mt-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-accent" />
                            Deploy & Live
                        </h3>
                        <p className="text-sm text-slate-400 leading-relaxed">
                            Deploy your changes to production. Visit your site to trigger the first event. Your dashboard will light up with real-time data instantly.
                        </p>
                    </div>
                </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="space-y-8">
                <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                    <BarChart3 className="w-6 h-6 text-accent" />
                    <h2 className="text-3xl font-heading font-extrabold text-foreground">Understanding Metrics</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {metrics.map((m, i) => (
                        <div key={i} className="premium-card p-6 space-y-3 hover:bg-secondary/20 transition-colors">
                            <h3 className="font-bold text-foreground text-sm uppercase tracking-wide flex items-center gap-2">
                                <div className="w-1 h-3 bg-accent rounded-full"></div>
                                {m.title}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">{m.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature Deep Dive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI Intelligence */}
                <div className="premium-card space-y-6">
                    <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                        <div className="p-3 bg-amber-500/10 rounded-2xl">
                            <BrainCircuit className="w-6 h-6 text-amber-500" />
                        </div>
                        <h2 className="text-2xl font-heading font-extrabold text-foreground">Helm Intelligence AI</h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Our AI engine analyzes your traffic patterns every 10 minutes to identify anomalies, growth opportunities, and technical issues.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="mt-1 p-0.5 bg-accent/10 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                            </div>
                            <span><strong className="text-foreground">Anomaly Detection:</strong> Sudden spikes or drops in traffic.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="mt-1 p-0.5 bg-accent/10 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                            </div>
                            <span><strong className="text-foreground">Conversion Insights:</strong> Why users are dropping off.</span>
                        </li>
                        <li className="flex items-start gap-3 text-sm text-muted-foreground">
                            <div className="mt-1 p-0.5 bg-accent/10 rounded-full">
                                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                            </div>
                            <span><strong className="text-foreground">Smart Caching:</strong> Reports are cached for 15 mins to save resources. Use the refresh button for instant updates.</span>
                        </li>
                    </ul>
                </div>

                {/* Web Vitals */}
                <div className="premium-card space-y-6">
                     <div className="flex items-center gap-4 border-b border-border/50 pb-4">
                        <div className="p-3 bg-blue-500/10 rounded-2xl">
                            <Timer className="w-6 h-6 text-blue-500" />
                        </div>
                        <h2 className="text-2xl font-heading font-extrabold text-foreground">Core Web Vitals</h2>
                    </div>
                    <div className="space-y-4">
                        {webVitals.map((v, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors">
                                <div>
                                    <div className="font-bold text-foreground text-sm flex items-center gap-2">
                                        {v.title}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground mt-1">{v.desc}</div>
                                </div>
                                <div className="text-[10px] font-bold text-accent px-2.5 py-1 bg-accent/10 rounded-lg uppercase tracking-wider whitespace-nowrap border border-accent/20">
                                    {v.stat}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             {/* Security Section */}
             <div className="premium-card bg-[#0F172A] border-none space-y-8 relative overflow-hidden ring-1 ring-white/10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl -mr-24 -mt-24 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row gap-12">
                     <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500/20 rounded-2xl">
                                <Fingerprint className="w-6 h-6 text-rose-500" />
                            </div>
                            <h2 className="text-2xl font-heading font-extrabold text-white">Advanced Security Suite</h2>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                            Helm includes enterprise-grade protection features out of the box, ensuring your users and data are safe from automated threats.
                        </p>
                        <div className="space-y-4">
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-rose-400" />
                                    Shield Mode (WAF)
                                </h4>
                                <p className="text-xs text-slate-400 w-full mb-2 leading-relaxed">
                                    Full spectrum protection against <strong className="text-slate-200">XSS, Brute Force, and SQL Injection</strong>.
                                </p>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Automatically blocks traffic from known data centers (AWS/GCP), anonymous proxies, and malicious botnets.
                                </p>
                            </div>
                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                                    Spider Trap 🕸️
                                </h4>
                                <p className="text-xs text-slate-400 leading-relaxed">A hidden link that only bots see. If accessed, the visitor's IP is permanently banned from your entire network.</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="p-4 bg-black/40 rounded-t-xl border border-white/10 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Code2 className="w-3 h-3" />
                                Trap Implementation
                            </span>
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20"></div>
                            </div>
                        </div>
                        <div className="bg-black/60 p-0 border-x border-b border-white/10 rounded-b-xl overflow-hidden">
                             <CodeBlock code={spiderTrapCode} label="HTML" language="html" />
                        </div>
                        <p className="text-xs text-slate-500 mt-4 italic text-center">
                            Place this link anywhere in your HTML body. It is hidden via CSS.
                        </p>
                    </div>
                </div>
            </div>

            {/* Server Side Integration */}
            <div className="space-y-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/50 pb-6">
                     <div className="space-y-2">
                        <h2 className="text-3xl font-heading font-extrabold text-foreground">Server-Side Tracking</h2>
                        <p className="text-muted-foreground text-sm">
                            Mission-critical analytics and threat blocking directly from your backend.
                        </p>
                     </div>
                     <div className="flex gap-2">
                         <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold border border-accent/20">Official SDKs</span>
                     </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Node.js SDK */}
                    <div className="premium-card p-0 overflow-hidden group">
                         <div className="bg-secondary/30 p-4 border-b border-border/50 flex items-center justify-between group-hover:bg-secondary/50 transition-colors">
                            <span className="font-bold text-sm flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-accent" />
                                Node.js (Express)
                            </span>
                            <div className="text-[10px] bg-accent/10 px-2.5 py-1 rounded-full text-accent border border-accent/20 font-mono">v1.1.0</div>
                         </div>
                         <div className="p-5 bg-[#0F172A] space-y-6">
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Installation</div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/10 font-mono text-xs text-emerald-400">
                                    npm install helm-analytics
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Middleware</div>
                                <CodeBlock 
                                    label="Express.js"
                                    code={`const helm = require('helm-analytics');

// Initialize with your Site ID
const analytics = new helm.HelmAnalytics({
    siteId: 'YOUR_SITE_ID',
    apiUrl: 'https://api.analytics.yourdomain.com'
});

// Enable Tracking & Shield Mode (Blocking)
app.use(analytics.middleware({ shield: true }));`} 
                                />
                            </div>
                         </div>
                    </div>

                    {/* Python SDK */}
                    <div className="premium-card p-0 overflow-hidden group">
                         <div className="bg-secondary/30 p-4 border-b border-border/50 flex items-center justify-between group-hover:bg-secondary/50 transition-colors">
                            <span className="font-bold text-sm flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-accent" />
                                Python (Flask/FastAPI)
                            </span>
                            <div className="text-[10px] bg-accent/10 px-2.5 py-1 rounded-full text-accent border border-accent/20 font-mono">v1.1.0</div>
                         </div>
                         <div className="p-5 bg-[#0F172A] space-y-6">
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Installation</div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/10 font-mono text-xs text-emerald-400">
                                    pip install helm_analytics
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Flask App</div>
                                <CodeBlock 
                                    label="Python"
                                    code={`from helm_analytics import HelmAnalytics

helm = HelmAnalytics(
    site_id="YOUR_SITE_ID", 
    api_url="https://api.analytics.yourdomain.com"
)

# Enable Shield Mode (Blocking)
app.before_request(helm.flask_middleware(shield=True))`} 
                                />
                            </div>
                         </div>
                    </div>

                     {/* Go SDK */}
                     <div className="premium-card p-0 overflow-hidden md:col-span-2 group">
                         <div className="bg-secondary/30 p-4 border-b border-border/50 flex items-center justify-between group-hover:bg-secondary/50 transition-colors">
                            <span className="font-bold text-sm flex items-center gap-2">
                                <Terminal className="w-5 h-5 text-accent" />
                                Go (Golang)
                            </span>
                            <div className="text-[10px] bg-accent/10 px-2.5 py-1 rounded-full text-accent border border-accent/20 font-mono">v1.0.0</div>
                         </div>
                         <div className="p-5 bg-[#0F172A] space-y-6">
                            <div className="space-y-2">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Installation</div>
                                <div className="bg-black/40 p-3 rounded-lg border border-white/10 font-mono text-xs text-emerald-400">
                                    go get github.com/Sentinel-Analytics/sentinel-mvp/sdk/go/helm-analytics
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Initialization</div>
                                    <CodeBlock 
                                        label="Go"
                                        code={`// Initialize
analytics := helm.New(helm.Config{
    SiteID: "YOUR_SITE_ID",
    APIURL: "https://api...",
})`} 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Middleware</div>
                                    <CodeBlock 
                                        label="Go"
                                        code={`// Mount Middleware with Shield=true
http.ListenAndServe(":80", 
    analytics.Middleware(mux, true)
)`} 
                                    />
                                </div>
                            </div>
                         </div>
                    </div>
                 </div>
            </div>

             {/* Footer FAQ-style mini tips */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-border/50">
                <div className="flex gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-colors">
                    <Activity className="w-8 h-8 text-accent shrink-0" />
                    <div>
                         <h4 className="font-bold text-foreground mb-1">Real-time Heartbeat</h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">The tracker sends a heartbeat every 15 seconds to ensure 'Time on Page' metrics are 100% accurate even if the user closes the tab.</p>
                    </div>
                </div>
                <div className="flex gap-4 p-4 rounded-xl hover:bg-secondary/20 transition-colors">
                    <Fingerprint className="w-8 h-8 text-accent shrink-0" />
                    <div>
                         <h4 className="font-bold text-foreground mb-1">Privacy First</h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">Helm is cookieless. We use privacy-compliant session hashes that expire naturally, ensuring GDPR and CCPA compliance by default.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;
