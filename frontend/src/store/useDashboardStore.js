import { create } from 'zustand'
import { api } from '../api'

export const useDashboardStore = create((set, get) => ({
  dashboardData: null,
  isLoadingStats: false,
  statsError: null,

  aiInsights: null,
  isLoadingAI: false,
  aiError: null,

  engagementData: null,
  isLoadingEngagement: false,

  // Actions
  fetchDashboardStats: async (siteId, days = 30) => {
    set({ isLoadingStats: true, statsError: null })
    try {
      const data = await api.getDashboardStats(siteId, days)
      // Update data only if we get a valid response. 
      // If the API returns empty but no error, we assume it's valid empty data? 
      // For now, we just set it.
      set({ dashboardData: data, isLoadingStats: false })
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
      // Do NOT clear dashboardData here to persist previous state
      set({ isLoadingStats: false, statsError: error.message || "Failed to fetch stats" })
    }
  },

  fetchAiInsights: async (siteId, forceRefresh = false) => {
    // Check cache first (unless forced)
    const cacheKey = `helm_ai_cache_${siteId}`
    if (!forceRefresh) {
        const cached = localStorage.getItem(cacheKey)
        if (cached) {
            try {
                const { timestamp, data } = JSON.parse(cached)
                const age = Date.now() - timestamp
                const CACHE_DURATION = 15 * 60 * 1000 // 15 minutes
                
                if (age < CACHE_DURATION) {
                    set({ aiInsights: data, isLoadingAI: false })
                    return
                }
            } catch (e) {
                console.warn("Invalid cache format", e)
                localStorage.removeItem(cacheKey)
            }
        }
    }

    if (get().isLoadingAI) return

    set({ isLoadingAI: true, aiError: null })
    try {
        const data = await api.getInsights(siteId)
        set({ aiInsights: data, isLoadingAI: false })
        
        // Save to cache
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }))
    } catch (error) {
        console.error("Failed to fetch AI insights:", error)
        set({ isLoadingAI: false, aiError: error.message || "Failed to fetch insights" })
    }
  },

  fetchEngagementStats: async (siteId, days = 30) => {
    set({ isLoadingEngagement: true })
    try {
        const data = await api.getEngagementStats(siteId, days)
        set({ engagementData: data, isLoadingEngagement: false })
    } catch (error) {
        console.error("Failed to fetch engagement stats:", error)
        set({ isLoadingEngagement: false })
    }
  },
  
  reset: () => set({ dashboardData: null, aiInsights: null, statsError: null, aiError: null })
}))
