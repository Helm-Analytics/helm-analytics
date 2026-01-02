import React from 'react';
import { Book, Terminal, Code, Shield, Activity, Zap, ChevronRight, Copy, Check } from 'lucide-react';

const DocsPage = () => {
    const [copied, setCopied] = React.useState(null);

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const sections = [
        {
            title: "Quick Start",
            icon: Zap,
            content: "To start tracking your website, simply copy and paste the following snippet into the `<head>` of your website.",
            code: `<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="YOUR_SITE_ID"></script>`
        },
        {
            title: "Advanced Bot Detection",
            icon: Shield,
            content: "Deploy a 'Spider Trap' to catch advanced scrapers. Add a hidden link anywhere in your HTML. Genuine users won't see it, but bots will follow it and get flagged.",
            code: `<a href="/track/trap?siteId=YOUR_SITE_ID" style="display:none" aria-hidden="true">Health Check</a>`
        }
    ];

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
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-3 bg-accent/10 rounded-2xl mb-4">
                    <Book className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">Documentation</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Master the art of Website Intelligence. Comprehensive guides for integration, security, and performance monitoring.</p>
            </div>

            {/* Main Sections */}
            <div className="grid gap-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="premium-card space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg">
                                <section.icon className="w-5 h-5 text-accent" />
                            </div>
                            <h2 className="text-xl font-heading font-extrabold text-foreground">{section.title}</h2>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">{section.content}</p>
                        <div className="relative group">
                            <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
                                <pre>{section.code}</pre>
                            </div>
                            <button 
                                onClick={() => copyToClipboard(section.code, `section-${idx}`)}
                                className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                            >
                                {copied === `section-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Integrations */}
            <div className="space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <Terminal className="w-6 h-6 text-accent" />
                    <h2 className="text-2xl font-heading font-extrabold text-foreground tracking-tight">Backend Integrations</h2>
                </div>
                <div className="grid gap-6">
                    {integrations.map((int, idx) => (
                        <div key={idx} className="premium-card space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                                    <ChevronRight className="w-4 h-4 text-accent" />
                                    {int.name}
                                </h3>
                            </div>
                            <div className="relative group">
                                <div className="bg-slate-900 rounded-xl p-5 font-mono text-xs text-slate-300 border border-white/5 overflow-x-auto">
                                    <pre>{int.code}</pre>
                                </div>
                                <button 
                                    onClick={() => copyToClipboard(int.code, `int-${idx}`)}
                                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                                >
                                    {copied === `int-${idx}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer FAQ-style mini tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
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
