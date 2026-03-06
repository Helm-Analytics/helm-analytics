import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { AlertTriangle, AlertOctagon, Terminal, Clock, ChevronDown, ChevronRight, Play, Sparkles } from 'lucide-react';

const ErrorsPage = () => {
  const { selectedSite } = useOutletContext();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (selectedSite?.id) {
      fetchErrors();
    }
  }, [selectedSite?.id, fetchErrors]);

  const fetchErrors = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getErrorStats(selectedSite.id);
      setErrors(data || []);
    } catch (err) {
      console.error("Failed to fetch errors:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedSite?.id]);

  const handleExpand = async (idx) => {
    const isExpanding = expandedId !== idx;
    setExpandedId(isExpanding ? idx : null);
    
    const err = errors[idx];
    if (isExpanding && !err.mitigation) {
        console.log("🤖 Triggering AI Analysis for:", err.message);
        try {
            const response = await api.analyzeError(err.message, err.source);
            console.log("✅ AI Response Received:", response);

            const updatedErrors = [...errors];
            updatedErrors[idx].mitigation = response.mitigation;
            setErrors(updatedErrors);
        } catch (e) {
            console.error("❌ AI Analysis Failed:", e);
            const updatedErrors = [...errors];
            updatedErrors[idx].mitigation = `<div class="text-rose-500 font-bold">Analysis Failed: ${e.message || "Unknown Error"}. Check console for details.</div>`;
            setErrors(updatedErrors);
        }
    } else if (isExpanding) {
        console.log("ℹ️ Using cached mitigation for:", err.message);
    }
  };

  if (!selectedSite) {
    return (
      <div className="flex items-center justify-center h-96 helm-bg">
        <div className="premium-card text-center max-w-md">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
            <AlertOctagon className="w-8 h-8 text-rose-500/50" />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">No site selected</h2>
          <p className="text-muted-foreground text-sm">Select a website from the sidebar to monitor runtime exceptions and issues.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <div className="flex items-center space-x-2 text-rose-500 font-bold text-xs uppercase tracking-widest mb-2">
            <AlertOctagon className="w-4 h-4" />
            <span>Stability Monitor</span>
          </div>
          <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
            Runtime Exceptions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Automated capturing and aggregation of frontend issues.</p>
        </div>
      </div>

      <div className="premium-card !p-0 overflow-hidden shadow-2xl">
         {loading ? (
             <div className="p-20 flex flex-col items-center justify-center">
                 <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500 mb-4"></div>
                 <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest">Scanning logs...</p>
             </div>
         ) : errors.length > 0 ? (
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                  <thead className="bg-secondary/30 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                      <tr>
                          <th className="px-6 py-4 font-bold">Severity</th>
                          <th className="px-6 py-4 font-bold">Trace & Origin</th>
                          <th className="px-6 py-4 font-bold text-right">Impact</th>
                          <th className="px-6 py-4 font-bold text-right">Occurrence</th>
                          <th className="px-6 py-4 font-bold text-right">Last Detected</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-white dark:bg-card">
                       {errors.map((err, idx) => (
                           <React.Fragment key={idx}>
                           <tr 
                             className={`hover:bg-secondary/20 transition-all group cursor-pointer ${expandedId === idx ? 'bg-secondary/30' : ''}`}
                             onClick={() => handleExpand(idx)}
                           >
                               <td className="px-6 py-6 transition-all">
                                   <div className="flex items-center gap-3">
                                       {expandedId === idx ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                                       <span className={`px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest ${
                                           err.severity === 'Critical' 
                                           ? 'bg-rose-500 text-white animate-pulse' 
                                           : 'bg-amber-500 text-white'
                                       }`}>
                                           {err.severity || 'Error'}
                                       </span>
                                   </div>
                               </td>
                               <td className="px-6 py-6">
                                   <div className="flex items-start gap-4">
                                       <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-xl group-hover:scale-110 transition-transform">
                                         <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                       </div>
                                       <div className="max-w-md">
                                           <div className="font-mono text-sm text-foreground font-bold break-words leading-relaxed line-clamp-2">{err.message}</div>
                                           <div className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-2 font-bold uppercase tracking-tight">
                                               <Terminal className="w-3.5 h-3.5" />
                                               <span className="truncate">{err.source || 'Anonymous Runtime'} (Line: {err.lineNo})</span>
                                           </div>
                                       </div>
                                   </div>
                               </td>
                               <td className="px-6 py-6 text-right font-bold text-sm text-foreground">
                                   <span className="text-accent">{err.userImpact}</span> <span className="text-[10px] text-muted-foreground uppercase ml-1">Users</span>
                               </td>
                               <td className="px-6 py-6 text-right">
                                   <span className="bg-secondary text-foreground px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm border border-border/40">
                                       {err.count}
                                   </span>
                               </td>
                               <td className="px-6 py-6 text-right">
                                   <div className="flex items-center justify-end gap-2 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-tight">
                                      <Clock className="w-3.5 h-3.5" />
                                      {new Date(err.lastSeen).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                                   </div>
                               </td>
                           </tr>
                           {expandedId === idx && (
                               <tr className="bg-secondary/5 border-l-4 border-l-accent animate-in slide-in-from-top-4 duration-300">
                                   <td colSpan="5" className="px-12 py-10 space-y-10">
                                       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                           {/* Technical Context */}
                                           <div className="space-y-4">
                                               <div className="flex items-center justify-between">
                                                   <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center">
                                                       <Terminal className="w-4 h-4 mr-2" />
                                                       Stack Context
                                                   </h4>
                                                   <button 
                                                     className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card border border-border/50 text-foreground text-[10px] font-extrabold uppercase tracking-wider rounded-xl hover:bg-secondary/50 hover:border-accent/40 hover:text-accent transition-all shadow-sm"
                                                     onClick={(e) => {
                                                       e.stopPropagation();
                                                       window.location.href = `/session-replay?clientIp=${err.clientIp}`;
                                                     }}
                                                   >
                                                       <Play className="w-3.5 h-3.5" />
                                                       Replay Occurrence
                                                   </button>
                                               </div>
                                               <div className="bg-slate-900 rounded-2xl p-6 font-mono text-xs text-slate-300 overflow-x-auto shadow-2xl border border-white/5 max-h-80 custom-scrollbar">
                                                   <pre className="whitespace-pre-wrap leading-relaxed">{err.errorObj || 'No stack trace available for this event.'}</pre>
                                               </div>
                                           </div>

                                           {/* AI Intelligence */}
                                           <div className="space-y-4">
                                               <h4 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center">
                                                   <Sparkles className="w-4 h-4 mr-2" />
                                                   Helm Intelligence
                                               </h4>
                                               <div className="premium-card bg-white dark:bg-card border-accent/20 border-2 p-8 relative overflow-hidden group min-h-[220px] shadow-2xl shadow-accent/5">
                                                   <div className="absolute -top-12 -right-12 w-40 h-40 bg-accent/10 rounded-full blur-3xl opacity-50 group-hover:scale-125 transition-transform duration-1000"></div>
                                                   <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform">
                                                       <Sparkles className="w-16 h-16 text-accent" />
                                                   </div>
                                                   <div className="relative text-sm text-foreground/90 leading-relaxed space-y-3 prose prose-slate dark:prose-invert max-w-none">
                                                        {err.mitigation ? (
                                                            <div className="space-y-4" dangerouslySetInnerHTML={{ __html: err.mitigation }} />
                                                        ) : (
                                                            <div className="italic text-muted-foreground flex flex-col items-center justify-center py-12 gap-4">
                                                                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                                                <span className="font-bold uppercase tracking-widest text-[10px]">Processing Trace Log...</span>
                                                            </div>
                                                        )}
                                                   </div>
                                               </div>
                                           </div>
                                       </div>
                                   </td>
                               </tr>
                           )}
                           </React.Fragment>
                       ))}
                  </tbody>
              </table>
           </div>
         ) : (
             <div className="p-24 text-center">
                 <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                     <AlertTriangle className="w-10 h-10 text-emerald-500 opacity-60" />
                 </div>
                 <h3 className="text-xl font-heading font-extrabold text-foreground mb-2">Sky Clear</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto">No runtime script errors have been detected in the current observation period.</p>
             </div>
         )}
      </div>
      
      {/* Help info footer */}
      <div className="premium-card bg-secondary/20 flex gap-6 items-center border-dashed">
         <div className="p-3 bg-white dark:bg-card rounded-2xl shadow-sm border border-border/40">
            <Terminal className="w-6 h-6 text-accent" />
         </div>
         <div>
            <h4 className="text-sm font-bold text-foreground">Error Ingestion Active</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Automated issue tracking is integrated into the Nautical tracker. No additional configuration required.</p>
         </div>
      </div>
    </div>
  );
};

export default ErrorsPage;
