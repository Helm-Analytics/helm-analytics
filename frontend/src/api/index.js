import axios from "axios";

const API_URL = "https://api-sentinel.getmusterup.com/";

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
  getDashboardStats: (siteId, days) =>
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
};
