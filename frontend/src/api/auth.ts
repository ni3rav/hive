import {apiPost , apiGet, apiPatch} from '@/lib/api-client';

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
  avatar: string;
  id: string;
  name: string;
  email: string;
};

type EditProfileData = {
  name?: string;
  email?: string;
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

export function apiLogout() {
  return apiPost("/api/auth/logout");
}

export function apiEditProfile(data: EditProfileData) {
  return apiPatch("/api/user/edit", data);
}