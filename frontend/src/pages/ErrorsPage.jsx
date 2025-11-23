import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { AlertTriangle, AlertOctagon, Terminal, Clock } from 'lucide-react';

const ErrorsPage = () => {
  const { selectedSite } = useOutletContext();
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSite) {
      fetchErrors();
    }
  }, [selectedSite]);

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const data = await api.getErrorStats(selectedSite.id);
      setErrors(data || []);
    } catch (err) {
      console.error("Failed to fetch errors:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedSite) return <div className="text-center p-8 text-slate-400">Select a site to view errors.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-200 flex items-center gap-3">
            <AlertOctagon className="w-8 h-8 text-red-500" />
            Issue Detection
        </h1>
        <p className="text-slate-400 mt-1">Track JavaScript errors affecting your users.</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-lg">
         {loading ? (
             <div className="p-12 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
             </div>
         ) : errors.length > 0 ? (
             <table className="w-full text-left border-collapse">
                 <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                     <tr>
                         <th className="p-4 font-semibold">Error Message</th>
                         <th className="p-4 font-semibold">Location</th>
                         <th className="p-4 font-semibold text-right">Events</th>
                         <th className="p-4 font-semibold text-right">Last Seen</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-700">
                     {errors.map((err, idx) => (
                         <tr key={idx} className="hover:bg-slate-700/30 transition-colors group">
                             <td className="p-4">
                                 <div className="flex items-start gap-3">
                                     <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                                     <div>
                                         <div className="font-mono text-sm text-red-200 break-all">{err.message}</div>
                                         <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                             <Terminal className="w-3 h-3" />
                                             {err.source || 'Unknown Script'}
                                         </div>
                                     </div>
                                 </div>
                             </td>
                             <td className="p-4 text-sm text-slate-400 font-mono">
                                 Line: {err.lineNo}
                             </td>
                             <td className="p-4 text-right">
                                 <span className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs font-bold">
                                     {err.count}
                                 </span>
                             </td>
                             <td className="p-4 text-right text-sm text-slate-500 flex items-center justify-end gap-2">
                                 <Clock className="w-3 h-3" />
                                 {new Date(err.lastSeen).toLocaleString()}
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         ) : (
             <div className="p-16 text-center">
                 <div className="w-16 h-16 bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                     <AlertTriangle className="w-8 h-8 text-green-500 opacity-50" />
                 </div>
                 <h3 className="text-lg font-medium text-slate-200">No Issues Detected</h3>
                 <p className="text-slate-500 mt-2">Your site appears to be running error-free!</p>
             </div>
         )}
      </div>
    </div>
  );
};

export default ErrorsPage;
