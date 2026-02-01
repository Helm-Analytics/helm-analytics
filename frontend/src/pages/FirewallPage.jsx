import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Shield, Plus, Trash2, AlertTriangle, Globe, Hash, Server, Copy, Check, Cpu, Hexagon } from 'lucide-react';
import PremiumSelect from '../components/PremiumSelect';

const FirewallPage = () => {
  const { selectedSite } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [ruleType, setRuleType] = useState('ip');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shieldMode, setShieldMode] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (selectedSite) {
      setShieldMode(selectedSite.shieldMode || false);
      fetchRules();
      fetchSuggestions();
    }
  }, [selectedSite]);

  const fetchSuggestions = async () => {
      try {
          const data = await api.getFirewallSuggestions(selectedSite.id);
          setSuggestions(data || []);
      } catch (err) {
          console.error("Failed to fetch AI suggestions:", err);
      }
  };

  const handleAcceptSuggestion = async (suggestion) => {
      try {
          await api.addFirewallRule(selectedSite.id, {
              rule_type: 'ip',
              value: suggestion.ip,
              reason: `AI Block: ${suggestion.reason}`
          });
          setSuggestions(prev => prev.filter(s => s.ip !== suggestion.ip));
          fetchRules();
      } catch (err) {
          setError("Failed to apply AI block.");
      }
  };

  const toggleShieldMode = async () => {
      try {
          const newMode = !shieldMode;
          setShieldMode(newMode);
          await api.updateSite(selectedSite.id, { ...selectedSite, shieldMode: newMode });
      } catch (err) {
          console.error("Failed to toggle Shield Mode:", err);
          setShieldMode(!shieldMode);
          setError("Failed to update Shield Mode settings.");
      }
  };

  const fetchRules = async () => {
    try {
      setLoading(true);
      const fetchedRules = await api.getFirewallRules(selectedSite.id);
      setRules(fetchedRules || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch firewall rules.');
      console.error(err);
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Rule value cannot be empty.');
      return;
    }
    try {
      await api.addFirewallRule(selectedSite.id, { rule_type: ruleType, value, reason: 'Manual Block' });
      setValue('');
      fetchRules();
    } catch (err) {
      setError('Failed to add rule.');
      console.error(err);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.deleteFirewallRule(selectedSite.id, ruleId);
      fetchRules();
    } catch (err) {
      setError('Failed to delete rule.');
      console.error(err);
    }
  };

  const getRuleIcon = (type) => {
      switch(type) {
          case 'ip': return <Hash className="w-4 h-4" />;
          case 'country': return <Globe className="w-4 h-4" />;
          case 'asn': return <Server className="w-4 h-4" />;
          default: return <Shield className="w-4 h-4" />;
      }
  };

  if (!selectedSite) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center max-w-md p-8 rounded-2xl border border-border bg-card/50">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-accent/20">
            <Shield className="w-8 h-8 text-accent/50" />
          </div>
          <h2 className="text-xl font-heading font-bold text-foreground mb-2">No site selected</h2>
          <p className="text-muted-foreground text-sm">Select a website from the sidebar to manage security rules and active defense.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
        <div>
          <div className="flex items-center space-x-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
            <Shield className="w-4 h-4" />
            <span>Active Defense</span>
          </div>
          <h1 className="text-4xl font-heading font-bold text-foreground tracking-tight">
            Security Firewall
          </h1>
          <p className="text-muted-foreground mt-1">Configure automated mitigation and manual blocking rules.</p>
        </div>
        
        {/* Shield Mode Toggle */}
        <div 
          id="tut-shield-toggle" 
          className={`flex items-center gap-4 px-6 py-4 rounded-2xl border transition-all duration-300 shadow-sm ${
            shieldMode 
              ? 'bg-accent/10 border-accent/30 shadow-accent/10' 
              : 'bg-card border-border'
          }`}
        >
            <div className="flex flex-col">
                <span className={`text-xs font-bold uppercase tracking-wider ${shieldMode ? 'text-accent' : 'text-muted-foreground'}`}>
                    Shield Mode
                </span>
                <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                    {shieldMode ? "Active: Blocking low-trust traffic" : "Inactive: Detection only"}
                </span>
            </div>
            <button 
                onClick={toggleShieldMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background ${
                  shieldMode ? 'bg-accent' : 'bg-muted'
                }`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${shieldMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          {/* Add Rule Section */}
          <div className="p-6 rounded-2xl border border-border bg-card">
            <h2 className="text-lg font-heading font-bold text-foreground mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-accent" />
                Add Mitigation Rule
            </h2>
            <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-3">
                 <PremiumSelect
                    value={ruleType}
                    onChange={setRuleType}
                    options={[
                        { value: 'ip', label: 'IP Address', icon: Hash },
                        { value: 'country', label: 'Country', icon: Globe },
                        { value: 'asn', label: 'ASN / Data Center', icon: Server }
                    ]}
                 />
              </div>
             
              <div className="md:col-span-6">
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={ruleType === 'ip' ? "e.g. 192.168.1.1" : ruleType === 'country' ? "e.g. US, CN, RU" : "e.g. Google Cloud"}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                />
              </div>
              
              <div className="md:col-span-3">
                <button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/10"
                >
                  Apply Rule
                </button>
              </div>
            </form>
            {error && (
                <div className="mt-4 flex items-center gap-3 text-destructive text-xs font-bold bg-destructive/10 border border-destructive/20 p-3 rounded-xl animate-in slide-in-from-top-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}
          </div>

          {/* Rules Table */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-lg font-heading font-bold text-foreground">Active Mitigations</h2>
            </div>
            
            {loading ? (
                 <div className="flex justify-center p-12">
                    <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
                 </div>
            ) : rules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Target</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Identifier</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Context</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {rules.map((rule) => (
                      <tr key={rule.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-accent/10 rounded-lg text-accent group-hover:scale-110 transition-transform">
                                  {getRuleIcon(rule.rule_type)}
                                </div>
                                <span className="uppercase font-bold text-[10px] tracking-wider text-muted-foreground">{rule.rule_type}</span>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-mono text-sm text-foreground font-bold">{rule.value}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 bg-muted text-muted-foreground rounded-md text-[10px] font-bold uppercase tracking-tight">
                              {rule.reason || "Manual Block"}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteRule(rule.id)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                            title="Remove mitigation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-16 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-base font-heading font-bold text-muted-foreground">No active blocks</h3>
                <p className="text-muted-foreground/60 text-sm mt-1">Traffic is currently flowing according to default policies.</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Column */}
        <div className="space-y-8">

           {/* AI Suggestions */}
           <div className="relative group overflow-hidden rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5 backdrop-blur-xl p-6">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-accent/20 rounded-xl shadow-lg ring-1 ring-accent/30">
                          <Cpu className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                          <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">Helm Intelligence</h2>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Automated Threat Detection</p>
                      </div>
                  </div>
                  
                  {suggestions.length > 0 ? (
                      <div className="space-y-3">
                          {suggestions.map((suggestion, idx) => (
                              <div key={idx} className="bg-card/50 border border-border rounded-xl p-3 backdrop-blur-md">
                                  <div className="flex justify-between items-start mb-2">
                                      <div>
                                          <div className="flex items-center gap-2">
                                              <span className="font-mono text-xs font-bold text-foreground">{suggestion.ip}</span>
                                              <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                                suggestion.confidence === 'High' 
                                                  ? 'bg-destructive/20 text-destructive' 
                                                  : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                                              }`}>
                                                  {suggestion.confidence} Conf.
                                              </span>
                                          </div>
                                          <p className="text-[10px] text-muted-foreground mt-1">{suggestion.reason} • {suggestion.country}</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      <button 
                                          onClick={() => handleAcceptSuggestion(suggestion)}
                                          className="flex-1 bg-destructive/10 hover:bg-destructive/20 text-destructive text-[10px] font-bold uppercase tracking-wide py-2 rounded-lg transition-colors border border-destructive/20"
                                      >
                                          Block IP
                                      </button>
                                      <button 
                                          onClick={() => setSuggestions(prev => prev.filter(s => s.ip !== suggestion.ip))}
                                          className="flex-1 bg-muted hover:bg-muted/80 text-muted-foreground text-[10px] font-bold uppercase tracking-wide py-2 rounded-lg transition-colors"
                                      >
                                          Ignore
                                      </button>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-8">
                          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                              <Check className="w-8 h-8 text-emerald-500" />
                          </div>
                          <p className="text-sm font-bold text-foreground mb-1">Defense Systems Active</p>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] mx-auto">No abnormal behavior patterns detected in the last 24h cycle.</p>
                      </div>
                  )}
              </div>
           </div>

           {/* Honey Pot Sidebar */}
           <div className="relative overflow-hidden rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-xl p-6">
              <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                     <div className="p-3 bg-yellow-500/20 rounded-xl shadow-lg ring-1 ring-yellow-500/30">
                        <Hexagon className="w-6 h-6 text-yellow-500" />
                     </div>
                     <div>
                        <h2 className="text-xl font-heading font-bold text-foreground tracking-tight">Spider Trap</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">Honeypot Implementation</p>
                     </div>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-6 font-medium">
                      Catch automated crawlers by adding this invisible gateway to your site's header. 
                      Bots that interact with this link will be identified and mitigated instantly.
                  </p>
                  <div className="relative group mb-4">
                      <div className="bg-background border border-border rounded-xl p-4 font-mono text-[10px] text-foreground break-all select-all">
                        {`<a href="https://api.helm-analytics.com/trap?siteId=${selectedSite.id}" style="display:none" aria-hidden="true">Admin Navigation</a>`}
                      </div>
                      <button 
                            onClick={() => copyToClipboard(`<a href="https://api.helm-analytics.com/trap?siteId=${selectedSite.id}" style="display:none" aria-hidden="true">Admin Navigation</a>`)}
                            className="absolute top-2 right-2 p-2 bg-muted hover:bg-muted/80 rounded-lg transition-all border border-border text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100"
                            title="Copy Snippet"
                        >
                            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      </button>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-500 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 w-fit px-3 py-1 rounded-full border border-emerald-500/20">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span>Module Ready</span>
                  </div>
              </div>
           </div>

           {/* Info Card */}
           <div className="p-6 rounded-2xl border border-border bg-card">
               <h3 className="text-base font-heading font-bold mb-4 text-foreground">Firewall Intelligence</h3>
               <div className="space-y-4">
                   <div className="flex gap-4 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors">
                       <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Hash className="w-4 h-4 text-accent" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">IP Filtering</p>
                          <p className="text-[10px] text-muted-foreground">Block specific IP addresses from accessing your site.</p>
                       </div>
                   </div>
                   <div className="flex gap-4 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors">
                       <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4 text-accent" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">Geo Blocking</p>
                          <p className="text-[10px] text-muted-foreground">Block traffic originating from specific ISO country codes.</p>
                       </div>
                   </div>
                   <div className="flex gap-4 p-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors">
                       <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Server className="w-4 h-4 text-accent" />
                       </div>
                       <div>
                          <p className="text-xs font-bold text-foreground mb-0.5">ASN Blocking</p>
                          <p className="text-[10px] text-muted-foreground">Blacklist entire data centers or hosting providers.</p>
                       </div>
                   </div>
               </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FirewallPage;