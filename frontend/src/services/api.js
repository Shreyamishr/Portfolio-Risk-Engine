import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add interceptor to include token in requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export const login = (credentials) => api.post('/auth/login', credentials);
export const register = (userData) => api.post('/auth/register', userData);
export const getAssets = (page = 1, limit = 10) => api.get(`/assets?page=${page}&limit=${limit}`);
export const createAsset = (assetData) => api.post('/assets', assetData);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);
export const calculateRisk = (strategy) => api.post('/risk/calculate', { strategy });

export default api;
