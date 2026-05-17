import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('ht_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ht_token');
      localStorage.removeItem('ht_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ─── Auth ────────────────────────────────────────────────────────
export const authApi = {
  login: (data) => client.post('/auth/login', data).then((r) => r.data),
  register: (data) => client.post('/auth/register', data).then((r) => r.data),
  googleLogin: (idToken) => client.post('/auth/google', { idToken }).then((r) => r.data),
  completeProfile: (data) => client.put('/auth/complete-profile', data).then((r) => r.data),
};

// ─── User ────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => client.get('/user/profile').then((r) => r.data),
  updateProfile: (data) => client.put('/user/profile', data).then((r) => r.data),
};

// ─── Diet ────────────────────────────────────────────────────────
export const dietApi = {
  analyze: (data) => client.post('/diet/analyze', data).then((r) => r.data),
  getRecords: () => client.get('/diet/records').then((r) => r.data),
  getWeeklyReport: (startDate, endDate) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate)   params.endDate   = endDate;
    return client.get('/diet/weekly-report', { params }).then((r) => r.data);
  },
};

// ─── Food ────────────────────────────────────────────────────────
export const foodApi = {
  search: (q) => client.get('/food/search', { params: { q } }).then((r) => r.data),
};

export default client;
