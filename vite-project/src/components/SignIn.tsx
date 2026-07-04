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
import { useSignIn, useClerk } from "@clerk/react";
import clsx from "clsx";


type SignInProps = {
  isSignInOpen: boolean;
  setIsSignInOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SignIn({ isSignInOpen, setIsSignInOpen }: SignInProps) {

  const { signIn } = useSignIn();
  const clerk = useClerk();

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

  // TODO:
  // SignInFuture.sso() in Clerk v6.9.1 returns { error: null }
  // without performing the redirect.
  // Using authenticateWithRedirect() as a temporary workaround.
  // Revisit after upgrading Clerk.

  async function handleGoogleSignIn() {
    if (googleLoading || loading) return;

    setGoogleLoading(true);
    try {
      await clerk.client!.signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (err: any) {
      toast.error(
        err?.errors?.[0]?.longMessage ??
        err?.errors?.[0]?.message ??
        "Failed to sign in with Google"
      );
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

    setLoading(true);

    try {
      const { error } = await signIn.password({
        emailAddress: logInInfo.email,
        password: logInInfo.password,
      });

      if (error) {
        const errorMessage =
          error.message === "The verification strategy is not valid for this account"
            ? "This account was created with Google. Please continue with Google or set a password from your profile."
            : error.longMessage ?? error.message;

        toast.error(errorMessage);
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();

        toast.success("Signed in successfully!");

        setLoginInfo({
          email: "",
          password: "",
        });

        setIsSignInOpen(false);
      }
    } catch (err: any) {
      toast.error(
        err?.errors?.[0]?.message ??
        "Something went wrong"
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