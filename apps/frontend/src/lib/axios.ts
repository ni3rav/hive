import axios from 'axios';
import { env } from './env';

export const axiosInstance = axios.create({
  baseURL: env.VITE_HIVE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
