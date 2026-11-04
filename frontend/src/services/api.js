import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// AuthContext configures the global axios client, but this module uses a
// dedicated instance. Read the current token for every request so protected
// report, analytics, and admin calls stay authenticated after login/refresh.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// India-focused fallback reports used when the API is unavailable.
const generateDemoReports = () => {
  return [
    { _id: 'd1', wasteType: 'Plastic', status: 'pending', location: { coordinates: [77.2090, 28.6139], address: 'Connaught Place, New Delhi' }, createdAt: new Date(Date.now() - 100000000).toISOString() },
    { _id: 'd2', wasteType: 'E-waste', status: 'approved', location: { coordinates: [72.8777, 19.0760], address: 'Dadar West, Mumbai' }, createdAt: new Date(Date.now() - 200000000).toISOString() },
    { _id: 'd3', wasteType: 'Organic', status: 'resolved', location: { coordinates: [77.5946, 12.9716], address: 'Indiranagar, Bengaluru' }, createdAt: new Date(Date.now() - 300000000).toISOString() },
    { _id: 'd4', wasteType: 'Metal', status: 'pending', location: { coordinates: [80.2707, 13.0827], address: 'T. Nagar, Chennai' }, createdAt: new Date(Date.now() - 400000000).toISOString() },
    { _id: 'd5', wasteType: 'Glass', status: 'resolved', location: { coordinates: [88.3639, 22.5726], address: 'Salt Lake, Kolkata' }, createdAt: new Date(Date.now() - 500000000).toISOString() },
    { _id: 'd6', wasteType: 'Plastic', status: 'approved', location: { coordinates: [78.4867, 17.3850], address: 'Hitech City, Hyderabad' }, createdAt: new Date(Date.now() - 600000000).toISOString() },
    { _id: 'd7', wasteType: 'Hazardous', status: 'pending', location: { coordinates: [73.8567, 18.5204], address: 'Shivajinagar, Pune' }, createdAt: new Date(Date.now() - 700000000).toISOString() },
    { _id: 'd8', wasteType: 'Other', status: 'resolved', location: { coordinates: [75.7873, 30.9000], address: 'Model Town, Ludhiana' }, createdAt: new Date(Date.now() - 800000000).toISOString() },
    { _id: 'd9', wasteType: 'Organic', status: 'approved', location: { coordinates: [76.6394, 12.2958], address: 'Devaraja Market, Mysuru' }, createdAt: new Date(Date.now() - 900000000).toISOString() },
    { _id: 'd10', wasteType: 'Metal', status: 'pending', location: { coordinates: [76.2673, 9.9312], address: 'Ernakulam Junction, Kochi' }, createdAt: new Date(Date.now() - 1000000000).toISOString() },
    { _id: 'd11', wasteType: 'Organic', status: 'resolved', location: { coordinates: [72.8258, 18.9894], address: 'Bandra East, Mumbai' }, createdAt: new Date(Date.now() - 1100000000).toISOString() },
    { _id: 'd12', wasteType: 'Hazardous', status: 'pending', location: { coordinates: [72.8347, 18.9220], address: 'Worli, Mumbai' }, createdAt: new Date(Date.now() - 1200000000).toISOString() },
    { _id: 'd13', wasteType: 'E-waste', status: 'approved', location: { coordinates: [77.6412, 12.9719], address: 'Indiranagar, Bengaluru' }, createdAt: new Date(Date.now() - 1300000000).toISOString() },
    { _id: 'd14', wasteType: 'Plastic', status: 'pending', location: { coordinates: [77.5726, 12.9352], address: 'Jayanagar, Bengaluru' }, createdAt: new Date(Date.now() - 1400000000).toISOString() },
    { _id: 'd15', wasteType: 'Plastic', status: 'pending', location: { coordinates: [91.2868, 23.8315], address: 'Maharajganj Market, Agartala, Tripura' }, createdAt: new Date(Date.now() - 1500000000).toISOString() },
    { _id: 'd16', wasteType: 'Organic', status: 'resolved', location: { coordinates: [91.2730, 23.8315], address: 'Gandhighat, Agartala, Tripura' }, createdAt: new Date(Date.now() - 1600000000).toISOString() },
    { _id: 'd17', wasteType: 'Metal', status: 'approved', location: { coordinates: [91.2860, 23.8500], address: 'Battala, Agartala, Tripura' }, createdAt: new Date(Date.now() - 1700000000).toISOString() },
    { _id: 'd18', wasteType: 'Glass', status: 'approved', location: { coordinates: [72.9060, 19.0178], address: 'Kurla West, Mumbai' }, createdAt: new Date(Date.now() - 1800000000).toISOString() },
    { _id: 'd19', wasteType: 'Other', status: 'resolved', location: { coordinates: [77.5980, 13.0358], address: 'Hebbal, Bengaluru' }, createdAt: new Date(Date.now() - 1900000000).toISOString() },
  ];
};

export const getWasteReports = async () => {
  try {
    const res = await api.get('/waste');
    if (!res.data.data || res.data.data.length === 0) {
      return { success: true, data: generateDemoReports() };
    }
    return res.data;
  } catch (err) {
    return { success: true, data: generateDemoReports() };
  }
};

export const getMyWasteReports = async () => {
  try {
    const res = await api.get('/waste/my-reports');
    return res.data;
  } catch (err) {
    return { success: false, data: [] };
  }
};

export const createWasteReport = async (formData) => {
  const res = await api.post('/waste/report', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getAnalyticsData = async () => {
  try {
    const res = await api.get('/admin/analytics');
    if (!res.data.data.stats || res.data.data.stats.total === 0) {
      return {
        success: true,
        data: {
          stats: { total: 19, pending: 7, approved: 6, resolved: 6, rejected: 0 },
          monthlyTrends: [
            { month: 'Jan', count: 2 }, { month: 'Feb', count: 4 }, { month: 'Mar', count: 1 },
            { month: 'Apr', count: 0 }, { month: 'May', count: 3 }, { month: 'Jun', count: 0 },
            { month: 'Jul', count: 0 }, { month: 'Aug', count: 0 }, { month: 'Sep', count: 0 },
            { month: 'Oct', count: 0 }, { month: 'Nov', count: 0 }, { month: 'Dec', count: 0 }
          ],
          hotspots: [
            { latitude: 28.6139, longitude: 77.2090, address: 'Connaught Place, New Delhi', count: 4 },
            { latitude: 19.0760, longitude: 72.8777, address: 'Dadar West, Mumbai', count: 3 },
            { latitude: 12.9716, longitude: 77.5946, address: 'Indiranagar, Bengaluru', count: 3 },
            { latitude: 17.3850, longitude: 78.4867, address: 'Hitech City, Hyderabad', count: 2 },
            { latitude: 13.0827, longitude: 80.2707, address: 'T. Nagar, Chennai', count: 2 },
            { latitude: 23.8315, longitude: 91.2868, address: 'Agartala, Tripura', count: 3 }
          ]
        }
      };
    }
    return res.data;
  } catch (err) {
    return { success: false };
  }
};

export const getLeaderboardData = async () => {
  const res = await api.get('/admin/analytics');
  return res.data;
};

export const adminUpdateReportStatus = async (id, status) => {
  const res = await api.put(`/admin/waste/${id}/status`, { status });
  return res.data;
};

export const adminAssignTeam = async (id, assignedTeam) => {
  const res = await api.put(`/admin/waste/${id}/assign`, { assignedTeam });
  return res.data;
};

export const getAdminReports = async () => {
  const res = await api.get('/admin/waste');
  return res.data;
};

export const getOperationalReports = getAdminReports;

export const getAdminAnalytics = async () => {
  const res = await api.get('/admin/analytics');
  return res.data;
};

export const updateCleanupCampaign = async (id, payload) => {
  const res = await api.put(`/events/${id}`, payload);
  return res.data;
};

export const deleteCleanupCampaign = async (id) => {
  const res = await api.delete(`/events/${id}`);
  return res.data;
};

export const optimizeWasteRoute = async (points, start, region) => {
  const res = await api.post('/ai/route-optimize', { points, start, region });
  return res.data;
};

export const predictWasteRisk = async (payload) => {
  const res = await api.post('/ai/predict', payload);
  return res.data;
};

export const classifyWaste = async (payload) => {
  const res = await api.post('/ai/classify', payload);
  return res.data;
};

export const getAiHotspots = async (reports) => {
  const res = await api.post('/ai/hotspots', { reports });
  return res.data;
};

export const getCleanupEvents = async () => {
  const res = await api.get('/events');
  return res.data;
};

export default api;
