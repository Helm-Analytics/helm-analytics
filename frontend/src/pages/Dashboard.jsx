"use client"

import { useState, useEffect } from "react"
import { useOutletContext } from "react-router-dom"
import { Eye, Users, TrendingDown, Clock, Copy, Check, ShieldCheck, Sparkles } from "lucide-react"
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

    const trackingScript = `<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="${selectedSite.id}"></script>`

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

          {/* Technology Distribution */}
          <div className="premium-card">
            <h3 className="text-base font-heading font-extrabold mb-6 flex items-center border-b border-border/50 pb-4 -mx-6 px-6">
              <Sparkles className="w-4 h-4 mr-2 text-accent" />
              Technology Distribution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Top Browsers</p>
                <DoughnutChart
                  data={dashboardData?.topBrowsers?.map(b => b.count) || []}
                  labels={dashboardData?.topBrowsers?.map(b => b.value) || []}
                />
              </div>
              <div className="md:border-l md:border-border/50 md:pl-8">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Operating Systems</p>
                <DoughnutChart
                  data={dashboardData?.topOS?.map(os => os.count) || []}
                  labels={dashboardData?.topOS?.map(os => os.value) || []}
                />
              </div>
            </div>
          </div>


          {/* Sub Grid for Top Content & Geography */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="premium-card">
              <h3 className="text-base font-heading font-extrabold mb-6 flex items-center border-b border-border/50 pb-4 -mx-6 px-6">
                <Copy className="w-4 h-4 mr-2 text-accent" />
                Top Content
              </h3>
              <BarChart
                data={dashboardData?.topPages?.map(p => p.count) || []}
                labels={dashboardData?.topPages?.map(p => p.value) || []}
              />
            </div>
            <div className="premium-card">
              <h3 className="text-base font-heading font-extrabold mb-6 flex items-center border-b border-border/50 pb-4 -mx-6 px-6">
                <Users className="w-4 h-4 mr-2 text-accent" />
                Geographic Reach
              </h3>
              <div className="pt-4">
                <DoughnutChart
                  data={dashboardData?.topCountries?.map(c => c.count) || []}
                  labels={dashboardData?.topCountries?.map(c => c.value) || []}
                />
              </div>
            </div>
          </div>

          {/* Web Vitals Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-heading font-extrabold text-foreground flex items-center px-1 border-b border-border/50 pb-4">
              <Clock className="w-5 h-5 mr-3 text-accent" />
              Web Vitals
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Right Column: Setup & Technology */}
        <div className="lg:col-span-4 space-y-8">
          {/* AI Intelligence Insights */}
          {/* Setup Guide - Sidebar Placement */}
          <div id="tut-setup-guide" className="premium-card bg-[#0F172A] border-none shadow-2xl relative overflow-hidden group mb-8">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldCheck className="w-12 h-12 text-accent rotate-12" />
            </div>
            <h3 className="text-lg font-heading font-extrabold mb-2 text-white flex items-center">
              Setup Helm
            </h3>
            <p className="text-slate-400 text-xs mb-6 font-medium leading-relaxed">
              Integrate the tracking script to begin receiving nautical intelligence flow.
            </p>
            <div className="space-y-4">
              <div className="bg-black/30 rounded-xl p-4 font-mono text-[10px] break-all border border-white/5 text-slate-300">
                {`<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="${selectedSite.id}"></script>`}
              </div>
              <button
                onClick={copyTrackingScript}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-accent text-white hover:bg-accent/90 font-bold text-xs rounded-xl transition-all active:scale-95 shadow-lg shadow-accent/20"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Script"}</span>
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Optional: Spider Trap</p>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                    <code className="text-[9px] text-accent/80 font-mono italic">
                        &lt;a href="/track/trap" style="display:none"&gt;Health Check&lt;/a&gt;
                    </code>
                </div>
            </div>
          </div>

          {/* AI Intelligence Insights */}
          <div id="tut-insights-card">
              <InsightsCard />
          </div>


        </div>
      </div>
    </div>
  )
}

export default Dashboard