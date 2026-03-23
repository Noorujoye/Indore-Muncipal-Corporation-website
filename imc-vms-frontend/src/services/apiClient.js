import axios from 'axios';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    
    
    withCredentials: false
});

const getStoredAccessToken = () => {
    return sessionStorage.getItem('accessToken') || localStorage.getItem('accessToken');
};

const getStoredRefreshToken = () => {
    return sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');
};

const storeTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) sessionStorage.setItem('accessToken', accessToken);
    if (refreshToken) sessionStorage.setItem('refreshToken', refreshToken);
};

const clearAuthStorage = () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('imc_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_role');
    localStorage.removeItem('vendor_name');
};


apiClient.interceptors.request.use(
    (config) => {
        const token = getStoredAccessToken();
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};


apiClient.interceptors.response.use(
    (response) => {
        return response.data; 
    },
    async (error) => {
        const originalRequest = error.config;

        const requestUrl = originalRequest?.url || '';
        const isAuthEndpoint =
            requestUrl.includes('/auth/login') ||
            requestUrl.includes('/auth/refresh-token') ||
            requestUrl.includes('/auth/logout');

        
        
        if (error.response?.status === 401 && !originalRequest?._retry && !isAuthEndpoint) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = getStoredRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                
                const tokenResponse = await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                
                storeTokens({
                    accessToken: tokenResponse.data?.accessToken,
                    refreshToken: tokenResponse.data?.refreshToken
                });

                processQueue(null, null);
                return apiClient(originalRequest);

            } catch (err) {
                processQueue(err, null);
                
                clearAuthStorage();
                window.location.href = '/';
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export const authStorage = {
    storeTokens,
    clearAuthStorage,
    getStoredAccessToken,
    getStoredRefreshToken,
};

export default apiClient;
