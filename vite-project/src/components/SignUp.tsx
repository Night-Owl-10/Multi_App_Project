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
import { useSignUp } from "@clerk/react";
import Otp from "./Otp";

type SignUpProps = {
    isSignUpOpen: boolean;
    setIsSignUpOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SignUp({ isSignUpOpen, setIsSignUpOpen }: SignUpProps) {

    const { signUp } = useSignUp();


    const [info, setInfo] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setInfo({ ...info, [name]: value });
    }

    async function handleGoogleSignUp() {
        const { error } = await signUp.sso({
            strategy: "oauth_google",
            redirectCallbackUrl: "/sso-callback",
            redirectUrl: "/",
        });

        if (error) {
            toast.error(error.longMessage ?? error.message);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (info.username.trim() === "" || info.email.trim() === "" || info.password.trim() === "") {
            toast.error("All fields are required");
            return;
        }

        try {
            const { error } = await signUp.password({
                username: info.username,
                emailAddress: info.email,
                password: info.password,
            });

            if (error) {
                toast.error(error.longMessage ?? error.message);
                return;
            }

            const { error: sendError } =
                await signUp.verifications.sendEmailCode();

            if (sendError) {
                toast.error(sendError.longMessage ?? sendError.message);
                return;
            }

            setShowOtpModal(true);

        } catch (err: any) {
            toast.error(
                err?.errors?.[0]?.message ?? "Something went wrong"
            );
        }
    }

    async function handleResendOtp() {
        const { error } = await signUp.verifications.sendEmailCode();

        if (error) {
            toast.error(error.longMessage ?? error.message);
            return;
        }
    }

    async function handleVerifyOtp(code: string) {
        const { error } =
            await signUp.verifications.verifyEmailCode({
                code,
            });

        if (error) {
            toast.error(error.longMessage ?? error.message);
            return;
        }

        toast.success("Email verified!");

        setShowOtpModal(false);
        setIsSignUpOpen(false);

        setInfo({
            username: "",
            email: "",
            password: "",
        });
    }


    return (
        <Dialog open={isSignUpOpen} onOpenChange={setIsSignUpOpen}>
            <DialogContent className="w-[300px] xs:w-100">
                <DialogTitle>Sign Up</DialogTitle>
                <DialogDescription>
                    Please enter your details to create an account.
                </DialogDescription>
                <form onSubmit={handleSubmit} className="mt-4">
                    <input type="text" placeholder="Username" name="username" value={info.username} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                    <input type="email" placeholder="Email" name="email" value={info.email} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                    <input type="password" placeholder="Password" name="password" value={info.password} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
                    <div className="flex items-center gap-2 justify-center mt-2">
                        <span className="h-px bg-gray-500 w-1/4"></span>
                        <span className="mx-3 text-gray-500">or</span>
                        <span className="h-px bg-gray-500 w-1/4"></span>
                    </div>
                    <button type="button" onClick={handleGoogleSignUp} className="block p-2 mx-auto w-fit bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Sign Up with Google</button>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <button type="submit" className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500">Sign Up</button>
                        <DialogClose asChild>
                            <button className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500">Cancel</button>
                        </DialogClose>
                    </div>
                </form>
            </DialogContent>
            <Otp
                open={showOtpModal}
                setOpen={setShowOtpModal}
                username={info.username}
                onVerify={handleVerifyOtp}
                onResend={handleResendOtp}
            />
        </Dialog>
    )
}

export default SignUp;