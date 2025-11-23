import React from 'react';

const StatCard = ({ title, value, icon: CardIcon, change, inverse = false, isQualityScore = false }) => {
  // Parse numeric value for logic (assuming value might be "123", "45%", "2.5s")
  const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  
  // Change Logic
  // Default: Increase (+) is Good (Green), Decrease (-) is Bad (Red)
  // Inverse: Increase (+) is Bad (Red), Decrease (-) is Good (Green)
  let isChangeGood = change >= 0;
  if (inverse) isChangeGood = !isChangeGood;

  const changeType = change >= 0 ? "positive" : "negative";
  const changeColor = isChangeGood ? "text-green-400" : "text-red-400";
  const changeIcon = change >= 0 ? "↑" : "↓";

  // Quality Score Logic
  let qualityColor = "text-slate-200";
  let progressBarColor = "bg-indigo-500";
  
  if (isQualityScore) {
      if (numericValue >= 80) {
          qualityColor = "text-green-400";
          progressBarColor = "bg-green-500";
      } else if (numericValue >= 50) {
          qualityColor = "text-yellow-400";
          progressBarColor = "bg-yellow-500";
      } else {
          qualityColor = "text-red-400";
          progressBarColor = "bg-red-500";
      }
  }

  // Web Vitals Color Logic (Heuristic based on title content or explicit prop could be better, but simple check for now)
  if (title.includes("LCP")) {
      if (numericValue <= 2500) qualityColor = "text-green-400";
      else if (numericValue <= 4000) qualityColor = "text-yellow-400";
      else qualityColor = "text-red-400";
  } else if (title.includes("CLS")) {
       if (numericValue <= 0.1) qualityColor = "text-green-400";
      else if (numericValue <= 0.25) qualityColor = "text-yellow-400";
      else qualityColor = "text-red-400";
  } else if (title.includes("FID")) {
       if (numericValue <= 100) qualityColor = "text-green-400";
      else if (numericValue <= 300) qualityColor = "text-yellow-400";
      else qualityColor = "text-red-400";
  }


  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300 flex flex-col justify-between h-full relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${isQualityScore ? 'bg-slate-700' : 'bg-indigo-600/20'}`}>
            <CardIcon className={`w-6 h-6 ${isQualityScore ? qualityColor : 'text-indigo-400'}`} />
          </div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
        </div>
        {change !== undefined && change !== null && (
          <div className={`flex items-center text-xs font-bold ${changeColor} bg-slate-900/50 px-2 py-1 rounded-full`}>
            <span>{changeIcon} {Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div>
        <div className={`text-3xl font-bold ${qualityColor}`}>
            {value}
        </div>
        
        {/* Quality Score Progress Bar */}
        {isQualityScore && (
            <div className="w-full bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
                <div 
                    className={`h-full rounded-full ${progressBarColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${Math.min(numericValue, 100)}%` }}
                ></div>
            </div>
        )}
      </div>
      
      {/* Background decoration */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
    </div>
  );
};

export default StatCard;