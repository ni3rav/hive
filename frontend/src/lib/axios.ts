// src/lib/axios.ts
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.HEYAA_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
