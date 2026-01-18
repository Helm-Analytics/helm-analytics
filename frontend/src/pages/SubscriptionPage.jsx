import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Crown, Zap, Check, ArrowRight, Loader2 } from 'lucide-react';

const CLOUD_API_URL = 'https://cloud.helm-analytics.com';

const plans = [
  { id: 'free', name: 'Hobby', price: '$0', monthly: '/month', eventLimit: '10,000', features: ['10,000 events/month', '30-day data retention', '3 Websites', 'Community support'] },
  { id: 'pro', name: 'Pro', price: '$12', monthly: '/month', eventLimit: '100,000', features: ['100,000 events/month', '12-month data retention', 'Unlimited Websites', 'Priority email support', 'Session Replays', 'Custom Events'], popular: true },
  { id: 'growth', name: 'Growth', price: '$25', monthly: '/month', eventLimit: '500,000', features: ['500,000 events/month', '12-month data retention', 'Unlimited Websites', 'Dedicated support', 'Everything in Pro', 'Bot Detection'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', monthly: '', eventLimit: 'Unlimited', features: ['Unlimited events', '12-month data retention', 'Unlimited Websites', 'Dedicated account manager', 'Everything in Growth', 'SLA guarantee'] },
];

const SubscriptionPage = () => {
  const { selectedSite } = useOutletContext();
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    fetchUserPlan();
  }, []);

  const fetchUserPlan = async () => {
    try {
      // Get email from localStorage or session
      const email = localStorage.getItem('userEmail');
      if (!email) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${CLOUD_API_URL}/api/user/plan?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setUserPlan(data);
      }
    } catch (err) {
      console.error('Failed to fetch plan:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (planId) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:hello@helm-analytics.com?subject=Enterprise%20Inquiry';
      return;
    }

    setUpgrading(true);
    try {
      const email = localStorage.getItem('userEmail');
      const response = await fetch(`${CLOUD_API_URL}/api/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, plan: planId, password: '' }),
      });

      const data = await response.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err) {
      console.error('Upgrade failed:', err);
    } finally {
      setUpgrading(false);
    }
  };

  const currentPlanIndex = plans.findIndex(p => p.id === (userPlan?.plan || 'free'));
  const usagePercent = userPlan ? Math.min((userPlan.events_used / userPlan.events_limit) * 100, 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-muted-foreground mt-1">Manage your plan and billing</p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-muted-foreground">Current Plan</span>
            </div>
            <h2 className="text-2xl font-bold">{userPlan?.plan_name || 'Hobby'}</h2>
            <p className="text-muted-foreground">{userPlan?.plan_price || '$0/month'}</p>
          </div>
          {userPlan?.plan !== 'enterprise' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Upgrade
            </button>
          )}
        </div>

        {/* Usage Meter */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Events This Month</span>
            <span className="font-medium">{userPlan?.events_used?.toLocaleString() || 0} / {userPlan?.events_limit?.toLocaleString() || '10,000'}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-accent'}`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {usagePercent >= 80 && <span className="text-red-500">⚠️ Running low on events. Consider upgrading.</span>}
          </p>
        </div>

        {/* Current Features */}
        <div className="mt-6">
          <h3 className="font-medium mb-3">Your Features</h3>
          <div className="grid grid-cols-2 gap-2">
            {userPlan?.features?.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-green-500" />
                {feature}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="text-xl font-bold mb-4">All Plans</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, index) => {
            const isCurrent = plan.id === (userPlan?.plan || 'free');
            const isEnterprise = plan.id === 'enterprise';
            const isUpgrade = index > currentPlanIndex || isEnterprise;
            
            return (
              <div 
                key={plan.id}
                className={`relative bg-card border rounded-xl p-5 transition-all ${
                  plan.popular ? 'border-accent shadow-lg ring-1 ring-accent/20' : 'border-border'
                } ${isCurrent ? 'bg-accent/5' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    Current
                  </div>
                )}
                
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.monthly}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{plan.eventLimit === 'Unlimited' ? 'Unlimited events' : `${plan.eventLimit} events/mo`}</p>
                
                <ul className="mt-4 space-y-2">
                  {plan.features.slice(0, 4).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="w-3 h-3 text-green-500 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || (!isUpgrade && !isEnterprise) || upgrading}
                  className={`w-full mt-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    isCurrent 
                      ? 'bg-secondary text-muted-foreground cursor-default'
                      : isEnterprise
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : isUpgrade
                          ? 'bg-accent text-white hover:bg-accent/90'
                          : 'bg-secondary text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {isCurrent ? 'Current Plan' : isEnterprise ? 'Contact Us' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
          <div className="bg-card border border-border rounded-2xl p-6 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-4">Upgrade Your Plan</h2>
            <p className="text-muted-foreground mb-6">Unlock more events and premium features</p>
            
            <div className="grid md:grid-cols-3 gap-4">
              {plans.filter(p => plans.findIndex(pl => pl.id === p.id) > currentPlanIndex).map(plan => (
                <div key={plan.id} className={`border rounded-xl p-4 ${plan.popular ? 'border-accent' : 'border-border'}`}>
                  <h3 className="font-bold">{plan.name}</h3>
                  <p className="text-2xl font-bold mt-1">{plan.price}<span className="text-sm text-muted-foreground">/mo</span></p>
                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading}
                    className="w-full mt-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 disabled:opacity-50"
                  >
                    {upgrading ? 'Processing...' : 'Select'}
                  </button>
                </div>
              ))}
            </div>

            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="mt-4 text-muted-foreground hover:text-foreground text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
