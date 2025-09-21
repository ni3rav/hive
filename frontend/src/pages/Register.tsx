import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RegisterForm } from "@/components/register"; //! you dont need to put .tsx in the import
import { useRegister } from "@/hooks/useAuth";
import { registerSchema } from "@/lib/validations/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { mutate: register } = useRegister();

  const handleRegister = (name: string, email: string, password: string) => {
    //* zod validations for registration
    const validatedData = registerSchema.safeParse({
      validatedName: name,
      validatedEmail: email,
      validatedPassword: password,
    });
    if (!validatedData.success) {
      console.log("validatedData", validatedData.error);
      toast.error("please enter a valid name, email and password");
      return;
    }
    const { validatedName, validatedEmail, validatedPassword } =
      validatedData.data;

    register(
      {
        name: validatedName,
        email: validatedEmail,
        password: validatedPassword,
      },
      {
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

          const message =
            (status !== undefined && errorMap[status]) ||
            serverMessage ||
            "An unexpected error occurred.";
          toast.error(message);
        },
      }
    );
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
