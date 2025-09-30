// src/lib/api-client.ts
import { axiosInstance } from './axios';

const apiClient = {
  get: async <T = unknown>(url: string, config = {}): Promise<T> => {
    const res = await axiosInstance.get<T>(url, config);
    return res.data;
  },
  post: async <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config = {},
  ): Promise<T> => {
    const res = await axiosInstance.post<T>(url, body, config);
    return res.data;
  },
  put: async <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config = {},
  ): Promise<T> => {
    const res = await axiosInstance.put<T>(url, body, config);
    return res.data;
  },
  patch: async <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config = {},
  ): Promise<T> => {
    const res = await axiosInstance.patch<T>(url, body, config);
    return res.data;
  },
  delete: async <T = unknown>(url: string, config = {}): Promise<T> => {
    const res = await axiosInstance.delete<T>(url, config);
    return res.data;
  },
};

export const {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
} = apiClient;
