import {apiPost , apiGet, apiPatch} from '@/lib/api-client';
import type { EditProfileData, LoginData, RegisterData, User, VerifyEmailData } from '@/types/auth';

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

export function apiVerifyEmail(data: VerifyEmailData) {
  return apiPost("/api/auth/verify", data);
}