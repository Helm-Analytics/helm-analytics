import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, inverse = false, isQualityScore = false }) => {
  // Parse numeric value for logic (assuming value might be "123", "45%", "2.5s")
  const numericValue = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
  
  // Change Logic
  // Default: Increase (+) is Good (Green), Decrease (-) is Bad (Red)
  // Inverse: Increase (+) is Bad (Red), Decrease (-) is Good (Green)
  let isChangeGood = change >= 0;
  if (inverse) isChangeGood = !isChangeGood;

    const changeColor = isChangeGood ? "text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
    const changeIcon = change >= 0 ? "↑" : "↓";
  
    // Quality Score Logic
    let qualityColor = "text-foreground";
    let progressBarColor = "bg-accent";
    
    if (isQualityScore) {
        if (numericValue >= 80) {
            qualityColor = "text-emerald-600 dark:text-emerald-400";
            progressBarColor = "bg-emerald-500";
        } else if (numericValue >= 50) {
            qualityColor = "text-amber-600 dark:text-amber-400";
            progressBarColor = "bg-amber-500";
        } else {
            qualityColor = "text-rose-600 dark:text-rose-400";
            progressBarColor = "bg-rose-500";
        }
    }
  
    // Web Vitals Color Logic
    if (title.includes("LCP")) {
        if (numericValue <= 2500) qualityColor = "text-emerald-600 dark:text-emerald-400";
        else if (numericValue <= 4000) qualityColor = "text-amber-600 dark:text-amber-400";
        else qualityColor = "text-rose-600 dark:text-rose-400";
    } else if (title.includes("CLS")) {
         if (numericValue <= 0.1) qualityColor = "text-emerald-600 dark:text-emerald-400";
        else if (numericValue <= 0.25) qualityColor = "text-amber-600 dark:text-amber-400";
        else qualityColor = "text-rose-600 dark:text-rose-400";
    } else if (title.includes("FID")) {
         if (numericValue <= 100) qualityColor = "text-emerald-600 dark:text-emerald-400";
        else if (numericValue <= 300) qualityColor = "text-amber-600 dark:text-amber-400";
        else qualityColor = "text-rose-600 dark:text-rose-400";
    }
  
  
    return (
      <div className="premium-card flex flex-col justify-between h-full relative overflow-hidden group">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border border-border/50 ${isQualityScore ? 'bg-secondary' : 'bg-primary/5 dark:bg-accent/10'}`}>
              {React.createElement(Icon, { className: `w-5 h-5 ${isQualityScore ? qualityColor : 'text-accent'}` })}
            </div>
            <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">{title}</p>
          </div>
          {change !== undefined && change !== null && (
            <div className={`flex items-center text-[10px] font-bold ${changeColor} bg-secondary/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-border/50`}>
              <span>{changeIcon} {Math.abs(change).toFixed(isQualityScore ? 0 : 1)}{isQualityScore ? '' : '%'}{isQualityScore && ' pts'}</span>
            </div>
          )}
        </div>
  
        <div className="mt-auto">
          <div className={`text-4xl font-heading font-extrabold ${qualityColor}`}>
              {value}
          </div>
          
          {/* Quality Score Progress Bar */}
          {isQualityScore && (
              <div className="w-full bg-secondary h-2 mt-4 rounded-full overflow-hidden border border-border/30">
                  <div 
                      className={`h-full rounded-full ${progressBarColor} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                      style={{ width: `${Math.min(numericValue, 100)}%` }}
                  ></div>
              </div>
          )}
        </div>
        
        {/* Subtle hover effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>
      </div>
    );
  };
  
  export default StatCard;
  