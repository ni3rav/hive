//***
//  before you start read comments in this order: comments with exclamantion, comments with TODO, comments with asterisk *
// install the better comments extension if you haven't already, so then reading order of comments will be like: red, orange, green
// go top to down
//  */

//! and please please please dont't disable the eslint rules unless you have a good reason, you are inviting troubles your way if you do it unnecessarily, for the case here you could have simply removed the unused variable than putting this comment ->  /* eslint-disable @typescript-eslint/no-unused-vars */ -> it's fine in very certain cases but for the most parts it's always a good idea to resolve linting issues

import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Hexagon } from "lucide-react";
// import { useVerifyEmail } from "@/hooks/useAuth";

export function Verify() {
  // TODO: you can simply use these destructured values from the hook instead of managin state by yourself
  // const { mutate: verifyEmail, isError, isSuccess, isPending } = useVerifyEmail();
  //* this part is correct
  const [searchParams] = useSearchParams();
  // const navigate = useNavigate();

  //! you don't need these states instead you can use the useVerifyEmail hook, so i am commenting out these and all the code that uses them
  // const [validationState, setValidationState] = useState<
  //   "validating" | "invalid" | "valid"
  // >("validating");

  // const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    //* fetching token and userId from search params this part is correct
    // const token = searchParams.get("token");
    // const userId = searchParams.get("userId");
    //* then validate them using zod
    // const validatedData = verifyEmailSchema.safeParse({
    //   validatedUserId: userId,
    //   validatedToken: token,
    // });
    // if (!validatedData.success) {
    //   toast.error("Invalid data provided. Please check your inputs.");
    //   return;
    // }
    // const { validatedUserId, validatedToken } = validatedData.data;
    //! since we used zod you don't need to set in a state or handle them manually, zod has provison to do this for us it even allows you to show a toast notification if the a particular piece of data is invalid (please look into it)
    // if (!token) {
    //   setValidationState("invalid");
    //   setErrorMessage("Verification token is missing.");
    //   return;
    // }
    // if (!userId) {
    //   setValidationState("invalid");
    //   setErrorMessage("User ID is missing.");
    //   return;
    // }
    //! as i mentioned you don't need to do this, you can use the useVerifyEmail hook cuz hook uses axios's instance under the hood which helps keep code clean and consistent
    // const verifyEmail = async () => {
    //   try {
    //     const response = await fetch(`http://localhost:3000/api/auth/verify?token=${token}&userId=${userId}`);
    //     if (response.ok) {
    //       setValidationState("valid");
    //     } else {
    //       const errorData = await response.json();
    //       setValidationState("invalid");
    //       setErrorMessage(errorData.message || "Verification failed.");
    //     }
    //   } catch (error) {
    //     setValidationState("invalid");
    //     setErrorMessage("Connection error. Please try again.");
    //   }
    // };
    // verifyEmail();
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
              {/* *again not need these states rather use the hook */}
              {/* {validationState === "validating" && "Verifying Your Email"}
              {validationState === "valid" && "Email Verified"}
              {validationState === "invalid" && "Verification Failed"} */}
            </CardTitle>
            <CardDescription>
              {/* *again not need these states rather use the hook */}
              {/* {validationState === "validating" && "Please wait while we verify your email..."}
              {validationState === "valid" && "Your email has been successfully verified and your account is now active."}
              {validationState === "invalid" && "We couldn't verify your email."} */}
            </CardDescription>
          </CardHeader>

          <CardContent className="flex justify-center py-6">
            {/* *again not need these states rather use the hook and refrain from using hardcoded colors, use css tokens instead*/}

            {/* {validationState === "validating" && (
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
            )} */}
          </CardContent>

          <CardFooter className="flex justify-center">
            {/* *again not need these states rather use the hook and refrain from using hardcoded colors, use css tokens instead*/}

            {/* {validationState === "valid" && (
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
            )} */}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default Verify;
