import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api';
import { Plus, Trash2, ArrowRight, ChevronDown } from 'lucide-react';

const FunnelsPageContent = () => {
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
    
    if (!newFunnelName.trim()) {
      alert("Please provide a name for your funnel.");
      return;
    }
    
    if (newFunnelSteps.some(s => !s.trim())) {
      alert("All funnel steps must have a URL path.");
      return;
    }
    
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">No site selected</h2>
          <p className="text-muted-foreground text-sm">Select a website to view conversion funnels.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-5xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Conversion Funnels</h1>
          <p className="text-muted-foreground text-sm mt-1">Track user progression through your conversion paths</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          {isCreating ? 'Cancel' : 'New Funnel'}
        </button>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreating(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            
            {/* Modal */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div 
                className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-foreground mb-5">Create New Funnel</h3>
                <form onSubmit={handleCreateFunnel} className="space-y-5">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-2">Funnel Name</label>
                    <input
                      type="text"
                      value={newFunnelName}
                      onChange={(e) => setNewFunnelName(e.target.value)}
                      placeholder="e.g. Checkout Flow"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <label className="block text-xs text-muted-foreground">Steps (URL paths)</label>
                    <div className="max-h-[200px] overflow-y-auto space-y-2">
                      {newFunnelSteps.map((step, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3"
                        >
                          <span className="w-6 h-6 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={step}
                            onChange={(e) => {
                              const newSteps = [...newFunnelSteps];
                              newSteps[idx] = e.target.value;
                              setNewFunnelSteps(newSteps);
                            }}
                            placeholder={idx === 0 ? "/pricing" : "/checkout"}
                            className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                          />
                          {newFunnelSteps.length > 2 && (
                            <button 
                              type="button" 
                              onClick={() => {
                                const newSteps = [...newFunnelSteps];
                                newSteps.splice(idx, 1);
                                setNewFunnelSteps(newSteps);
                              }}
                              className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setNewFunnelSteps([...newFunnelSteps, ''])}
                      className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1 ml-9 mt-2"
                    >
                      <Plus className="w-3 h-3" /> Add Step
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t border-border flex justify-end gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsCreating(false)}
                      className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Create Funnel
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Info Note */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>How it works:</strong> Define URL paths in sequence. Helm tracks unique sessions that visit these paths in order within a 7-day window.
        </p>
      </div>

      {/* Funnels List */}
      <div className="space-y-4">
        <AnimatePresence>
          {funnels.length > 0 ? (
            funnels.map((funnel, funnelIdx) => {
              const hasData = funnel.stepCounts && funnel.stepCounts.some(c => c > 0);
              
              return (
                <motion.div 
                  key={funnel.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: funnelIdx * 0.05 }}
                  className="bg-card border border-border rounded-lg overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-foreground">{funnel.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {funnel.steps.length} steps · {hasData ? 'Active' : 'Awaiting data'}
                      </p>
                    </div>
                    <button 
                      onClick={async () => {
                        if (confirm("Delete this funnel?")) {
                          await api.deleteFunnel(funnel.id);
                          fetchFunnels();
                        }
                      }}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      {funnel.steps.map((step, idx) => {
                        const count = funnel.stepCounts ? funnel.stepCounts[idx] : 0;
                        const prevCount = idx > 0 && funnel.stepCounts ? funnel.stepCounts[idx - 1] : 0;
                        const conversionRate = prevCount > 0 ? ((count / prevCount) * 100) : (idx === 0 ? 100 : 0);
                        const isLast = idx === funnel.steps.length - 1;

                        return (
                          <React.Fragment key={idx}>
                            {/* Step */}
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-background border border-border rounded-lg p-4 min-w-[140px] flex-1 max-w-[200px]"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-5 h-5 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                                  {idx + 1}
                                </span>
                                <span className="text-xs font-mono text-muted-foreground truncate" title={step}>
                                  {step}
                                </span>
                              </div>
                              <div className={`text-2xl font-semibold ${hasData ? 'text-foreground' : 'text-muted-foreground/30'}`}>
                                {count?.toLocaleString() || 0}
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">visitors</div>
                              
                              {idx > 0 && hasData && (
                                <div className={`mt-2 text-xs font-medium ${conversionRate >= 50 ? 'text-green-600' : 'text-red-500'}`}>
                                  {conversionRate.toFixed(1)}% from prev
                                </div>
                              )}
                            </motion.div>

                            {/* Arrow */}
                            {!isLast && (
                              <div className="text-muted-foreground/30 flex-shrink-0">
                                <ArrowRight className="w-4 h-4" />
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    
                    {!hasData && (
                      <div className="mt-6 text-center py-4 bg-muted/30 rounded-lg">
                        <p className="text-xs text-muted-foreground">Waiting for traffic data...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center"
            >
              <h3 className="text-lg font-medium text-foreground mb-2">No funnels yet</h3>
              <p className="text-sm text-muted-foreground mb-6">Create your first funnel to start tracking conversions</p>
              <button 
                onClick={() => setIsCreating(true)}
                className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Create Funnel
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default FunnelsPageContent;
