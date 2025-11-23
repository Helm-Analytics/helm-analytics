import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Shield, Plus, Trash2, AlertTriangle, Globe, Hash, Server } from 'lucide-react';

const FirewallPage = () => {
  const { selectedSite } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [ruleType, setRuleType] = useState('ip');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [shieldMode, setShieldMode] = useState(false);

  useEffect(() => {
    if (selectedSite) {
      setShieldMode(selectedSite.shieldMode || false);
      fetchRules();
    }
  }, [selectedSite]);

  const toggleShieldMode = async () => {
      try {
          const newMode = !shieldMode;
          setShieldMode(newMode); // Optimistic update
          await api.updateSite(selectedSite.id, { ...selectedSite, shieldMode: newMode });
      } catch (err) {
          console.error("Failed to toggle Shield Mode:", err);
          setShieldMode(!shieldMode); // Revert
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
      fetchRules(); // Refresh the list
    } catch (err) {
      setError('Failed to add rule.');
      console.error(err);
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await api.deleteFirewallRule(selectedSite.id, ruleId);
      fetchRules(); // Refresh the list
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
        <div className="flex items-center justify-center h-64 text-slate-400">
            Select a site to manage firewall rules.
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
                <Shield className="w-8 h-8 text-indigo-500" />
                Sentinel Firewall
            </h1>
            <p className="text-slate-400 mt-1 max-w-2xl">
                Configure blocking rules and active defense mechanisms.
            </p>
        </div>
        
        {/* Shield Mode Toggle */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${shieldMode ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
            <div className="flex flex-col">
                <span className={`text-sm font-bold ${shieldMode ? 'text-red-400' : 'text-slate-300'}`}>
                    Shield Mode
                </span>
                <span className="text-xs text-slate-500">
                    {shieldMode ? "Active: Blocking low-trust IPs" : "Inactive"}
                </span>
            </div>
            <button 
                onClick={toggleShieldMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${shieldMode ? 'bg-red-500' : 'bg-slate-600'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${shieldMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

      {/* Honey Pot Card */}
      <div className="bg-gradient-to-br from-amber-900/20 to-slate-800 border border-amber-500/20 rounded-xl p-6 shadow-lg">
          <h2 className="text-lg font-bold text-amber-400 mb-2 flex items-center gap-2">
              <span className="text-xl">🍯</span> Honey Pot Module
          </h2>
          <p className="text-sm text-slate-400 mb-4">
              Catch bots automatically by adding this invisible link to your website footer. 
              Real humans won't see it, but scrapers will follow it and get banned immediately.
          </p>
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 font-mono text-xs text-amber-200/80 break-all select-all">
            {`<a href="https://api-sentinel.getmusterup.com/trap?siteId=${selectedSite.id}" style="display:none" aria-hidden="true">Admin</a>`}
          </div>
      </div>

      {/* Add Rule Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Add Blocking Rule
        </h2>
        <form onSubmit={handleAddRule} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative">
             <select
                value={ruleType}
                onChange={(e) => setRuleType(e.target.value)}
                className="appearance-none bg-slate-900 border border-slate-600 text-slate-200 py-2 pl-3 pr-10 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
                <option value="ip">IP Address</option>
                <option value="country">Country Code</option>
                <option value="asn">ASN (Organization)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
         
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={ruleType === 'ip' ? "e.g. 192.168.1.1" : ruleType === 'country' ? "e.g. US, CN, RU" : "e.g. Google Cloud"}
            className="flex-grow px-3 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
          />
          
          <button 
            type="submit" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors shadow-md w-full sm:w-auto flex justify-center"
          >
            Add Rule
          </button>
        </form>
        {error && (
            <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-400/10 p-3 rounded-md border border-red-400/20">
                <AlertTriangle className="w-4 h-4" />
                {error}
            </div>
        )}
      </div>

      {/* Existing Rules Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-slate-700">
            <h2 className="text-xl font-bold text-slate-200">Active Rules</h2>
        </div>
        
        {loading ? (
             <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
             </div>
        ) : rules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700">
              <thead className="bg-slate-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700 bg-slate-800">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-slate-700 rounded text-indigo-400">{getRuleIcon(rule.rule_type)}</span>
                            <span className="uppercase font-mono text-xs">{rule.rule_type}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-white">
                        {rule.value}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {rule.reason || <span className="text-slate-600 italic">Manual</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors"
                        title="Delete rule"
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
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400">No firewall rules defined yet.</p>
            <p className="text-slate-500 text-sm mt-1">Traffic is currently unrestricted.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirewallPage;