import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    // We authenticate using Bearer tokens, not cookies.
    // Keeping this false avoids accidental cross-site cookie/CSRF issues.
    withCredentials: false,
    headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(cfg => {
    const token = localStorage.getItem('token');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

// If backend replies 401 (expired/invalid token), drop the token so route guards/UI update.
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const status = err?.response?.status;
        if (status === 401) {
            try { localStorage.removeItem('token'); } catch (_) { }
        }
        return Promise.reject(err);
    }
);

export default api;

// Auth
export const AuthAPI = {
    register: (data) => api.post('/auth/register', data).then(r => r.data),
    login: (data) => api.post('/auth/login', data).then(r => r.data),
    me: () => api.get('/auth/me').then(r => r.data),
    updateMe: (data) => api.put('/auth/me', data).then(r => r.data),
    changePassword: (payload) => api.post('/auth/change-password', payload).then(r => r.data),
    deleteMe: () => api.delete('/auth/me').then(r => r.data)
};

// Cars
export const CarsAPI = {
    list: (params) => api.get('/cars', { params }).then(r => r.data),
    get: (id, params) => api.get(`/cars/${id}`, { params }).then(r => r.data),
    create: (data) => api.post('/cars', data).then(r => r.data),
    update: (id, data) => api.put(`/cars/${id}`, data).then(r => r.data),
    remove: (id) => api.delete(`/cars/${id}`).then(r => r.data),
    feature: (id, featured) => api.patch(`/cars/${id}/feature`, { featured }).then(r => r.data),
    publish: (id, published) => api.patch(`/cars/${id}/publish`, { published }).then(r => r.data),
    uploadMedia: (id, files) => {
        const fd = new FormData();
        [].concat(files).forEach(f => fd.append('files', f));
        return api.post(`/cars/${id}/media`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
    },
    reorderMedia: (id, order) => api.put(`/cars/${id}/media/reorder`, { order }).then(r => r.data),
    deleteMedia: (id, mediaId) => api.delete(`/cars/${id}/media/${mediaId}`).then(r => r.data),
    setFeatures: (id, features) => api.put(`/cars/${id}/features`, { features }).then(r => r.data),
    setSpecs: (id, specs) => api.put(`/cars/${id}/specs`, { specs }).then(r => r.data),
    uploadDocuments: (id, files, docType = null) => {
        const fd = new FormData();
        [].concat(files).forEach(f => fd.append('files', f));
        if (docType) fd.append('doc_type', docType);
        return api.post(`/cars/${id}/documents`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
    },
    deleteDocument: (id, docId) => api.delete(`/cars/${id}/documents/${docId}`).then(r => r.data)
};

// Newsletter
export const NewsletterAPI = {
    subscribe: (email) => api.post('/newsletter/subscribe', { email }).then(r => r.data),
    unsubscribe: () => api.delete('/newsletter/subscribe').then(r => r.data),
    me: () => api.get('/newsletter/me').then(r => r.data),
    preferences: (prefs) => api.put('/newsletter/preferences', prefs).then(r => r.data),
    list: () => api.get('/newsletter/subscribers').then(r => r.data),
    send: (payload) => api.post('/newsletter/send', payload).then(r => r.data),
    remove: (id) => api.delete(`/newsletter/subscribers/${id}`).then(r => r.data)
};

// Company
export const CompanyAPI = {
    get: () => api.get('/company').then(r => r.data),
    update: (data) => api.put('/company', data).then(r => r.data)
};

// Favorites
export const FavoritesAPI = {
    list: () => api.get('/favorites').then(r => r.data),
    status: (carId) => api.get(`/favorites/${carId}`).then(r => r.data),
    add: (carId) => api.post(`/favorites/${carId}`).then(r => r.data),
    remove: (carId) => api.delete(`/favorites/${carId}`).then(r => r.data)
};

// Activity Logs
export const ActivityAPI = {
    list: (params) => api.get('/activity', { params }).then(r => r.data),
    create: (data) => api.post('/activity', data).then(r => r.data),
    remove: (id) => api.delete(`/activity/${id}`).then(r => r.data)
};

// Customer Inquiries
export const InquiriesAPI = {
    submit: (data) => api.post('/inquiries', data).then(r => r.data),
    list: (params) => api.get('/inquiries', { params }).then(r => r.data),
    stats: () => api.get('/inquiries/stats').then(r => r.data),
    get: (id) => api.get(`/inquiries/${id}`).then(r => r.data),
    updateStatus: (id, status) => api.patch(`/inquiries/${id}/status`, { status }).then(r => r.data),
    remove: (id) => api.delete(`/inquiries/${id}`).then(r => r.data),
    reply: (id, data) => api.post(`/inquiries/${id}/reply`, data).then(r => r.data),
    getReplies: (id) => api.get(`/inquiries/${id}/replies`).then(r => r.data)
};
