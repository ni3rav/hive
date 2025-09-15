import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm } from "@/components/register.tsx"; // Ensure this path is correct
import { useRegister } from "@/hooks/useAuth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register } = useRegister();

  const handleRegister = (name: string, email: string, password: string) => {
    register({ name, email, password }, {
      onSuccess: () => {
        toast.success("Registration successful!.");
        navigate("/dashboard");
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (error: any) => {
        const status: number | undefined = error.response?.status;
        const serverMessage = error.response?.data?.message;
        const errorMap: Record<number, string> = {
          409: "This email is already registered. Please log in.",
          400: "Invalid data provided. Please check your inputs.",
        };
        
        const message = (status !== undefined && errorMap[status]) || serverMessage || "An unexpected error occurred.";
        toast.error(message);
      },
    });
  };

  return (
    <div className="w-screen h-screen grid place-items-center">
      <RegisterForm
        onRegSubmit={handleRegister}
        onLoginClick={() => navigate("/login")}
      />
    </div>
  );
}