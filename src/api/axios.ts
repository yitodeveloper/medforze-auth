import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
    'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET,
  },
});

// Interceptor para manejar el refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const deviceId = localStorage.getItem('device_id');

        if (refreshToken && deviceId) {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
            device_id: deviceId,
          }, {
            headers: {
              'x-api-key': process.env.NEXT_PUBLIC_API_KEY,
              'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET,
            }
          });

          if (res.status === 200) {
            const { access_token, refresh_token } = res.data.data;
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Si el refresh falla, redirigir a login o limpiar sesión
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/?error=session_expired';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
