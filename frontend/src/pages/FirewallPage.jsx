import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Shield, Plus, Trash2, AlertTriangle, Globe, Hash, Server, Copy, Check, Cpu, Hexagon } from 'lucide-react';

const FirewallPage = () => {
  const { selectedSite } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [ruleType, setRuleType] = useState('ip');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    if (selectedSite?.id) {
      fetchRules();
    }
  }, [selectedSite?.id, fetchRules]);



  const fetchRules = useCallback(async () => {
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
  }, [selectedSite?.id]);

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
                 <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    className="w-full h-full min-h-[44px] px-4 py-2.5 bg-background border border-border rounded-xl text-sm font-medium text-foreground appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all"
                 >
                    <option value="ip">IP Address</option>
                    <option value="country">Country</option>
                    <option value="asn">ASN / Data Center</option>
                 </select>
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