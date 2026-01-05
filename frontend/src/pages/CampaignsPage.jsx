import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { api } from '../api';
import { 
  BarChart3, 
  Target, 
  Share2, 
  Link as LinkIcon, 
  Layers,
  ArrowUpRight,
  RefreshCw,
  ExternalLink,
  Search
} from 'lucide-react';

const CampaignsPage = () => {
  const { selectedSite } = useOutletContext();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!selectedSite?.id) return;
    setLoading(true);
    try {
      const data = await api.getCampaignStats(selectedSite.id, days);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching campaign stats:', err);
      setError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedSite?.id, days]);

  if (!selectedSite) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <Target size={48} className="mb-4 opacity-20" />
        <p>Please select a site to view campaign analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Target className="text-sky-400" size={24} />
            Campaigns & Attribution
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track marketing performance and UTM attribution
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700/50">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  days === d 
                    ? 'bg-sky-500 text-white shadow-lg' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button 
            onClick={fetchStats}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Campaign Views" 
              value={stats.totalViews} 
              icon={<ArrowUpRight className="text-emerald-400" />}
              subLabel="Total hits with UTMs"
            />
            <StatCard 
              label="Campaign Visitors" 
              value={stats.uniqueVisitors} 
              icon={<Search className="text-sky-400" />}
              subLabel="Unique users via campaigns"
            />
            <StatCard 
              label="Active Channels" 
              value={stats.topChannels?.length || 0} 
              icon={<Layers className="text-purple-400" />}
              subLabel="Distinct traffic channels"
            />
            <StatCard 
              label="Unique Campaigns" 
              value={stats.topCampaigns?.length || 0} 
              icon={<Target className="text-orange-400" />}
              subLabel="Total active campaigns"
            />
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSection 
              title="Top Sources" 
              icon={<LinkIcon size={18} className="text-sky-400" />}
              data={stats.topSources}
              labelField="utm_source"
            />
            <TableSection 
              title="Top Mediums" 
              icon={<Share2 size={18} className="text-purple-400" />}
              data={stats.topMediums}
              labelField="utm_medium"
            />
            <TableSection 
              title="Top Channels" 
              icon={<Layers size={18} className="text-emerald-400" />}
              data={stats.topChannels}
              labelField="channel"
            />
            <TableSection 
              title="Top Campaigns" 
              icon={<BarChart3 size={18} className="text-orange-400" />}
              data={stats.topCampaigns}
              labelField="utm_campaign"
            />
          </div>
        </>
      ) : (
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
          <p className="text-slate-400 font-medium">{error || "No campaign data found for this period."}</p>
          <p className="text-slate-500 text-sm mt-2">Make sure your links use UTM parameters like ?utm_source=google</p>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, subLabel }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all group overflow-hidden relative">
    <div className="absolute -right-2 -top-2 bg-slate-700/20 w-16 h-16 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all"></div>
    <div className="flex justify-between items-start mb-2">
      <span className="text-slate-400 text-sm font-medium">{label}</span>
      <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-700 group-hover:scale-110 transition-transform">
        {React.cloneElement(icon, { size: 18 })}
      </div>
    </div>
    <div className="text-2xl font-bold text-slate-100">{value?.toLocaleString() || '0'}</div>
    <p className="text-slate-500 text-xs mt-2 flex items-center gap-1 italic">
      {subLabel}
    </p>
  </div>
);

const TableSection = ({ title, icon, data, labelField }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-xl shadow-black/20">
    <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/80">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-slate-200">{title}</h3>
      </div>
    </div>
    <div className="p-2">
      <table className="w-full text-left">
        <thead>
          <tr className="text-slate-500 text-[10px] uppercase tracking-wider font-bold">
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3 text-right">Count</th>
            <th className="px-4 py-3 text-right w-24">Distribution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/30">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-4 py-8 text-center text-slate-500 text-sm italic">
                No data available
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const maxCount = Math.max(...data.map(d => d.count));
              const percentage = (item.count / maxCount) * 100;
              return (
                <tr key={idx} className="hover:bg-slate-700/20 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="text-sm text-slate-300 font-medium group-hover:text-sky-400 transition-colors">
                      {item.value || '(not set)'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-semibold text-slate-100">{item.count.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="w-full bg-slate-700/30 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-sky-500 h-full rounded-full group-hover:bg-sky-400 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default CampaignsPage;
