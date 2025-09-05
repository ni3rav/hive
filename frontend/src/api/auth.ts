import {apiPost , apiGet} from '@/lib/api-client';

type LoginData = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export function apiLogin(data: LoginData) {
  return apiPost("/api/auth/login", data);
}

export function apiRegister(data: RegisterData) {
  return apiPost("/api/auth/register", data);
}

export function apiGetMe(): Promise<User> {
  return apiGet("/api/auth/me");
}