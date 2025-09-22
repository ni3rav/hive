/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Hexagon, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export function Verify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [validationState, setValidationState] = useState<
    "validating" | "invalid" | "valid"
  >("validating");
  
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const token = searchParams.get("token");
    const userId = searchParams.get("userId");

    if (!token) {
      setValidationState("invalid");
      setErrorMessage("Verification token is missing.");
      return;
    }

    if (!userId) {
      setValidationState("invalid");
      setErrorMessage("User ID is missing.");
      return;
    }

    const verifyEmail = async () => {
      try {

        const response = await fetch(`http://localhost:3000/api/auth/verify?token=${token}&userId=${userId}`);
        
        if (response.ok) {
          setValidationState("valid");
        } else {
          const errorData = await response.json();
          setValidationState("invalid");
          setErrorMessage(errorData.message || "Verification failed.");
        }
      } catch (error) {
        setValidationState("invalid");
        setErrorMessage("Connection error. Please try again.");
      }
    };

    verifyEmail();
  }, [searchParams]);

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
              {validationState === "validating" && "Verifying Your Email"}
              {validationState === "valid" && "Email Verified"}
              {validationState === "invalid" && "Verification Failed"}
            </CardTitle>
            <CardDescription>
              {validationState === "validating" && "Please wait while we verify your email..."}
              {validationState === "valid" && "Your email has been successfully verified and your account is now active."}
              {validationState === "invalid" && "We couldn't verify your email."}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex justify-center py-6">
            {validationState === "validating" && (
              <Loader2 className="h-16 w-16 text-yellow-400 animate-spin" />
            )}
            {validationState === "valid" && (
              <CheckCircle className="h-16 w-16 text-green-500" />
            )}
            {validationState === "invalid" && (
              <div className="text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            {validationState === "valid" && (
              <Button 
                onClick={() => navigate("/login")} 
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
              >
                Login to Your Account
              </Button>
            )}
            {validationState === "invalid" && (
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
