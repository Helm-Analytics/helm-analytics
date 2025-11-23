import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { Shield, Plus, Trash2, AlertTriangle, Globe, Hash, Server } from 'lucide-react';

const FirewallPage = () => {
  const { selectedSite } = useOutletContext();
  const [rules, setRules] = useState([]);
  const [ruleType, setRuleType] = useState('ip');
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false); // Start false, fetch will set true
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedSite) {
      fetchRules();
    }
  }, [selectedSite]);

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
      await api.addFirewallRule(selectedSite.id, { rule_type: ruleType, value });
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
      <div>
          <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-500" />
            Sentinel Firewall
          </h1>
          <p className="text-slate-400 mt-1 max-w-3xl">
            Configure rules to block unwanted traffic from being recorded. 
            These rules filter events based on IP, Country, or ASN (Data Center) before they hit your analytics database.
          </p>
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