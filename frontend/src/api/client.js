import axios from 'axios';

import { tokenStorage } from '@/utils/storage';

export const AUTH_LOGOUT_EVENT = 'auth:logout';

export class ApiError extends Error {
  constructor({ status, code, message, details }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.params) {
    config.params = Object.fromEntries(
      Object.entries(config.params).filter(([, v]) => v !== '' && v !== null && v !== undefined),
    );
  }
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status ?? 0;
    const payload = error.response?.data?.error;
    const apiError = new ApiError({
      status,
      code: payload?.code ?? (status ? 'HTTP_ERROR' : 'NETWORK_ERROR'),
      message: payload?.message ?? (status ? 'Request failed' : 'Cannot reach the server. Is the API running?'),
      details: payload?.details,
    });

    if (status === 401 && tokenStorage.get()) {
      tokenStorage.clear();
      window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT));
    }
    return Promise.reject(apiError);
  },
);

export default client;
