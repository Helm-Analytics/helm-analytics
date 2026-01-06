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
  Search,
  Info,
  GraduationCap,
  X
} from 'lucide-react';

const CampaignsPage = () => {
  const { selectedSite, darkMode } = useOutletContext();
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const fetchStats = async () => {
    if (!selectedSite?.id) return;
    setLoading(true);
    try {
      const data = await api.getCampaignStats(selectedSite.id, days);
      // Ensure null fields are handled as empty arrays for the UI components
      const sanitizedData = {
        ...data,
        topSources: data.topSources || [],
        topMediums: data.topMediums || [],
        topCampaigns: data.topCampaigns || [],
        topChannels: data.topChannels || []
      };
      setStats(sanitizedData);
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Target size={64} className="mb-6 opacity-10 animate-pulse" />
        <p className="text-lg font-medium">Please select a site to view campaign analytics</p>
      </div>
    );
  }

  const hasData = stats && (stats.totalViews > 0 || stats.topSources?.length > 0 || stats.topCampaigns?.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2 group">
            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
              <Target className="text-orange-500" size={24} />
            </div>
            Campaigns & Attribution
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-11">
            Track marketing performance and ROI through UTM parameters.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary/50 hover:bg-secondary text-foreground text-xs font-bold rounded-xl border border-border transition-all"
          >
            <Info size={14} className="text-sky-500" />
            How it works
          </button>
          
          <div className="flex bg-secondary p-1 rounded-xl border border-border/50">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  days === d 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button 
            onClick={fetchStats}
            disabled={loading}
            className="p-2.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl border border-border transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {showHowItWorks && (
        <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
            <Share2 size={120} />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <GraduationCap className="text-sky-500" size={20} />
            Automatic Campaign Detection
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sky-500 font-black text-[10px] uppercase">Step 01</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add UTM tags to your marketing links. For example: <br/>
                <code className="text-[10px] bg-secondary px-1 py-0.5 rounded text-sky-400 break-all">yoursite.com/?utm_source=twitter&utm_medium=social</code>
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sky-500 font-black text-[10px] uppercase">Step 02</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our lightweight script automatically extracts these parameters from the URL before they are stripped.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-sky-500 font-black text-[10px] uppercase">Step 03</div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Aggregated data appears here, showing which sources and medium drive the most high-value traffic.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setShowHowItWorks(false)}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {loading && !stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary/50 rounded-2xl animate-pulse border border-border/50" />
          ))}
        </div>
      ) : hasData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              label="Campaign Views" 
              value={stats.totalViews} 
              icon={<ArrowUpRight className="text-emerald-500" />}
              subLabel="Total hits with UTMs"
              darkMode={darkMode}
            />
            <StatCard 
              label="Campaign Visitors" 
              value={stats.uniqueVisitors} 
              icon={<Search className="text-sky-500" />}
              subLabel="Unique users via campaigns"
              darkMode={darkMode}
            />
            <StatCard 
              label="Active Channels" 
              value={stats.topChannels?.length || 0} 
              icon={<Layers className="text-purple-500" />}
              subLabel="Distinct traffic channels"
              darkMode={darkMode}
            />
            <StatCard 
              label="Unique Campaigns" 
              value={stats.topCampaigns?.length || 0} 
              icon={<Target className="text-orange-500" />}
              subLabel="Total active campaigns"
              darkMode={darkMode}
            />
          </div>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableSection 
              title="Top Sources" 
              icon={<LinkIcon size={18} className="text-sky-500" />}
              data={stats.topSources}
              labelField="utm_source"
              darkMode={darkMode}
            />
            <TableSection 
              title="Top Mediums" 
              icon={<Share2 size={18} className="text-purple-500" />}
              data={stats.topMediums}
              labelField="utm_medium"
              darkMode={darkMode}
            />
            <TableSection 
              title="Top Channels" 
              icon={<Layers size={18} className="text-emerald-500" />}
              data={stats.topChannels}
              labelField="channel"
              darkMode={darkMode}
            />
            <TableSection 
              title="Top Campaigns" 
              icon={<BarChart3 size={18} className="text-orange-500" />}
              data={stats.topCampaigns}
              labelField="utm_campaign"
              darkMode={darkMode}
            />
          </div>
        </>
      ) : (
        <div id="tut-campaigns-empty" className="bg-card border border-border border-dashed rounded-3xl p-16 text-center max-w-3xl mx-auto shadow-2xl">
          <div className="w-20 h-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="text-orange-500" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">No Campaign Traffic Detected</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Helm Analytics automatically tracks campaigns when users arrive at your site via links containing 
            <strong> UTM parameters</strong>. You don't need to create campaigns here—just tag your links!
          </p>
          
          <div className="bg-secondary/40 rounded-2xl p-6 text-left border border-border/50 mb-8">
            <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <ExternalLink size={14} className="text-sky-500" /> 
              Try an Example Link:
            </h4>
            <div className="flex items-center gap-2 bg-background p-3 rounded-xl border border-border group overflow-hidden">
                <code className="text-xs text-sky-500 font-mono truncate flex-1">
                  {selectedSite.domain || 'yoursite.com'}/?utm_source=<b>google</b>&utm_medium=<b>cpc</b>&utm_campaign=<b>summersale</b>
                </code>
            </div>
            <p className="text-[11px] text-muted-foreground mt-3 italic">
              * Click this link or share it to see data appear in this dashboard almost instantly.
            </p>
          </div>

          <button 
            onClick={() => setShowHowItWorks(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Learn about Attribution
          </button>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, subLabel, darkMode }) => (
  <div className={`bg-card border border-border rounded-2xl p-6 hover:shadow-xl hover:shadow-sky-500/5 transition-all group overflow-hidden relative`}>
    <div className={`absolute -right-4 -top-4 ${darkMode ? 'bg-slate-800' : 'bg-secondary'} w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
    <div className="flex justify-between items-start mb-3">
      <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">{label}</span>
      <div className={`p-2.5 ${darkMode ? 'bg-slate-800' : 'bg-secondary'} rounded-xl border border-border group-hover:scale-110 group-hover:border-sky-500/30 transition-all`}>
        {React.cloneElement(icon, { size: 20 })}
      </div>
    </div>
    <div className="text-3xl font-black text-foreground tracking-tight">{value?.toLocaleString() || '0'}</div>
    <p className="text-muted-foreground text-[10px] mt-3 font-medium flex items-center gap-2 opacity-80">
      <div className="w-1.5 h-1.5 rounded-full bg-sky-500/40"></div>
      {subLabel}
    </p>
  </div>
);

const TableSection = ({ title, icon, data, labelField, darkMode }) => (
  <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5 relative group">
    <div className={`px-6 py-5 border-b border-border flex items-center justify-between ${darkMode ? 'bg-slate-800/40' : 'bg-secondary/20'} backdrop-blur-sm`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-background rounded-lg border border-border shadow-sm group-hover:border-sky-500/30 transition-colors">
          {icon}
        </div>
        <h3 className="font-bold text-foreground">{title}</h3>
      </div>
    </div>
    <div className="p-1">
      <table className="w-full text-left">
        <thead>
          <tr className="text-muted-foreground text-[10px] uppercase tracking-[0.1em] font-black">
            <th className="px-5 py-4">Value</th>
            <th className="px-5 py-4 text-right">Count</th>
            <th className="px-5 py-4 text-right w-32">Distribution</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-5 py-12 text-center text-muted-foreground text-sm italic">
                No campaign data found in this selection
              </td>
            </tr>
          ) : (
            data.map((item, idx) => {
              const maxCount = Math.max(...data.map(d => d.count));
              const percentage = (item.count / maxCount) * 100;
              return (
                <tr key={idx} className="hover:bg-accent/5 transition-all group/row">
                  <td className="px-5 py-4">
                    <div className="text-sm text-foreground font-semibold group-hover/row:text-sky-500 transition-colors truncate max-w-[180px]">
                      {item.value || '(not set)'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="text-sm font-black text-foreground">{item.count.toLocaleString()}</span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      <div className={`w-full ${darkMode ? 'bg-slate-800' : 'bg-secondary'} h-1.5 rounded-full overflow-hidden border border-border/50`}>
                        <div 
                          className="bg-sky-500 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(56,189,248,0.3)]"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground">{Math.round((item.count / stats.totalViews) * 100) || 0}% share</span>
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
