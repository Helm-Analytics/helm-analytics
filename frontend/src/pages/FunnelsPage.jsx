import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { GitMerge, Plus, Trash2, ArrowDown, ExternalLink, Settings } from 'lucide-react';

const FunnelsPage = () => {
    const { selectedSite } = useOutletContext();
    const [funnels, setFunnels] = useState([]);
    const [newFunnelName, setNewFunnelName] = useState('');
    const [newFunnelSteps, setNewFunnelSteps] = useState(['', '']);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (selectedSite) fetchFunnels();
    }, [selectedSite]);

    const fetchFunnels = async () => {
        try {
            const data = await api.listFunnels(selectedSite.id);
            setFunnels(data || []);
        } catch (error) {
            console.error("Failed to fetch funnels:", error);
        }
    };

    const handleCreateFunnel = async (e) => {
        e.preventDefault();
        if (!newFunnelName.trim() || newFunnelSteps.some(s => !s.trim())) return;
        
        try {
            await api.createFunnel({
                siteId: selectedSite.id,
                name: newFunnelName,
                steps: newFunnelSteps,
            });
            setNewFunnelName('');
            setNewFunnelSteps(['', '']);
            setIsCreating(false);
            fetchFunnels();
        } catch (error) {
            console.error("Failed to create funnel:", error);
        }
    };

    if (!selectedSite) {
      return (
        <div className="flex items-center justify-center h-96 helm-bg">
          <div className="premium-card text-center max-w-md">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
              <GitMerge className="w-8 h-8 text-accent/50" />
            </div>
            <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">No site selected</h2>
            <p className="text-muted-foreground text-sm">Select a website from the sidebar to visualize conversion funnels and drop-offs.</p>
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
                <div>
                   <div className="flex items-center space-x-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
                        <GitMerge className="w-4 h-4" />
                        <span>Conversion Intelligence</span>
                    </div>
                    <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
                        Traffic Funnels
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Visualize user progression and identify friction points.</p>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-primary/10 font-bold text-xs uppercase tracking-widest"
                >
                    <Plus className="w-4 h-4" />
                    {isCreating ? 'Cancel' : 'Create Funnel'}
                </button>
            </div>

            {/* Creation Form */}
            {isCreating && (
                <div className="premium-card bg-secondary/30 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-heading font-extrabold text-foreground mb-6">Build a User Journey</h3>
                    <form onSubmit={handleCreateFunnel} className="space-y-8">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-3">Funnel Name</label>
                            <input
                                type="text"
                                value={newFunnelName}
                                onChange={(e) => setNewFunnelName(e.target.value)}
                                placeholder="e.g. E-commerce Conversion"
                                className="w-full px-5 py-3 bg-white dark:bg-black/20 border border-border/60 rounded-xl text-foreground focus:ring-2 focus:ring-accent outline-none shadow-sm transition-all"
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Sequence Steps (URLs)</label>
                            <div className="space-y-3">
                                {newFunnelSteps.map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-4 group animate-in slide-in-from-left-2 transition-all">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/5 dark:bg-accent/10 flex items-center justify-center text-accent font-extrabold text-sm border border-accent/20">
                                            {idx + 1}
                                        </div>
                                        <input
                                            type="text"
                                            value={step}
                                            onChange={(e) => {
                                                const newSteps = [...newFunnelSteps];
                                                newSteps[idx] = e.target.value;
                                                setNewFunnelSteps(newSteps);
                                            }}
                                            placeholder={idx === 0 ? "/pricing" : "/checkout"}
                                            className="flex-1 px-5 py-3 bg-white dark:bg-black/20 border border-border/60 rounded-xl text-foreground focus:ring-2 focus:ring-accent outline-none shadow-sm transition-all font-mono text-sm"
                                        />
                                        {newFunnelSteps.length > 2 && (
                                            <button 
                                                type="button" 
                                                onClick={() => {
                                                    const newSteps = [...newFunnelSteps];
                                                    newSteps.splice(idx, 1);
                                                    setNewFunnelSteps(newSteps);
                                                }}
                                                className="p-3 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setNewFunnelSteps([...newFunnelSteps, ''])}
                                className="text-xs text-accent hover:text-accent/80 font-bold uppercase tracking-widest flex items-center gap-2 ml-14 mt-4 transition-colors"
                            >
                                <Plus className="w-4 h-4" /> Add Next Step
                            </button>
                        </div>
                        
                        <div className="pt-6 border-t border-border/50 flex justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => setIsCreating(false)}
                                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
                            >
                                Launch Funnel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Info Box */}
            <div className="premium-card bg-accent text-white border-transparent flex gap-6 items-start">
                <div className="p-3 bg-white/20 rounded-2xl shadow-inner flex-shrink-0">
                    <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-heading font-extrabold text-white mb-1">Funnel Engine</h3>
                    <p className="text-white/80 text-sm leading-relaxed max-w-3xl">
                        Tracking follows a strict sequence. Define steps using relative URL paths 
                        (e.g., <code className="bg-black/20 px-1.5 py-0.5 rounded-md font-mono text-xs">/signup</code>). 
                        Helm will monitor unique session transitions across these touchpoints.
                    </p>
                </div>
            </div>

            {/* Funnels List */}
            <div className="space-y-6">
                {funnels.length > 0 ? (
                    funnels.map(funnel => (
                        <div key={funnel.id} className="premium-card !p-0 overflow-hidden group">
                            <div className="p-6 border-b border-border/50 flex justify-between items-center bg-secondary/10">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-accent/10 dark:bg-accent/20 rounded-xl text-accent">
                                        <GitMerge className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <h3 className="text-lg font-heading font-extrabold text-foreground">{funnel.name}</h3>
                                       <div className="flex items-center gap-2 mt-0.5">
                                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Collecting High-Res Data</span>
                                       </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={async () => {
                                        if (confirm("Permanently delete this funnel?")) {
                                            await api.deleteFunnel(funnel.id);
                                            fetchFunnels();
                                        }
                                    }}
                                    className="text-muted-foreground hover:text-rose-500 p-2.5 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            
                            <div className="p-8">
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
                                    {/* Connection Line */}
                                    <div className="hidden lg:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-accent/30 via-border to-border -z-0"></div>

                                    {funnel.steps.map((step, idx) => (
                                        <div key={idx} className="relative z-10 flex flex-col items-center w-full lg:w-auto group/step">
                                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-primary border-2 border-accent flex items-center justify-center text-accent font-extrabold shadow-xl mb-4 group-hover/step:translate-y-[-4px] transition-all duration-300">
                                                {idx + 1}
                                            </div>
                                            <div className="bg-secondary/50 dark:bg-black/30 border border-border/60 rounded-xl px-4 py-2 text-xs text-foreground font-mono font-bold shadow-sm flex items-center gap-2 max-w-[180px] break-all">
                                                <ExternalLink className="w-3 h-3 text-accent" />
                                                {step}
                                            </div>
                                            
                                            {/* Mobile Arrow */}
                                            {idx < funnel.steps.length - 1 && (
                                                <ArrowDown className="lg:hidden w-6 h-6 text-muted-foreground/30 my-4" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-12 bg-secondary/20 rounded-2xl p-8 text-center border border-border/40 border-dashed">
                                    <div className="w-10 h-10 bg-white dark:bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border/50 text-muted-foreground/40">
                                      <Settings className="w-5 h-5 animate-spin-slow" />
                                    </div>
                                    <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mb-1">Awaiting Traffic Flow</p>
                                    <p className="text-muted-foreground/50 text-[10px] max-w-md mx-auto">
                                        Intelligence engine is processing visits. Real-time conversion percentages will calibrate as users interact with these touchpoints.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="premium-card p-20 text-center border-2 border-dashed border-border/50">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8 opacity-40">
                          <GitMerge className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-heading font-extrabold text-foreground mb-3">No Funnels Established</h3>
                        <p className="text-muted-foreground text-sm mb-10 max-w-sm mx-auto leading-relaxed">Map your first user journey to start tracking drop-offs and ROI throughout your application.</p>
                        <button 
                            onClick={() => setIsCreating(true)}
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-primary/10"
                        >
                            Build First Funnel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FunnelsPage;
