import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/Dialog"
import { useState, useEffect } from "react"
import { toast } from "react-toastify";
import clsx from "clsx";
import { signIn, signInWithGoogle, logout, sendVerificationEmail, forgotPassword } from "@/firebase/authService";
import API from "@/api/axios";
import { User } from "firebase/auth";


type SignInProps = {
  isSignInOpen: boolean;
  setIsSignInOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SignIn({ isSignInOpen, setIsSignInOpen }: SignInProps) {

  const [logInInfo, setLoginInfo] = useState({
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<User | null>(null);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (!isSignInOpen) {
      setUnverifiedUser(null);
      setResending(false);
      setCooldown(0);
      setLoginInfo({
        email: "",
        password: ""
      });
      setLoading(false);
      setGoogleLoading(false);
    }
  }, [isSignInOpen]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setLoginInfo({ ...logInInfo, [name]: value });
  }

  async function handleGoogleSignIn() {
    try {
      setGoogleLoading(true);

      const userCredential = await signInWithGoogle();

      const response = await API.post("/users/google-signIn", {
        firebase_uid: userCredential.user.uid,
      });

      toast.success(response.data.message);

      setIsSignInOpen(false);

    } catch (error: any) {
      await logout();
      toast.error(error.response?.data?.message || "Error signing in");
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (
      logInInfo.email.trim() === "" ||
      logInInfo.password.trim() === ""
    ) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signIn(
        logInInfo.email,
        logInInfo.password
      );

      if (!userCredential.user.emailVerified) {
        setUnverifiedUser(userCredential.user);
        toast.error("Please verify your email before signing in.");
        await logout();
        return;
      }

      const response = await API.post("/users/email-signIn", {
        firebase_uid: userCredential.user.uid,
      });

      toast.success(response.data.message);

      setLoginInfo({
        email: "",
        password: "",
      });

      setUnverifiedUser(null);
      setIsSignInOpen(false);

    } catch (error: any) {
      switch (error.code) {
        case "auth/invalid-credential":
          toast.error(
            "Incorrect Password or this account uses Google Sign-In. Please do Forgot password to set a password first"
          );
          break;

        case "auth/user-not-found":
          toast.error("Account not found.");
          break;

        case "auth/wrong-password":
          toast.error("Incorrect password.");
          break;

        default:
          toast.error("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResendEmail() {
    if (!unverifiedUser) {
      toast.error("You are already verified or something went wrong. Please try signing in again.");
      return;
    }

    try {
      setResending(true);

      await sendVerificationEmail(unverifiedUser);

      toast.success("Verification email sent.");
      setCooldown(60);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend email.");
    } finally {
      setResending(false);
    }
  }

  async function handleForgotPassword() {

    if (!logInInfo.email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    try {

      await forgotPassword(logInInfo.email);

      toast.success(
        "If an account exists for this email, a password reset link has been sent."
      );

    } catch (error: any) {

      switch (error.code) {

        case "auth/invalid-email":
          toast.error("Please enter a valid email.");
          break;

        default:
          toast.error("Unable to send reset email.");
      }

    }

  }

  return (
    <Dialog open={isSignInOpen} onOpenChange={setIsSignInOpen}>
      <DialogContent className="w-[300px] xs:w-100">
        <DialogTitle>Sign In</DialogTitle>
        <DialogDescription>
          Please enter your credentials to sign in.
        </DialogDescription>
        <form onSubmit={handleSubmit} className="mt-4">
          <input type="email" placeholder="Email" name="email" value={logInInfo.email} onChange={(e) => handleChange(e)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
          <input type="password" placeholder="Password" name="password" value={logInInfo.password} onChange={(e) => handleChange(e)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
          <button type="button" onClick={handleForgotPassword} className="underline text-purple-500 text-sm mt-2 w-fit cursor-pointer hover:text-purple-700">Forgot Password?</button>
          <div className="flex items-center gap-2 justify-center mt-4">
            <span className="h-px bg-gray-500 w-1/4"></span>
            <span className="mx-3 text-gray-500">or</span>
            <span className="h-px bg-gray-500 w-1/4"></span>
          </div>

          <button
            type="button"
            disabled={googleLoading || loading}
            onClick={handleGoogleSignIn}
            className={clsx("block p-2 mx-auto mt-3 w-fit bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
              (googleLoading || loading) && "opacity-50 cursor-not-allowed"
            )}
          >
            {googleLoading ? "Redirecting..." : "Continue with Google"}
          </button>
          {unverifiedUser && (
            <button
              type="button"
              onClick={handleResendEmail}
              disabled={resending || cooldown > 0}
              className={clsx("block p-2 mx-auto mt-3 w-fit bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
                resending || cooldown > 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              {resending || cooldown > 0 ? (cooldown > 0 ? `Resend after ${cooldown}s` : "Sending...") : "Resend Verification Email"}
            </button>
          )}
          <div className="flex justify-center items-center gap-4 mt-4">
            <button type="submit" disabled={loading} className={clsx("p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
              loading && "opacity-50 cursor-not-allowed"
            )}>{loading ? "Signing In..." : "Sign In"}</button>
            <DialogClose asChild>
              <button className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Cancel</button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SignIn;