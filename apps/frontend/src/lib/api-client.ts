import { axiosInstance } from './axios';

interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data?: T;
}

/**
 * extract data from new standardized response shape
 * handles both new shape ({ success, message, data }) and legacy responses
 */
function extractData<T>(response: unknown): T {
  // check if it's the new response shape
  if (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as ApiSuccessResponse).success === true
  ) {
    const standardResponse = response as ApiSuccessResponse<T>;
    return standardResponse.data !== undefined
      ? standardResponse.data
      : (response as T);
  }

  // legacy response - return as is
  return response as T;
}

const apiClient = {
  get: async <T = unknown>(url: string, config = {}): Promise<T> => {
    const res = await axiosInstance.get(url, config);
    return extractData<T>(res.data);
  },
  post: async <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config = {},
  ): Promise<T> => {
    const res = await axiosInstance.post(url, body, config);
    return extractData<T>(res.data);
  },
  put: async <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config = {},
  ): Promise<T> => {
    const res = await axiosInstance.put(url, body, config);
    return extractData<T>(res.data);
  },
  patch: async <T = unknown, B = unknown>(
    url: string,
    body?: B,
    config = {},
  ): Promise<T> => {
    const res = await axiosInstance.patch(url, body, config);
    return extractData<T>(res.data);
  },
  delete: async <T = unknown>(url: string, config = {}): Promise<T> => {
    const res = await axiosInstance.delete(url, config);
    return extractData<T>(res.data);
  },
};

export const {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
} = apiClient;
