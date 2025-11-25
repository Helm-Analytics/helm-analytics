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
      // Initial fetch
      fetchDashboardStats(selectedSite.id)
      fetchAiInsights(selectedSite.id)

      const statsInterval = setInterval(() => {
        fetchDashboardStats(selectedSite.id)
      }, 30000) // Poll stats every 30 seconds

      const aiInterval = setInterval(() => {
        fetchAiInsights(selectedSite.id)
      }, 600000) // Poll AI every 10 minutes

      return () => {
        clearInterval(statsInterval)
        clearInterval(aiInterval)
      }
    }
  }, [selectedSite])

  if (!selectedSite) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-slate-400 text-lg mb-2">No site selected</div>
          <div className="text-slate-500 text-sm">Add a site from the sidebar to view analytics data.</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-200 mb-2">Dashboard for {selectedSite.name}</h1>
        <p className="text-slate-400">Analytics and insights for your website</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 mb-8 shadow-lg">
        <h3 className="text-slate-200 font-semibold mb-3">Tracking Script</h3>
        <p className="text-slate-400 text-sm mb-4">
          Add this code to your website's HTML to start tracking analytics
        </p>
        <div className="relative">
          <pre className="bg-slate-900 border border-slate-600 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto font-mono">
            <code>{`<script src="https://api-sentinel.getmusterup.com/static/tracker-v4.js" data-site-id="${selectedSite.id}"></script>`}</code>
          </pre>
          <button
            onClick={copyTrackingScript}
            className="absolute top-3 right-3 flex items-center space-x-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-md transition-colors shadow-md"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {dashboardData ? (
        <>
          {/* AI Insights */}
          <div className="mb-8">
             <InsightsCard />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Page Views"
              value={dashboardData.totalViews?.toLocaleString() || "0"}
              icon={Eye}
              change={dashboardData.totalViewsChange}
            />
            <StatCard
              title="Unique Visitors"
              value={dashboardData.uniqueVisitors?.toLocaleString() || "0"}
              icon={Users}
              change={dashboardData.uniqueVisitorsChange}
            />
            <StatCard
              title="Bounce Rate"
              value={`${dashboardData.bounceRate?.toFixed(1) || 0}%`}
              icon={TrendingDown}
              change={dashboardData.bounceRateChange}
              inverse={true} // Higher bounce rate is usually bad
            />
            <StatCard
              title="Avg. Visit Time"
              value={dashboardData.avgVisitTime || "0s"}
              icon={Clock}
              change={dashboardData.avgVisitTimeChange}
            />
            <StatCard
              title="Traffic Quality Score"
              value={`${dashboardData.trafficQualityScore?.toFixed(1) || 0}%`}
              icon={ShieldCheck}
              change={dashboardData.trafficQualityScoreChange}
              isQualityScore={true} // Use this to trigger special styling
            />
          </div>

          {/* Web Vitals Cards */}
          <h3 className="text-xl font-bold text-slate-200 mb-4">Core Web Vitals</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="LCP (Loading)"
              value={`${dashboardData.avgLcp?.toFixed(0) || 0}ms`}
              icon={Clock}
              change={dashboardData.avgLcpChange}
              inverse={true}
            />
            <StatCard
              title="CLS (Stability)"
              value={`${dashboardData.avgCls?.toFixed(3) || 0}`}
              icon={TrendingDown}
              change={dashboardData.avgClsChange}
              inverse={true}
            />
            <StatCard
              title="FID (Interactivity)"
              value={`${dashboardData.avgFid?.toFixed(0) || 0}ms`}
              icon={Users}
              change={dashboardData.avgFidChange}
              inverse={true}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <LineChart
              title="Daily Visitors"
              data={[]} // This needs to be populated if backend supports daily series
              labels={[]}
            />
            <BarChart
              title="Top Pages"
              data={dashboardData.topPages?.map(p => p.count) || []}
              labels={dashboardData.topPages?.map(p => p.value) || []}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DoughnutChart
              title="Visitors by Country"
              data={dashboardData.topCountries?.map(c => c.count) || []}
              labels={dashboardData.topCountries?.map(c => c.value) || []}
            />
            <DoughnutChart
              title="Visitors by OS"
              data={dashboardData.topOS?.map(os => os.count) || []}
              labels={dashboardData.topOS?.map(os => os.value) || []}
            />
          </div>
        </>
      ) : isLoadingStats ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-slate-400 text-lg mb-2">No analytics data available</div>
            <div className="text-slate-500 text-sm">
              Install the tracking script above and wait for visitors to see analytics data here.
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Dashboard