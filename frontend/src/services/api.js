import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const getAssets = () => api.get('/assets');
export const createAsset = (assetData) => api.post('/assets', assetData);
export const deleteAsset = (id) => api.delete(`/assets/${id}`);
export const calculateRisk = (strategy) => api.post('/risk/calculate', { strategy });

export default api;
