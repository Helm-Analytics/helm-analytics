import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Search, 
  Filter, 
  Calendar, 
  Activity, 
  Zap, 
  MousePointer2, 
  Download, 
  ChevronRight,
  Info,
  ExternalLink,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';

function CustomEventsPageContent() {
  const { selectedSite, darkMode } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [showGuide, setShowGuide] = useState(false);
  const [selectedExample, setSelectedExample] = useState('basic');

  useEffect(() => {
    if (selectedSite?.id) {
      fetchEvents();
    }
  }, [selectedSite, filter, timeRange]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Demo mode: return demo custom events data
      
      
      const response = await api.getCustomEvents(selectedSite.id, {
        timeRange,
        eventName: filter === 'all' ? null : filter,
      });
      setEvents(response?.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeExamples = {
    basic: `// Track a button click
helm.trackEvent('button_clicked', {
  location: 'header',
  text: 'Get Started'
});`,
    react: `// In React component
const handleSignup = () => {
  helm.trackEvent('signup_started', {
    plan: 'pro'
  });
};`,
    advanced: `// E-commerce tracking
helm.trackEvent('purchase', {
  amount: 99.99,
  product_id: '12345',
  category: 'subscription'
});`,
  };

  const uniqueEvents = [...new Set(events.map(e => e.event_name))];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-accent/10 rounded-xl border border-accent/20">
              <Activity className="text-accent" size={24} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Custom <span className="text-accent">Events</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
            Capture granular user interactions and business-critical actions that pageviews alone can't reveal.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowGuide(!showGuide)}
          className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
            showGuide 
              ? 'bg-accent text-white shadow-lg shadow-accent/20' 
              : 'bg-secondary text-foreground border border-border hover:border-accent/40'
          }`}
        >
          <Code2 size={16} />
          {showGuide ? 'Hide Implementation' : 'Setup Guide'}
        </motion.button>
      </div>

      {/* Interactive Setup Guide */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden group">
              {/* Decorative background element */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-accent/10 transition-colors duration-700"></div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-black text-xs">01</div>
                      <h3 className="font-bold text-lg">Embed the SDK</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Add our lightweight tracker to your <code className="text-accent">&lt;head&gt;</code>. It creates a global <code className="text-accent font-mono">helm</code> proxy automatically.
                    </p>
                    <div className="relative group/code">
                      <pre className="bg-background border border-border rounded-2xl p-5 text-xs font-mono text-foreground/80 overflow-x-auto">
                        {`<script defer \n  data-site-id="${selectedSite?.id || 'PROJECT_ID'}" \n  src="https://app.helm-analytics.com/static/tracker-v5.js">\n</script>`}
                      </pre>
                      <button 
                        onClick={() => copyCode(`<script defer data-site-id="${selectedSite?.id || 'PROJECT_ID'}" src="https://app.helm-analytics.com/static/tracker-v5.js"></script>`)}
                        className="absolute top-3 right-3 p-2 bg-secondary/80 hover:bg-accent hover:text-white rounded-lg transition-all opacity-0 group-hover/code:opacity-100 border border-border"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xs">02</div>
                      <h3 className="font-bold text-lg">Auto-Tracked Events</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { icon: <ExternalLink size={14} />, label: 'Outbound Clicks', code: 'outbound_click' },
                        { icon: <Download size={14} />, label: 'File Downloads', code: 'file_download' },
                        { icon: <Activity size={14} />, label: 'Scroll Depth', code: 'scroll_depth' },
                        { icon: <Plus size={14} />, label: 'Form Submits', code: 'form_submit' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl border border-border/40">
                          <div className="text-muted-foreground/60">{item.icon}</div>
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 leading-none mb-1">{item.label}</div>
                            <code className="text-[11px] font-mono text-foreground/80">{item.code}</code>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 font-black text-xs">03</div>
                    <h3 className="font-bold text-lg">Custom Trigger</h3>
                  </div>

                  <div className="flex bg-secondary/50 p-1.5 rounded-2xl border border-border/50">
                    {['basic', 'react', 'advanced'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedExample(type)}
                        className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold capitalize transition-all ${
                          selectedExample === type 
                            ? 'bg-background text-accent shadow-sm border border-border' 
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="relative group/code">
                    <pre className="bg-background border border-border rounded-2xl p-6 text-xs font-mono text-emerald-400/90 leading-loose min-h-[160px] overflow-x-auto shadow-inner">
                      {codeExamples[selectedExample]}
                    </pre>
                    <button 
                      onClick={() => copyCode(codeExamples[selectedExample])}
                      className="absolute top-4 right-4 p-2 bg-secondary/80 hover:bg-accent hover:text-white rounded-lg transition-all opacity-0 group-hover/code:opacity-100 border border-border"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                    
                    <div className="absolute -bottom-3 -right-3 p-4 bg-accent/10 border border-accent/20 rounded-2xl backdrop-blur-sm hidden md:block">
                      <div className="flex items-center gap-3">
                         <Zap size={18} className="text-accent animate-pulse" />
                         <div className="text-[10px] font-black uppercase tracking-widest text-accent">No Imports Required</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-card border border-border rounded-3xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-xl border border-border text-muted-foreground mr-2">
             <Filter size={14} />
             <span className="text-[10px] font-black uppercase tracking-wider">Events</span>
           </div>
           
           <button
             onClick={() => setFilter('all')}
             className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all border ${
               filter === 'all'
                 ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20'
                 : 'bg-background text-foreground border-border hover:border-accent/40'
             }`}
           >
             Live Feed
           </button>
           
           {uniqueEvents.slice(0, 4).map((name) => (
             <button
               key={name}
               onClick={() => setFilter(name)}
               className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight transition-all border ${
                 filter === name
                   ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20'
                   : 'bg-background text-foreground border-border hover:border-accent/40'
               }`}
             >
               {name}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/50 rounded-xl border border-border text-muted-foreground mr-2">
             <Calendar size={14} />
             <span className="text-[10px] font-black uppercase tracking-wider">Window</span>
           </div>
           <div className="flex bg-secondary/40 p-1 rounded-xl border border-border/50">
             {['7d', '30d', '90d'].map((range) => (
               <button
                 key={range}
                 onClick={() => setTimeRange(range)}
                 className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                   timeRange === range
                     ? 'bg-background text-foreground shadow-sm'
                     : 'text-muted-foreground hover:text-foreground'
                 }`}
               >
                 {range}
               </button>
             ))}
           </div>
        </div>
      </div>

      {/* Export Controls */}
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={() => selectedSite?.id && api.exportData(selectedSite.id, 'events', 'csv', parseInt(timeRange))}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-card text-foreground border border-border hover:border-accent/40 flex items-center gap-2 transition-all shadow-sm"
        >
          <Download size={14} /> Export CSV
        </button>
        <button
          onClick={() => selectedSite?.id && api.exportData(selectedSite.id, 'events', 'json', parseInt(timeRange))}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-card text-foreground border border-border hover:border-accent/40 flex items-center gap-2 transition-all shadow-sm"
        >
          <Download size={14} /> Export JSON
        </button>
      </div>

      {/* Data Section */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loader"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center space-y-4"
            >
              <div className="w-12 h-12 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Fetching Intelligence...</p>
            </motion.div>
          ) : events.length === 0 ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border-2 border-dashed border-border rounded-[2.5rem] p-20 text-center relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="w-24 h-24 bg-accent/10 border border-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <Activity className="text-accent" size={40} />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-4 tracking-tight">Silent Intelligence Core</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-10 text-sm leading-relaxed font-medium">
                  We haven't detected any custom signals for this project yet. Trigger your first event to start mapping user behavior.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowGuide(true)}
                    className="px-10 py-4 bg-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-accent/20 transition-all"
                  >
                    View Setup Guide
                  </motion.button>
                  <a 
                    href="https://docs.helm-analytics.com/custom-events" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all py-4 px-6"
                  >
                    Open Documentation <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="table"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-black/5"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/40 border-b border-border/60">
                      <th className="px-8 py-5">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Event Name</div>
                      </th>
                      <th className="px-8 py-5">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Frequency</div>
                      </th>
                      <th className="px-8 py-5">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Last Observed</div>
                      </th>
                      <th className="px-8 py-5 text-right">
                         <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Properties</div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {events.map((event, index) => (
                      <motion.tr 
                        key={index}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group hover:bg-secondary/20 transition-all cursor-default"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-accent/10 border-r-2 border-accent/40 rounded-sm group-hover:bg-accent/20 transition-all"></div>
                            <code className="text-sm font-black text-foreground group-hover:text-accent transition-colors font-mono">
                              {event.eventName || event.event_name}
                            </code>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                             <span className="text-lg font-black text-foreground">{event.count.toLocaleString()}</span>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Hits detected</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                            {new Date(event.timestamp).toLocaleDateString()}
                            <div className="text-[10px] font-medium opacity-50 mt-1">{new Date(event.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-wrap justify-end gap-2">
                            {event.properties && Object.keys(event.properties).length > 0 ? (
                              Object.entries(event.properties).slice(0, 3).map(([key, value]) => (
                                <span
                                  key={key}
                                  title={`${key}: ${value}`}
                                  className="px-2.5 py-1 bg-background border border-border/50 rounded-lg text-[11px] font-mono text-muted-foreground hover:border-accent/30 hover:text-foreground transition-all"
                                >
                                  <span className="text-accent/60 opacity-80">{key}</span>: {String(value)}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">Minimal Payload</span>
                            )}
                            {event.properties && Object.keys(event.properties).length > 3 && (
                              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/50 text-[10px] font-black text-muted-foreground border border-border/40">
                                +{Object.keys(event.properties).length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default CustomEventsPageContent;
