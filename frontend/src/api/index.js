import axios from "axios";

const API_URL = window.HELM_CONFIG?.API_URL || "";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const request = async (config) => {
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    console.error(`API request to ${config.url} failed:`, error);
    throw error.response ? error.response.data : error;
  }
};

export const api = {
  login: (email, password) => {
    return request({
      url: "/auth/login",
      method: "POST",
      data: { email, password },
    });
  },

  signup: (email, password) => {
    return request({
      url: "/auth/signup",
      method: "POST",
      data: { email, password },
    });
  },

  logout: () => request({ url: "/logout" }),
  getSites: () => request({ url: "/api/sites/" }),
  addSite: (name) =>
    request({
      url: "/api/sites/",
      method: "POST",
      data: { name },
    }),
  updateSite: (id, data) => 
    request({
      url: `/api/sites/${id}`,
      method: "PUT",
      data: data,
    }),
  deleteSite: (id) =>
    request({
      url: `/api/sites/${id}`,
      method: "DELETE",
    }),
  getDashboardStats: (siteId, days = 30) =>
    request({
      url: `/api/dashboard?siteId=${siteId}&days=${days}`,
    }),
  getSessionEvents: (siteId, sessionId) =>
    request({
      url: `/api/session/events?siteId=${siteId}&sessionId=${sessionId}`,
    }),
  listSessions: (siteId) =>
    request({
      url: `/api/sessions?siteId=${siteId}`,
    }),
  listFunnels: (siteId) =>
    request({
      url: `/api/funnels/?siteId=${siteId}`,
    }),
  createFunnel: (funnel) =>
    request({
      url: "/api/funnels/",
      method: "POST",
      data: funnel,
    }),
  updateFunnel: (funnel) =>
    request({
      url: "/api/funnels/",
      method: "PUT",
      data: funnel,
    }),
  deleteFunnel: (id) =>
    request({
      url: `/api/funnels/?id=${id}`,
      method: "DELETE",
    }),
  getFirewallRules: (siteId) =>
    request({
      url: `/api/firewall?siteId=${siteId}`,
    }),
  addFirewallRule: (siteId, rule) =>
    request({
      url: `/api/firewall?siteId=${siteId}`,
      method: "POST",
      data: rule,
    }),
  deleteFirewallRule: (siteId, ruleId) =>
    request({
      url: `/api/firewall?siteId=${siteId}&ruleId=${ruleId}`,
      method: "DELETE",
    }),
  getFirewallSuggestions: (siteId) => request(`/api/firewall/suggestions?siteId=${siteId}`),
  getHeatmapData: (siteId, url) => {
    let endpoint = `/api/heatmap?siteId=${siteId}`;
    if (url) endpoint += `&url=${encodeURIComponent(url)}`;
    return request({ url: endpoint });
  },
  getErrorStats: (siteId) => 
    request({ url: `/api/errors?siteId=${siteId}` }),

  getInsights: (siteId) =>
    request({
      url: `/api/ai/insights?siteId=${siteId}`,
      method: "POST",
    }),
  chatWithAI: (siteId, message) =>
    request({
      url: `/api/ai/chat?siteId=${siteId}`,
      method: "POST",
      data: { message },
    }),
  analyzeError: (message, source) =>
    request({
      url: "/api/ai/analyze-error",
      method: "POST",
      data: { message, source },
    }),
  
  // Custom Events
  getCustomEvents: (siteId, params = {}) => {
    const { timeRange = '7d', eventName } = params;
    let url = `/api/custom-events?siteId=${siteId}&days=${timeRange.replace('d', '')}`;
    if (eventName) url += `&eventName=${eventName}`;
    return request({ url });
  },
  
  // Activity Log
  getActivityLog: (siteId, filter = 'all', limit = 100) =>
    request({
      url: `/api/activity?siteId=${siteId}&filter=${filter}&limit=${limit}`,
    }),

  getEngagementStats: (siteId, days = 30) =>
    request({
      url: `/api/engagement?siteId=${siteId}&days=${days}`,
    }),

  getUserFlow: (siteId, days = 7) => 
    request({
      url: `/api/user-flow?siteId=${siteId}&days=${days}`,
    }),

  getCampaignStats: (siteId, days = 30) =>
    request({
      url: `/api/campaigns?siteId=${siteId}&days=${days}`,
    }),
};
