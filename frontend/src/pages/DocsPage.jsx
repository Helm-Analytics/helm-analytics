import React from 'react';
import { Book, Terminal, Code, Shield, Activity, Zap, ChevronRight, Copy, Check } from 'lucide-react';

const DocsPage = () => {
    const [copied, setCopied] = React.useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const features = [
        {
            title: "Live Session Recording",
            icon: Activity,
            description: "Watch anonymized replays of user journeys. Understand exactly how visitors navigate your site, where they click, and what causes frustration.",
        },
        {
            title: "Interactive Heatmaps",
            icon: Zap,
            description: "Visualize engagement hotspots. See where users are clicking and scrolling to optimize your layout for better conversion.",
        },
        {
            title: "Conversion Funnels",
            icon: ChevronRight,
            description: "Define multi-step paths (e.g., /pricing -> /signup -> /dashboard) and identify exactly where users drop off.",
        },
        {
            title: "Nautical Firewall",
            icon: Shield,
            description: "Active protection against bots and scrapers. Block traffic by IP, Country, or Data Center (ASN) with a single click.",
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
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700 pb-12">
            {/* Hero Section */}
            <div className="text-center space-y-6 pt-8">
                <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-2xl mb-2">
                    <Book className="w-10 h-10 text-accent" />
                </div>
                <h1 className="text-5xl font-heading font-extrabold text-foreground tracking-tight">Helm Knowledge Base</h1>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                    Welcome to the complete guide for <strong>Helm Analytics</strong>. Learn how to integrate our lightweight tracker, secure your application, and leverage AI insights to grow your user base.
                </p>
            </div>

            {/* Quick Start Card */}
            <div className="premium-card bg-[#0F172A] border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap className="w-32 h-32 text-accent rotate-12" />
                </div>
                <div className="relative z-10 space-y-6">
                    <h2 className="text-2xl font-heading font-extrabold text-white flex items-center gap-3">
                        <Zap className="w-6 h-6 text-accent" />
                        Quick Integration
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                        To start tracking monitoring your website immediately, simply copy and paste the following snippet into the <code className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono text-xs">&lt;head&gt;</code> of your website HTML.
                    </p>
                    <div className="relative group">
                        <div className="bg-black/50 rounded-xl p-6 font-mono text-xs text-emerald-400 border border-white/10 overflow-x-auto shadow-inner">
                            <pre>{quickStartCode}</pre>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(quickStartCode, 'quickstart')}
                            className="absolute top-4 right-4 p-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/5 backdrop-blur-sm"
                        >
                            {copied === 'quickstart' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="space-y-8">
                 <h2 className="text-3xl font-heading font-extrabold text-foreground text-center">Core Capabilities</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {features.map((feature, idx) => (
                        <div key={idx} className="premium-card hover:border-accent/30 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-secondary rounded-2xl">
                                    <feature.icon className="w-6 h-6 text-accent" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-foreground">{feature.title}</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            {/* Advanced Guides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Spider Trap */}
                <div className="premium-card space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                            <Shield className="w-5 h-5 text-rose-500" />
                        </div>
                        <h2 className="text-xl font-heading font-extrabold text-foreground">Advanced Bot Defense</h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        Deploy a 'Spider Trap' to catch advanced scrapers. Add this hidden link anywhere in your HTML. Genuine users won't see it, but bots will follow it and get flagged immediately.
                    </p>
                    <div className="relative group mt-auto">
                        <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
                            <pre>{spiderTrapCode}</pre>
                        </div>
                        <button 
                            onClick={() => copyToClipboard(spiderTrapCode, 'trap')}
                            className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                        >
                            {copied === 'trap' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                    </div>
                </div>

                {/* Middleware */}
                <div className="premium-card space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-accent/10 rounded-lg">
                            <Terminal className="w-5 h-5 text-accent" />
                        </div>
                        <h2 className="text-xl font-heading font-extrabold text-foreground">Server-Side Tracking</h2>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        For maximum reliability, you can track events directly from your server. This bypasses ad-blockers and ensures 100% data fidelity.
                    </p>
                    
                    <div className="space-y-4">
                        {integrations.map((int, idx) => (
                             <details key={idx} className="group/details">
                                <summary className="flex items-center justify-between p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/70 transition-colors">
                                    <span className="font-bold text-sm flex items-center gap-2">
                                        <Code className="w-4 h-4 text-muted-foreground" />
                                        {int.name}
                                    </span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-open/details:rotate-90 transition-transform" />
                                </summary>
                                <div className="mt-3 relative">
                                    <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] text-slate-300 border border-white/5 overflow-x-auto">
                                        <pre>{int.code}</pre>
                                    </div>
                                    <button 
                                        onClick={() => copyToClipboard(int.code, `int-${idx}`)}
                                        className="absolute top-2 right-2 p-1.5 bg-white/5 hover:bg-white/10 rounded-md transition-colors border border-white/10"
                                    >
                                        {copied === `int-${idx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                    </button>
                                </div>
                             </details>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer FAQ-style mini tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <Activity className="w-6 h-6 text-accent mb-4" />
                    <h4 className="font-bold text-foreground mb-2">Real-time Heartbeat</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">The tracker sends a heartbeat every 15 seconds to ensure 'Time on Page' metrics are 100% accurate even if the user closes the tab.</p>
                </div>
                <div className="p-6 rounded-2xl bg-secondary/20 border border-border/50">
                    <Shield className="w-6 h-6 text-accent mb-4" />
                    <h4 className="font-bold text-foreground mb-2">Privacy First</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">Helm is cookieless. We use privacy-compliant session hashes that expire naturally, ensuring GDPR and CCPA compliance by default.</p>
                </div>
            </div>
        </div>
    );
};

export default DocsPage;
