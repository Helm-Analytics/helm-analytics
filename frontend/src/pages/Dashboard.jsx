"use client"

import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { ScanEye, Users, ArrowDownRight, Timer, Copy, Check, Fingerprint, Laptop, MousePointer2, Activity } from "lucide-react"
import { useDashboardStore } from "../store/useDashboardStore"
import StatCard from "../components/StatCard"
import InsightsCard from "../components/InsightsCard"
import BarChart from "../components/BarChart"
import LineChart from "../components/LineChart"
import DoughnutChart from "../components/DoughnutChart"

const Dashboard = () => {
  const { selectedSite } = useOutletContext()
  const { 
    dashboardData, 
    isLoadingStats, 
    fetchDashboardStats, 
    fetchEngagementStats,
    engagementData,
    isLoadingEngagement
  } = useDashboardStore()
  
  const [copied, setCopied] = useState(false)
  const [dateRange, setDateRange] = useState(() => {
    // Persist date range selection
    const saved = localStorage.getItem('dashboard_dateRange')
    return saved || "30"
  })

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('dashboard_dateRange', dateRange)
  }, [dateRange])

  const copyTrackingScript = async () => {
    if (!selectedSite) return

    const envUrl = import.meta.env.VITE_API_URL;
    const apiUrl = (envUrl && envUrl !== '/') ? envUrl : window.location.origin;
    const trackingScript = `<script src="${apiUrl}/static/tracker-v5.js?v=6" data-site-id="${selectedSite.id}"></script>`

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(trackingScript)
      } else {
        // Fallback for non-HTTPS (like self-hosted IP addresses)
        const textArea = document.createElement("textarea");
        textArea.value = trackingScript;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error("Fallback copy failed", err)
        }
        document.body.removeChild(textArea);
      }
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  useEffect(() => {
    if (selectedSite) {
      fetchDashboardStats(selectedSite.id, dateRange)
      // fetchAiInsights(selectedSite.id)
      fetchEngagementStats(selectedSite.id, dateRange)

      const statsInterval = setInterval(() => {
        fetchDashboardStats(selectedSite.id, dateRange)
        fetchEngagementStats(selectedSite.id, dateRange)
      }, 30000)

      /* AI Insights disabled for Community Edition (BYOK coming soon)
      const aiInterval = setInterval(() => {
        fetchAiInsights(selectedSite.id)
      }, 600000)
      */

      return () => {
        clearInterval(statsInterval)
        // clearInterval(aiInterval)
      }
    }
  }, [selectedSite, dateRange])

  if (!selectedSite) {
    return (
      <div className="flex items-center justify-center h-96 helm-bg">
        <div className="premium-card text-center max-w-md">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
            <ScanEye className="w-8 h-8 text-accent/50" />
          </div>
          <h2 className="text-xl font-heading font-extrabold text-foreground mb-2">No site selected</h2>
          <p className="text-muted-foreground text-sm">Select or add a website from the sidebar to start viewing your traffic intelligence.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/50">
        <div>
          <div className="flex items-center space-x-2 text-accent font-bold text-xs uppercase tracking-widest mb-2">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
            <span>Live Intelligence</span>
          </div>
          {dashboardData?.totalUsageMonth !== undefined && (
              <div className="inline-flex mx-4 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full text-xs font-medium text-accent items-center gap-2 mb-2 translate-y-[-2px]">
                <Activity className="w-3 h-3" />
                <span>Usage: {dashboardData.totalUsageMonth.toLocaleString()} Events (Month)</span>
              </div>
          )}

          <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
            {selectedSite.name}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Real-time visitor tracking and security metrics.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-white dark:bg-card p-1.5 rounded-xl border border-border/50 shadow-sm">
           {["1", "7", "30", "90"].map((range) => (
             <button 
               key={range}
               onClick={() => setDateRange(range)}
               className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === range ? 'bg-accent text-white shadow-lg shadow-accent/20 scale-105' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}
             >
               {range === "1" ? "24h" : `${range}d`}
             </button>
           ))}
        </div>
      </div>

      {/* Hero Stats Section */}
      {dashboardData && (
        <div id="tut-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Views"
            value={dashboardData.totalViews?.toLocaleString() || "0"}
            icon={ScanEye}
            change={dashboardData.totalViewsChange}
          />
          <StatCard
            title="Total Visits"
            value={dashboardData.uniqueVisitors?.toLocaleString() || "0"}
            icon={Users}
            change={dashboardData.uniqueVisitorsChange}
          />
          <StatCard
            title="Bounce Rate"
            value={`${dashboardData.bounceRate?.toFixed(1) || 0}%`}
            icon={ArrowDownRight}
            change={dashboardData.bounceRateChange}
            inverse={true}
          />
          <StatCard
            title="Avg. Duration"
            value={dashboardData.avgVisitTime || "0s"}
            icon={Timer}
            change={dashboardData.avgVisitTimeChange}
          />
          <StatCard
            title="Traffic Quality"
            value={`${dashboardData.trafficQualityScore?.toFixed(0) || 0}%`}
            icon={Fingerprint}
            change={dashboardData.trafficQualityScoreChange}
            isQualityScore={true}
          />
        </div>
      )}

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Graph & Insights */}
        <div className="lg:col-span-8 space-y-8">

          {/* Visitor Traffic Graph */}
          <div id="tut-traffic-graph" className="premium-card !p-0 overflow-hidden shadow-2xl shadow-slate-200 dark:shadow-none">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-heading font-extrabold flex items-center">
                <Users className="w-5 h-5 mr-3 text-accent" />
                Visitor Traffic
              </h3>
            </div>
            <div className="p-8 h-[280px]">
              <LineChart
                data={dashboardData?.dailyStats?.map(d => d.count) || []}
                labels={dashboardData?.dailyStats?.map(d => d.value) || []}
              />
            </div>
          </div>


          {/* Sub Grid for Top Content & Geography */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div id="tut-top-pages" className="premium-card !p-0 overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-accent/5">
                <h3 className="text-base font-heading font-extrabold flex items-center">
                  <Copy className="w-4 h-4 mr-2 text-accent" />
                  Top Content
                </h3>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Views</span>
              </div>
              <div className="p-2">
                <PlausibleStyleTable 
                  data={dashboardData?.topPages || []} 
                  total={dashboardData?.totalViews || 1}
                  label="Page"
                />
              </div>
            </div>

            <div id="tut-top-referrers" className="premium-card !p-0 overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-accent/5">
                <h3 className="text-base font-heading font-extrabold flex items-center">
                  <Users className="w-4 h-4 mr-2 text-accent" />
                  Top Referrers
                </h3>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Visitors</span>
              </div>
              <div className="p-2">
                <PlausibleStyleTable 
                  data={dashboardData?.topReferrers || []} 
                  total={dashboardData?.uniqueVisitors || 1}
                  label="Referrer"
                  isReferrer={true}
                />
              </div>
            </div>

            <div id="tut-top-countries" className="premium-card !p-0 overflow-hidden shadow-xl">
              <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between bg-accent/5">
                <h3 className="text-base font-heading font-extrabold flex items-center">
                  <ScanEye className="w-4 h-4 mr-2 text-accent" />
                  Top Countries
                </h3>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Visitors</span>
              </div>
              <div className="p-2">
                <PlausibleStyleTable 
                  data={dashboardData?.topCountries || []} 
                  total={dashboardData?.uniqueVisitors || 1}
                  label="Country"
                />
              </div>
            </div>
          </div>

          {/* Web Vitals Section */}
          <div id="tut-web-vitals" className="space-y-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground flex items-center px-1 border-b border-border/50 pb-4">
              <Timer className="w-5 h-5 mr-3 text-accent" />
              Web Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="LCP (Loading)"
                value={`${dashboardData?.avgLcp?.toFixed(0) || 0}ms`}
                icon={Timer}
                change={dashboardData?.avgLcpChange}
                inverse={true}
              />
              <StatCard
                title="CLS (Stability)"
                value={`${dashboardData?.avgCls?.toFixed(3) || 0}`}
                icon={ArrowDownRight}
                change={dashboardData?.avgClsChange}
                inverse={true}
              />
              <StatCard
                title="FID (Interaction)"
                value={`${dashboardData?.avgFid?.toFixed(0) || 0}ms`}
                icon={Users}
                change={dashboardData?.avgFidChange}
                inverse={true}
              />
            </div>
          </div>

          {/* Content Engagement Section */}
          <div id="tut-engagement" className="space-y-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground flex items-center px-1 border-b border-border/50 pb-4">
              <MousePointer2 className="w-5 h-5 mr-3 text-accent" />
              Content Engagement
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {!engagementData || engagementData.length === 0 ? (
                <div className="premium-card text-center py-12">
                   <p className="text-muted-foreground italic text-sm">No engagement data recorded for the selected period.</p>
                </div>
              ) : (
                engagementData.slice(0, 3).map((page, idx) => (
                  <div key={idx} className="premium-card hover:border-accent/40 transition-all group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                       <div className="flex items-center gap-3 overflow-hidden">
                          <div className="p-2 bg-accent/10 rounded-lg text-accent">
                             <Copy size={16} />
                          </div>
                          <span className="font-bold text-sm truncate text-foreground group-hover:text-accent transition-colors">{page.pageUrl}</span>
                       </div>
                       <div className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full border border-border">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground items-center flex gap-1.5">
                            <Timer size={10} /> Avg Max Scroll: <span className="text-foreground">{page.avgMaxDepth?.toFixed(0) || 0}%</span>
                          </span>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                       {page.milestones?.map((m, i) => (
                         <div key={i} className="space-y-2">
                            <div className="flex justify-between items-end">
                               <span className="text-[9px] font-bold text-muted-foreground uppercase">{m.level}% Depth</span>
                               <span className="text-xs font-extrabold text-foreground">{m.percentage?.toFixed(1)}%</span>
                            </div>
                            <div className="h-1.5 bg-secondary rounded-full overflow-hidden border border-border/50">
                               <div 
                                 className="h-full bg-accent transition-all duration-1000 ease-out"
                                 style={{ width: `${m.percentage}%`, opacity: 0.4 + (m.level / 100) * 0.6 }}
                                ></div>
                            </div>
                         </div>
                       ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Setup & Technology */}
        <div className="lg:col-span-4 space-y-8">
          {/* Setup Guide - Top Position */}
          <div id="tut-setup-guide" className="premium-card bg-card border shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Fingerprint className="w-12 h-12 text-accent rotate-12" />
            </div>
            <h3 className="text-lg font-heading font-extrabold mb-2 text-foreground flex items-center">
              Setup Helm
            </h3>
            <p className="text-muted-foreground text-xs mb-6 font-medium leading-relaxed">
              Integrate the tracking script to begin receiving nautical intelligence flow.
            </p>
            <div className="space-y-4">
              <div className="bg-secondary rounded-xl p-4 font-mono text-[10px] break-all border border-border text-foreground">
                {`<script src="${(import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/') ? import.meta.env.VITE_API_URL : window.location.origin}/static/tracker-v5.js?v=6" data-site-id="${selectedSite.id}"></script>`}
              </div>
              <button
                onClick={copyTrackingScript}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent text-white hover:bg-accent/90 font-bold text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-accent/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Script"}</span>
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Optional: Spider Trap</p>
                <div className="bg-secondary p-3 rounded-lg border border-border">
                    <code className="text-[9px] text-accent/80 font-mono italic">
                        &lt;a href="/track/trap" style="display:none"&gt;Health Check&lt;/a&gt;
                    </code>
                </div>
            </div>
          </div>

          {/* AI Insights - Disabled for Community Edition (Pending BYOK)
          <div id="tut-insights-card">
              <InsightsCard />
          </div>
          */}

          <div className="premium-card">
              <h3 className="text-base font-heading font-extrabold mb-6 flex items-center border-b border-border/50 pb-4 -mx-6 px-6">
                <Laptop className="w-4 h-4 mr-2 text-accent" />
                Technology
              </h3>
              <div className="space-y-8">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Top Browsers</p>
                <DoughnutChart
                  data={dashboardData?.topBrowsers?.map(b => b.count) || []}
                  labels={dashboardData?.topBrowsers?.map(b => b.value) || []}
                />
              </div>
              <div className="pt-8 border-t border-border/50">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 text-center">Operating Systems</p>
                <DoughnutChart
                  data={dashboardData?.topOS?.map(os => os.count) || []}
                  labels={dashboardData?.topOS?.map(os => os.value) || []}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const PlausibleStyleTable = ({ data, total, label, isReferrer = false }) => {
  const max = Math.max(...(data?.map(d => d.count) || [1]));
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-[10px] uppercase font-black text-muted-foreground tracking-widest px-4 py-3 border-b border-border/30">
        <span>{label}</span>
        <span>Count</span>
      </div>
      <div className="divide-y divide-border/20">
        {(!data || data.length === 0) ? (
          <div className="p-12 text-center text-xs text-muted-foreground italic">
            No data available for this period
          </div>
        ) : (
          data.map((item, idx) => {
            const percentage = (item.count / max) * 100;
            const Globe = (props) => (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                {...props}
              >
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            );
            const ArrowUpRight = (props) => (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                {...props}
              >
                <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
              </svg>
            );

            return (
              <div key={idx} className="relative group hover:bg-accent/5 transition-all">
                {/* Background Progress Bar */}
                <div 
                  className="absolute inset-y-[2px] left-0 bg-accent/10 transition-all duration-1000 ease-out group-hover:bg-accent/20 rounded-r-md"
                  style={{ width: `${percentage}%` }}
                />
                
                <div className="relative px-4 py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {isReferrer && (
                      <div className="w-5 h-5 rounded bg-background/50 border border-border/50 flex items-center justify-center shrink-0">
                         <Globe size={10} className="text-muted-foreground/60" />
                      </div>
                    )}
                    <span className="text-sm font-semibold text-foreground truncate group-hover:text-accent transition-colors">
                      {item.value || '(not set)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-foreground">
                      {item.count?.toLocaleString()}
                    </span>
                    <ArrowUpRight size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Dashboard
