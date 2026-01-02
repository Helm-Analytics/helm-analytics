import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { AlertTriangle, AlertOctagon, Terminal, Clock } from 'lucide-react';

const ErrorsPage = () => {
  const { selectedSite } = useOutletContext();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSite) {
      fetchErrors();
    }
  }, [selectedSite]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const data = await api.getErrorStats(selectedSite.id);
      setErrors(data || []);
    } catch (err) {
      console.error("Failed to fetch errors:", err);
    } finally {
      setLoading(false);
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
                          <th className="px-6 py-4 font-bold">Trace & Origin</th>
                          <th className="px-6 py-4 font-bold">Code Point</th>
                          <th className="px-6 py-4 font-bold text-right">Occurrence</th>
                          <th className="px-6 py-4 font-bold text-right">Last Detected</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 bg-white dark:bg-card">
                      {errors.map((err, idx) => (
                          <tr key={idx} className="hover:bg-secondary/20 transition-all group">
                              <td className="px-6 py-6">
                                  <div className="flex items-start gap-4">
                                      <div className="p-2 bg-rose-50 dark:bg-rose-950/20 rounded-xl group-hover:scale-110 transition-transform">
                                        <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                                      </div>
                                      <div>
                                          <div className="font-mono text-sm text-foreground font-bold break-all leading-relaxed">{err.message}</div>
                                          <div className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-2 font-bold uppercase tracking-tight">
                                              <Terminal className="w-3.5 h-3.5" />
                                              <span className="truncate max-w-[300px]">{err.source || 'Anonymous Runtime'}</span>
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-6">
                                  <span className="font-mono text-xs text-muted-foreground bg-secondary/50 px-2 py-1 rounded-md border border-border/30">
                                    Line: {err.lineNo}
                                  </span>
                              </td>
                              <td className="px-6 py-6 text-right">
                                  <span className="bg-rose-500 text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm shadow-rose-500/20">
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
