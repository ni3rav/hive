export {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema as generateResetLinkSchema,
  resetPasswordSchema,
} from '@hive/types';

export type {
  RegisterData,
  LoginData,
  VerifyEmailData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@hive/types';
