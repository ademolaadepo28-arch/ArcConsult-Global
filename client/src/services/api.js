// services/api.js - Axios API Connector
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach demo token if exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('arcconsult_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const propertyApi = {
  // PostGIS spatial bounding box or radius search
  async getProperties(params = {}) {
    const res = await api.get('/properties', { params });
    return res.data;
  },

  // Single property details + PostGIS spatial join with nearby schools
  async getPropertyDetails(id) {
    const res = await api.get(`/properties/${id}`);
    return res.data;
  },

  // Retrieve all schools
  async getSchools() {
    const res = await api.get('/properties/schools');
    return res.data;
  }
};

export const analyticsApi = {
  // 30-year / 15-year mortgage schedule, sensitivity matrix & monthly breakdown
  async calculateAmortization(payload) {
    const res = await api.post('/mortgage/amortization', payload);
    return res.data;
  },

  // Investor Cap Rate, Gross Yield, Cash-on-Cash Return & 10-year equity accumulation
  async calculateInvestment(payload) {
    const res = await api.post('/mortgage/investment', payload);
    return res.data;
  },

  // Side-by-side comparison for selected properties
  async compareProperties(propertyIds) {
    const res = await api.post('/mortgage/compare', { propertyIds });
    return res.data;
  }
};

export const portfolioApi = {
  async getSavedPortfolios() {
    const res = await api.get('/mortgage/portfolio');
    return res.data;
  },

  async toggleSaveProperty(propertyId, notes = '') {
    const res = await api.post('/mortgage/portfolio/toggle', { propertyId, notes });
    return res.data;
  }
};

export const systemApi = {
  async getHealth() {
    const res = await api.get('/health');
    return res.data;
  }
};

export default api;
