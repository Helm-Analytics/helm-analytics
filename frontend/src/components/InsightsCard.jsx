import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { TrendingUp, Lightbulb, BrainCircuit, RefreshCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDashboardStore } from '../store/useDashboardStore';

const InsightsCard = () => {
  const { selectedSite } = useOutletContext();
  const { aiInsights: insights, isLoadingAI: loading, fetchAiInsights } = useDashboardStore();
  
  // Fetch AI insights when site changes
  useEffect(() => {
    if (selectedSite?.id) {
      fetchAiInsights(selectedSite.id);
    }
  }, [selectedSite?.id, fetchAiInsights]);
  
  const handleRefresh = () => {
    if (selectedSite?.id) {
        fetchAiInsights(selectedSite.id, true);
    }
  };

  if (loading && !insights) {
    return (
      <div className="premium-card bg-card border rounded-2xl p-8 shadow-2xl animate-pulse h-full flex flex-col justify-center items-center overflow-hidden relative min-h-[350px]">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent animate-pulse"></div>
        <RefreshCcw className="w-10 h-10 text-accent mb-4 animate-spin relative z-10" />
        <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest relative z-10">Syncing Intelligence...</span>
      </div>
    );
  }

  if (!insights) {
    return null; 
  }

  return (
    <div className="premium-card bg-card border rounded-2xl p-8 shadow-xl relative overflow-hidden group transition-all hover:scale-[1.01]">
      {/* Decorative Orbs */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/30 transition-all duration-700"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-heading font-extrabold text-foreground flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              Helm Intelligence
            </h3>
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleRefresh}
                    disabled={loading}
                    className="p-1.5 md:p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    title="Refresh Analysis"
                >
                    <RefreshCcw className={`w-3.5 h-3.5 md:w-4 md:h-4 ${loading ? 'animate-spin' : 'group-hover/btn:rotate-180 transition-transform duration-500'}`} />
                </button>
                <div className="flex items-center gap-2 bg-accent/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-accent/20">
                    <BrainCircuit className="w-3 h-3 text-accent" />
                    <span className="text-[10px] text-accent font-bold uppercase tracking-widest">AI Engine</span>
                </div>
            </div>
        </div>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-5 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
            {insights.insights && insights.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-4 text-foreground text-[13.5px] leading-relaxed group/item">
                <div className="mt-2 min-w-[6px] h-[6px] rounded-full bg-accent shadow-[0_0_10px_rgba(14,165,233,0.5)] flex-shrink-0 transition-transform group-hover/item:scale-125" />
                <div className="flex-1">
                  <ReactMarkdown 
                    className="prose dark:prose-invert max-w-none text-[13.5px] prose-p:my-0 prose-p:leading-relaxed prose-strong:text-accent font-medium"
                    components={{
                      // eslint-disable-next-line no-unused-vars
                      p: ({node, ...props}) => <p className="mb-0" {...props} />
                    }}
                  >
                    {insight}
                  </ReactMarkdown>
                </div>
              </div>
            ))}
          </div>

          {insights.recommendation && (
            <div className="mt-auto pt-6 border-t border-border">
              <div className="bg-secondary border border-border rounded-xl p-5 backdrop-blur-md hover:bg-secondary/80 transition-colors">
                <h4 className="text-accent font-bold text-[10px] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Technical Recommendation
                </h4>
                <div className="text-foreground text-[13px] leading-relaxed font-semibold italic">
                  <ReactMarkdown 
                     className="prose dark:prose-invert max-w-none text-[13px] prose-p:my-0"
                     components={{
                        // eslint-disable-next-line no-unused-vars
                        p: ({node, ...props}) => <p className="mb-0" {...props} />
                     }}
                  >
                    {insights.recommendation}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
