import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hexagon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useVerifyEmail } from "@/hooks/useAuth";
import { verifyEmailSchema } from "@/lib/validations/auth";
import { useNavigate } from "react-router-dom";

export function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const userId = searchParams.get("userId") ?? "";
  
  const { mutate: verifyEmail, isError, isSuccess, isPending } = useVerifyEmail({ token, userId });

  useEffect(() => {
    const validatedData = verifyEmailSchema.safeParse({ token, userId });
    
    if (!validatedData.success) {

      const fieldErrors = validatedData.error.format();
      const errorMessage = 
        fieldErrors.validatedToken?._errors[0] || 
        fieldErrors.validatedUserId?._errors[0] || 
        "Invalid verification link";
      
      toast.error(errorMessage);
      return;
    }
    verifyEmail();
  }, [token, userId, verifyEmail]);

  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Hexagon className="h-10 w-10 text-yellow-400" />
          <span className="text-2xl font-bold text-white ml-2">Hive</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {isPending && "Verifying Your Email"}
              {isSuccess && "Email Verified"}
              {isError && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {isPending && "Please wait while we verify your email..."}
              {isSuccess && "Your email has been successfully verified and your account is now active."}
              {isError && "We couldn't verify your email."}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center py-6">
            {isPending && (
              <Loader2 className="h-16 w-16 text-yellow-400 animate-spin" />
            )}
            {isSuccess && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {isError && (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  The verification link may be invalid or expired.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            {isSuccess && (
              <Button 
                onClick={() => navigate("/login")} 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
                Login to Your Account
              </Button>
            )}
            {isError && (
              <Button 
                onClick={() => navigate("/")} 
                variant="outline"
              >
                Return to Home Page
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Verify;
