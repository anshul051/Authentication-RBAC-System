import axios from 'axios';

// Create axios instance with base config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true, // Send cookies with every request
    headers: {
        'Content-Type': 'application/json',
    },
});

// ----- Request Interceptor -----
// Runs BEFORE every request is sent
api.interceptors.request.use(
    (config) => {
        // Nothing to add for now (cookies sent automatically)
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ----- Response Interceptor -----
// Runs AFTER every response is received
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

api.interceptors.response.use(
    // If respone is successful, just return it
    (respone) => response,

    // If respone has an error, handle it
    async (error) => {
        const originalRequest = error.config;

        // If 401 (unauthorized) and not already retrying
        if (error.respone?.status === 401 && !originalRequest._retry) {
            if(isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the access token
                await api.post('/auth/refresh');

                processQueue(null);
                isRefreshing = false;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                isRefreshing = false;

                // Refresh failed, redirect to login
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;