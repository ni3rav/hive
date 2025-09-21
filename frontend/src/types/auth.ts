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
  avatar: string;
  id: string;
  name: string;
  email: string;
};

export type EditProfileData = {
  name?: string;
  email?: string;
};

export type VerifyEmailData = {
  userId: string;
  token: string;
};
