import { create } from 'zustand'
import { api } from '../api'

export const useDashboardStore = create((set, get) => ({
  dashboardData: null,
  isLoadingStats: false,
  statsError: null,

  aiInsights: null,
  isLoadingAI: false,
  aiError: null,

  // Actions
  fetchDashboardStats: async (siteId) => {
    set({ isLoadingStats: true, statsError: null })
    try {
      const data = await api.getDashboardStats(siteId, 30)
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

  fetchAiInsights: async (siteId) => {
    // If we are already loading, maybe skip? Or just let it override.
    if (get().isLoadingAI) return

    set({ isLoadingAI: true, aiError: null })
    try {
      const data = await api.getInsights(siteId)
      set({ aiInsights: data, isLoadingAI: false })
    } catch (error) {
      console.error("Failed to fetch AI insights:", error)
      // Do NOT clear aiInsights here
      set({ isLoadingAI: false, aiError: error.message || "Failed to fetch insights" })
    }
  },
  
  reset: () => set({ dashboardData: null, aiInsights: null, statsError: null, aiError: null })
}))
