import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Create an axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const getUserProfile = () => api.get('/users/me');

export const updateUserProfile = (profileData: { name?: string; department?: string; jobTitle?: string }) => {
    return api.put('/users/me', profileData);
};

export const changeUserPassword = (passwordData: { oldPassword: string; newPassword: string }) => {
    return api.post('/users/me/password', passwordData);
};

export default api;
