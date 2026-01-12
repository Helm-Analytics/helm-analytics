import React from 'react';
import { Lock, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';

const UpgradePrompt = ({ 
  feature, 
  requiredPlan = "Pro", 
  currentPlan = "Hobby",
  className = "" 
}) => {
  const getPlanColor = (plan) => {
    switch(plan.toLowerCase()) {
      case 'pro': return 'from-blue-500 to-cyan-500';
      case 'growth': return 'from-purple-500 to-pink-500';
      case 'business': return 'from-orange-500 to-red-500';
      default: return 'from-primary to-accent';
    }
  };

  const getPlanPrice = (plan) => {
    switch(plan.toLowerCase()) {
      case 'pro': return '$12';
      case 'growth': return '$25';
      case 'business': return '$50';
      default: return '$12';
    }
  };

  return (
    <div className={`premium-card relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getPlanColor(requiredPlan)} opacity-5`}></div>
      
      <div className="relative z-10">
        {/* Lock Icon */}
        <div className="flex items-center justify-center w-16 h-16 mb-6 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-heading font-extrabold text-center mb-3">
          {feature}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-center mb-6 px-4">
          Unlock this premium feature with the <span className="font-bold text-foreground">{requiredPlan} Plan</span> and take your analytics to the next level.
        </p>

        {/* Features List */}
        <div className="bg-secondary/30 rounded-xl p-5 mb-6 space-y-3">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground">Advanced Insights</p>
              <p className="text-xs text-muted-foreground">Get deeper understanding of user behavior</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-foreground">Growth Tools</p>
              <p className="text-xs text-muted-foreground">Unlock features that scale with you</p>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-2">Starting at</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className={`text-4xl font-black bg-gradient-to-r ${getPlanColor(requiredPlan)} bg-clip-text text-transparent`}>
              {getPlanPrice(requiredPlan)}
            </span>
            <span className="text-muted-foreground text-sm">/month</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 italic">Billed in NGN</p>
        </div>

        {/* CTA Button */}
        <a
          href="https://helm-analytics.com/pricing"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 h-12 bg-gradient-to-r from-primary to-accent text-white font-bold rounded-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/30 active:scale-100 group"
        >
          <span>Upgrade to {requiredPlan}</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </a>

        {/* Fine print */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          14-day free trial • Cancel anytime • No credit card required
        </p>
      </div>
    </div>
  );
};

export default UpgradePrompt;
