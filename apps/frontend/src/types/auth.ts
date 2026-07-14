export type LoginData = {
  email: string;
  password: string;
};

export type RegisterData = {
  name: string;
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type EditProfileData = {
  name?: string;
  email?: string;
};

export type VerifyEmailData = {
  userId: string;
  token: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type ResetPasswordData = {
  email: string;
  token: string;
  password: string;
};
