"use client"

import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Eye, Users, TrendingDown, Clock, Copy, Check, ShieldCheck } from "lucide-react"
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
    fetchAiInsights 
  } = useDashboardStore()
  
  const [copied, setCopied] = useState(false)
  const [dateRange, setDateRange] = useState("30")

  const copyTrackingScript = async () => {
    if (!selectedSite) return

    const trackingScript = `<!-- Helm Analytics Tracking Script -->\n<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="${selectedSite.id}"></script>`

    try {
      await navigator.clipboard.writeText(trackingScript)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  useEffect(() => {
    if (selectedSite) {
      fetchDashboardStats(selectedSite.id, dateRange)
      fetchAiInsights(selectedSite.id)

      const statsInterval = setInterval(() => {
        fetchDashboardStats(selectedSite.id, dateRange)
      }, 30000)

      const aiInterval = setInterval(() => {
        fetchAiInsights(selectedSite.id)
      }, 600000)

      return () => {
        clearInterval(statsInterval)
        clearInterval(aiInterval)
      }
    }
  }, [selectedSite, dateRange])

  if (!selectedSite) {
    return (
      <div className="flex items-center justify-center h-96 helm-bg">
        <div className="premium-card text-center max-w-md">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-border/50">
            <Eye className="w-8 h-8 text-accent/50" />
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
          <h1 className="text-4xl font-heading font-extrabold text-foreground tracking-tight">
            {selectedSite.name}
          </h1>
          <p className="text-muted-foreground mt-1">Real-time visitor tracking and security metrics.</p>
        </div>
        
        <div className="flex items-center space-x-3 bg-secondary/50 p-1.5 rounded-xl border border-border/50">
           <button 
             onClick={() => setDateRange("1")}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === "1" ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             24h
           </button>
           <button 
             onClick={() => setDateRange("7")}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === "7" ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             7d
           </button>
           <button 
             onClick={() => setDateRange("30")}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === "30" ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             30d
           </button>
           <button 
             onClick={() => setDateRange("90")}
             className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${dateRange === "90" ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
           >
             90d
           </button>
        </div>
      </div>

      {/* Hero Stats Section */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Views"
            value={dashboardData.totalViews?.toLocaleString() || "0"}
            icon={Eye}
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
            icon={TrendingDown}
            change={dashboardData.bounceRateChange}
            inverse={true}
          />
          <StatCard
            title="Avg. Duration"
            value={dashboardData.avgVisitTime || "0s"}
            icon={Clock}
            change={dashboardData.avgVisitTimeChange}
          />
          <StatCard
            title="Traffic Quality"
            value={`${dashboardData.trafficQualityScore?.toFixed(0) || 0}%`}
            icon={ShieldCheck}
            change={dashboardData.trafficQualityScoreChange}
            isQualityScore={true}
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Charts and Details */}
        <div className="xl:col-span-2 space-y-8">
          {/* Main Chart Card */}
          <div className="premium-card !p-0 overflow-hidden">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-lg font-heading font-extrabold flex items-center">
                <Users className="w-5 h-5 mr-2 text-accent" />
                Visitor Traffic
              </h3>
            </div>
            <div className="p-6">
              <LineChart
                data={dashboardData?.dailyStats?.map(d => d.count) || []}
                labels={dashboardData?.dailyStats?.map(d => d.value) || []}
                height={300}
              />
            </div>
          </div>

          {/* Secondary Charts Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="premium-card">
              <h3 className="text-base font-heading font-extrabold mb-6 flex items-center">
                <Copy className="w-4 h-4 mr-2 text-accent" />
                Top Content
              </h3>
              <BarChart
                data={dashboardData?.topPages?.map(p => p.count) || []}
                labels={dashboardData?.topPages?.map(p => p.value) || []}
              />
            </div>
            <div className="premium-card">
              <h3 className="text-base font-heading font-extrabold mb-6 flex items-center">
                <Users className="w-4 h-4 mr-2 text-accent" />
                Geographic Reach
              </h3>
              <DoughnutChart
                data={dashboardData?.topCountries?.map(c => c.count) || []}
                labels={dashboardData?.topCountries?.map(c => c.value) || []}
                innerRadius={60}
              />
            </div>
          </div>

           {/* Web Vitals Section */}
           <div className="space-y-4">
            <h3 className="text-xl font-heading font-extrabold text-foreground flex items-center px-1">
              <Clock className="w-5 h-5 mr-2 text-accent" />
              Core Web Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="LCP (Loading)"
                value={`${dashboardData?.avgLcp?.toFixed(0) || 0}ms`}
                icon={Clock}
                change={dashboardData?.avgLcpChange}
                inverse={true}
              />
              <StatCard
                title="CLS (Stability)"
                value={`${dashboardData?.avgCls?.toFixed(3) || 0}`}
                icon={TrendingDown}
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
        </div>

        {/* Sidebar Region */}
        <div className="space-y-8">
          {/* AI Insights Sidebar */}
          <InsightsCard />

          {/* Tracking Script Setup Card */}
          <div className="premium-card bg-[#0F172A] border-none shadow-2xl shadow-primary/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-accent/20 transition-all duration-700"></div>
            <h3 className="text-lg font-heading font-extrabold mb-2 text-white relative z-10">Setup Helm</h3>
            <p className="text-slate-400 text-xs mb-6 relative z-10 leading-relaxed font-medium">
              Integrate the tracking script to begin receiving nautical intelligence flow.
            </p>
            <div className="space-y-4">
              <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] break-all border border-white/5 text-slate-300 relative z-10 backdrop-blur-sm">
                {`<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="${selectedSite.id}"></script>`}
              </div>
              <button
                onClick={copyTrackingScript}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-accent hover:bg-accent/90 text-white font-bold text-xs rounded-xl transition-all active:scale-95 shadow-lg relative z-10"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied to Clipboard" : "Copy Tracking Script"}</span>
              </button>
            </div>
          </div>

          {/* Simple Breakdown */}
          <div className="premium-card">
            <h3 className="text-base font-heading font-extrabold mb-6">Browsers & Tech</h3>
            <div className="space-y-6">
              <DoughnutChart
                data={dashboardData?.topBrowsers?.map(b => b.count) || []}
                labels={dashboardData?.topBrowsers?.map(b => b.value) || []}
                innerRadius={70}
              />
              <div className="pt-4 border-t border-border/50">
                 <DoughnutChart
                  data={dashboardData?.topOS?.map(os => os.count) || []}
                  labels={dashboardData?.topOS?.map(os => os.value) || []}
                  innerRadius={70}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard