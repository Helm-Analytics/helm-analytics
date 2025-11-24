import React from 'react';
import { Sparkles, Lightbulb } from 'lucide-react';
import { useDashboardStore } from '../store/useDashboardStore';

const InsightsCard = () => {
  const { aiInsights: insights, isLoadingAI: loading } = useDashboardStore();

  if (loading && !insights) {
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-6 shadow-lg animate-pulse h-64 flex flex-col justify-center items-center">
        <Sparkles className="w-8 h-8 text-indigo-400 mb-4 animate-spin-slow" />
        <span className="text-slate-400 text-sm">Analyzing your data with Gemini AI...</span>
      </div>
    );
  }

  if (!insights) {
    return null; 
  }

  return (
    <div className="bg-gradient-to-br from-indigo-900/30 to-slate-800 border border-indigo-500/30 rounded-xl p-6 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-32 h-32 text-indigo-400" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          AI Insights
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            {insights.insights && insights.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-indigo-500" />
                <p>{insight}</p>
              </div>
            ))}
          </div>

          {insights.recommendation && (
            <div className="mt-6 bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
              <h4 className="text-indigo-300 font-semibold text-sm mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Recommendation
              </h4>
              <p className="text-indigo-100 text-sm italic">
                "{insights.recommendation}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsCard;
