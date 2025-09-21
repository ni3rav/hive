import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LoginForm } from "@/components/login.tsx";
import { useLogin } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login } = useLogin();

  const handleLogin = (email: string, password: string) => {
    const validatedData = loginSchema.safeParse({
      validatedEmail: email,
      validatedPassword: password,
    });
    if (!validatedData.success) {
      toast.error("Invalid email or password");
      return;
    }
    const { validatedEmail, validatedPassword } = validatedData.data;

    login(
      { email: validatedEmail, password: validatedPassword },
      {
        onSuccess: () => {
          toast.success("Login successful! Welcome back.");
          navigate("/dashboard");
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onError: (error: any) => {
          const status = error.response?.status;
          const errorMap = {
            404: "User not found. Please check your email or register.",
            401: "Incorrect password. Please try again.",
            400: "Invalid email or password format.",
          };

          const message =
            (status && Object.prototype.hasOwnProperty.call(errorMap, status)
              ? errorMap[status as keyof typeof errorMap]
              : undefined) ||
            error.response?.data?.message ||
            "An unexpected error occurred.";
          toast.error(message);
        },
      }
    );
  };

  return (
    <div className="w-screen h-screen grid place-items-center">
      <LoginForm
        onFormSubmit={handleLogin}
        onSignupClick={() => navigate("/register")}
      />
    </div>
  );
}
