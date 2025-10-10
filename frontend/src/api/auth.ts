import { apiPost, apiGet, apiPatch } from '@/lib/api-client';
import type {
  EditProfileData,
  LoginData,
  RegisterData,
  User,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@/types/auth';

export function apiLogin(data: LoginData): Promise<void> {
  return apiPost<void, LoginData>('/api/auth/login', data);
}

export function apiRegister(data: RegisterData): Promise<void> {
  return apiPost<void, RegisterData>('/api/auth/register', data);
}

export function apiGetMe(): Promise<User> {
  return apiGet<User>('/api/auth/me');
}

export function apiLogout(): Promise<void> {
  return apiPost<void>('/api/auth/logout');
}

export function apiEditProfile(data: EditProfileData): Promise<User> {
  return apiPatch<User, EditProfileData>('/api/user/edit', data);
}

export function apiVerifyEmail(data: VerifyEmailData): Promise<void> {
  return apiPost<void, VerifyEmailData>('/api/auth/verify', data);
}

export function apiForgotPassword(data: ForgotPasswordData): Promise<void> {
  return apiPost<void, ForgotPasswordData>('/api/auth/password/forgot', data);
}

export function apiResetPassword(data: ResetPasswordData): Promise<void> {
  return apiPost<void, ResetPasswordData>('/api/auth/password/reset', data);
}
