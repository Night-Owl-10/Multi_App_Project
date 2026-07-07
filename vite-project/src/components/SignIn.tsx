import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/Dialog"
import { useState } from "react"
import { toast } from "react-toastify";
import clsx from "clsx";
import { signIn, signInWithGoogle } from "@/firebase/authService";
import API from "@/api/axios";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";


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
      await signOut(auth);
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
        toast.error("Please verify your email before signing in.");
        await signOut(auth);
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

      setIsSignInOpen(false);

    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
        error.message ||
        "Error signing in"
      );
    } finally {
      setLoading(false);
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