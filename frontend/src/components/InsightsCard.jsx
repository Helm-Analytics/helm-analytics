import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useDashboardStore } from '../store/useDashboardStore';

const InsightsCard = () => {
  const { aiInsights: insights, isLoadingAI: loading } = useDashboardStore();

  if (loading && !insights) {
    return (
      <div className="premium-card bg-[#0F172A] border-accent/20 rounded-2xl p-8 shadow-2xl animate-pulse h-72 flex flex-col justify-center items-center overflow-hidden relative">
        <div className="absolute inset-0 bg-accent/5 animate-pulse"></div>
        <Sparkles className="w-10 h-10 text-accent mb-4 animate-spin-slow relative z-10" />
        <span className="text-slate-400 text-xs font-bold uppercase tracking-widest relative z-10">Syncing Intelligence...</span>
      </div>
    );
  }

  if (!insights) {
    return null; 
  }

  return (
    <div className="premium-card bg-[#0F172A] border-accent/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="w-40 h-40 text-accent" />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-heading font-extrabold text-white flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-accent" />
              Helm Intelligence
            </h3>
            <span className="text-[10px] bg-accent/20 text-accent px-2 py-1 rounded-md font-bold uppercase tracking-widest border border-accent/30">Gemini Powered</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            {insights.insights && insights.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-4 text-slate-300 text-[13px] leading-relaxed">
                <div className="mt-1.5 min-w-[8px] h-[8px] rounded-full bg-accent shadow-[0_0_8px_rgba(14,165,233,0.5)] flex-shrink-0" />
                <div className="flex-1">
                  <ReactMarkdown 
                    className="prose prose-invert max-w-none text-[13px] prose-p:my-0 prose-p:leading-relaxed prose-strong:text-accent font-medium"
                    components={{
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
            <div className="mt-8 bg-accent/5 border border-accent/10 rounded-2xl p-6 backdrop-blur-sm">
              <h4 className="text-accent font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Command Recommendation
              </h4>
              <div className="text-slate-200 text-[13px] italic leading-relaxed font-medium">
                <ReactMarkdown 
                   className="prose prose-invert max-w-none text-[13px] prose-p:my-0"
                   components={{
                      p: ({node, ...props}) => <p className="mb-0" {...props} />
                   }}
                >
                  {insights.recommendation}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
