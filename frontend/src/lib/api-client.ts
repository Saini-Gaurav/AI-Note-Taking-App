import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  type AxiosRequestConfig,
} from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from "@/lib/auth-storage";
import type { AuthResponse } from "@/types/auth";

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return null;
    }

    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/refresh`,
        {
          refreshToken,
        }
      );

      setAccessToken(response.data.accessToken);
      setRefreshToken(response.data.refreshToken);

      return response.data.accessToken;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;
    const url = originalConfig?.url ?? "";
    if (
      error.response?.status !== 401 ||
      !originalConfig ||
      originalConfig._retry ||
      url.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    originalConfig._retry = true;
    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      return Promise.reject(error);
    }

    originalConfig.headers.Authorization = `Bearer ${refreshedToken}`;
    return api.request(originalConfig as AxiosRequestConfig);
  }
);

export { api, API_BASE_URL };
