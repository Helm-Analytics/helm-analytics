import React, { useEffect, useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { 
  Activity, 
  Eye, 
  Shield, 
  AlertCircle, 
  Globe, 
  Monitor, 
  Smartphone, 
  Zap, 
  Clock, 
  Hash, 
  ArrowUpRight,
  Search,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityPage() {
  const { selectedSite } = useOutletContext();
  const [activities, setActivities] = useState([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (selectedSite?.id) {
      fetchActivities();
      const interval = setInterval(fetchActivities, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedSite, filter]);

  const fetchActivities = async () => {
    try {
      const response = await api.getActivityLog(selectedSite.id, filter);
      setActivities(response?.activities || []);
      setTotalUsage(response?.totalUsageMonth || 0);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(() => {
    if (!searchQuery) return activities;
    const query = searchQuery.toLowerCase();
    return activities.filter(a => {
      const searchableFields = [
        a.eventName,
        a.message,
        a.url,
        a.ip,
        a.type,
        a.browser,
        a.os,
        a.country
      ];
      return searchableFields.some(field => 
        field && String(field).toLowerCase().includes(query)
      );
    });
  }, [activities, searchQuery]);

  const getActivityConfig = (type) => {
    switch (type) {
      case 'pageview':
        return { icon: Eye, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20', label: 'Page View' };
      case 'event':
        return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Action' };
      case 'web-vital':
        return { icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Performance' };
      case 'block':
        return { icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Blocked' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'Crash' };
      default:
        return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Event' };
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* Header & Stats Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <div className="flex items-center space-x-2 text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-2.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Live Command Center</span>
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Activity <span className="text-accent underline decoration-accent/20 underline-offset-8">Feed</span>
          </h1>
          <p className="text-muted-foreground mt-2.5 text-sm max-w-md leading-relaxed font-medium">Real-time observation of global user interactions and system events.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="premium-card !p-4 !px-6 bg-secondary/30 flex items-center gap-4 border border-accent/20">
            <div className="p-2 bg-accent/10 rounded-xl">
              <RefreshCw className="w-4 h-4 text-accent animate-spin" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Capture Volume</div>
              <div className="text-lg font-heading font-black text-foreground">
                {totalUsage.toLocaleString()}<span className="text-[10px] text-muted-foreground ml-1 font-bold">EVENTS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border/50 backdrop-blur-md">
          {['all', 'pageviews', 'events', 'errors'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === f
                  ? 'bg-white dark:bg-card text-accent shadow-lg shadow-accent/10 scale-[1.02] border border-accent/20'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
          <input 
            type="text"
            placeholder="Search events by type, URL, IP, country, or payload..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 dark:bg-card/50 border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all backdrop-blur-md"
          />
        </div>
      </div>

      {/* Activity Stream */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-border/0 via-border to-border/0 hidden md:block" />

        <div className="space-y-4">
          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Connecting to ClickHouse Stream...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="premium-card p-20 text-center border-dashed">
              <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-extrabold text-foreground tracking-tight">Zero Observations</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-2">No signals detected matching your current telemetry filter.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity, idx) => {
                const config = getActivityConfig(activity.type);
                const Icon = config.icon;
                
                return (
                  <motion.div
                    key={activity.timestamp + idx}
                    initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative"
                  >
                    <div className="flex gap-6 items-center">
                      {/* Timeline Dot */}
                      <div className="hidden md:flex relative z-10 w-16 h-16 shrink-0 items-center justify-center">
                        <div className={`w-10 h-10 rounded-2xl ${config.bg} ${config.border} border flex items-center justify-center shadow-lg transition-transform group-hover:scale-110`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-1 premium-card !p-5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-all cursor-crosshair relative overflow-hidden group/card">
                        <div className={`absolute top-0 right-0 w-32 h-32 ${config.bg} blur-3xl opacity-0 group-hover/card:opacity-30 transition-opacity duration-700`} />
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${config.bg} ${config.color} border ${config.border}`}>
                                  {config.label}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground/50 font-mono">
                                  {new Date(activity.timestamp).toLocaleTimeString()}
                                </span>
                            </div>
                            <h4 className="text-sm font-bold text-foreground truncate max-w-2xl leading-tight tracking-tight">
                              {activity.eventName || activity.message || (
                                activity.type === 'pageview' ? `Observed ${activity.url}` : 
                                activity.type === 'web-vital' ? `Core Web Vital Performance Detected` :
                                'System Event'
                              )}
                            </h4>

                            {activity.type === 'web-vital' && (
                              <div className="flex gap-4 mt-1">
                                {activity.lcp && (
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                    LCP: <span className="text-emerald-500">{activity.lcp.toFixed(2)}s</span>
                                  </div>
                                )}
                                {activity.cls && (
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                    CLS: <span className="text-emerald-500">{activity.cls.toFixed(3)}</span>
                                  </div>
                                )}
                                {activity.fid && (
                                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                    FID: <span className="text-emerald-500">{activity.fid.toFixed(2)}ms</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-3 mt-1 underline-offset-4 decoration-accent/10">
                              {activity.country && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-tight">
                                  <Globe className="w-3.5 h-3.5 text-accent/40" />
                                  <span>{activity.country}</span>
                                </div>
                              )}
                              {activity.browser && (
                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-tight">
                                  {activity.os?.toLowerCase().includes('windows') ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
                                  <span>{activity.browser} on {activity.os}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50 group-hover:border-accent/30 transition-colors">
                              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
