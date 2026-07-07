import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/Dialog"
import { useState } from "react"
import { toast } from "react-toastify"
import { signUp, signInWithGoogle, sendVerificationEmail } from "../firebase/authService";
import { Loader2 } from "lucide-react";
import axios from "axios";
import API from "@/api/axios";
import { deleteUser, updateProfile } from "firebase/auth";
import type { UserCredential } from "firebase/auth";

type SignUpProps = {
    isSignUpOpen: boolean;
    setIsSignUpOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SignUp({ isSignUpOpen, setIsSignUpOpen }: SignUpProps) {

    const DEFAULT_AVATAR = "https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356042/profile_n0nnut.png"
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>(DEFAULT_AVATAR);
    const [info, setInfo] = useState({
        username: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setInfo({ ...info, [name]: value });
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnailFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === "string") {
                setThumbnailPreview(result);
            }
        }
        reader.readAsDataURL(file);
    }

    const uploadImage = async (file: File) => {
        try {
            const data = new FormData();

            data.append("file", file);
            data.append("upload_preset", "multi-app");

            const response = await axios.post(
                `https://api.cloudinary.com/v1_1/dru7e6cnq/image/upload`,
                data
            );

            return {
                secure_url: response.data.secure_url,
                public_id: response.data.public_id,
            };
        } catch (error: any) {
            toast.error(error?.message || "Failed to upload image");
        }
    };

    async function handleGoogleSignUp() {
        const userCredential = await signInWithGoogle();

        try {
            try {
                const response = await API.post("/users/google-signUp", {
                    username: userCredential.user.displayName,
                    email: userCredential.user.email,
                    firebase_uid: userCredential.user.uid,
                    avatar_url: userCredential.user.photoURL,
                });
                toast.success(response.data.message);
            } catch (error: any) {
                await deleteUser(userCredential.user);
                throw error;
            }
        } catch (error: any) {
            toast.error(error?.message || "Error signing up");
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (info.username.trim() === "" || info.email.trim() === "" || info.password.trim() === "") {
            toast.error("All fields are required");
            return;
        }

        let avatar: string | undefined;
        let image:
            | {
                secure_url: string;
                public_id: string;
            }
            | undefined;

        if (thumbnailFile) {
            image = await uploadImage(thumbnailFile);

            if (!image) {
                return;
            }

            avatar = image.secure_url;
        }

        let userCredential: UserCredential;

        try {
            setLoading(true);
            userCredential = await signUp(info.email, info.password);
            await updateProfile(userCredential.user, {
                displayName: info.username,
                photoURL: avatar,
            });
            await sendVerificationEmail(userCredential.user);
            try {
                const response = await API.post("/users/email-signUp", {
                    username: info.username,
                    email: info.email,
                    firebase_uid: userCredential.user.uid,
                    avatar_url: avatar,
                    avatar_public_id: image?.public_id ?? null
                });
                setInfo({
                    username: "",
                    email: "",
                    password: ""
                });
                setThumbnailFile(null);
                setThumbnailPreview(DEFAULT_AVATAR);
                setIsSignUpOpen(false);
                toast.success(response.data.message || "Account Created Successfully Please Verify the Email");

            } catch (error: any) {
                await deleteUser(userCredential.user);
                throw error;
            }

        } catch (error: any) {
            toast.error(error?.message || "Error signing up");
        } finally {
            setLoading(false);
        }

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
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-sm xs:text-base">Upload Avatar:</p>
                            <input type="file" onChange={(e) => handleFileChange(e)} className="w-38 xs:w-48 text-center p-1 text-xs xs:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="w-16 h-16 border border-gray-300 rounded-full overflow-hidden relative">
                            <img src={thumbnailPreview} className="h-full w-full object-cover rounded-full" alt="Avatar preview" />
                            {loading && <Loader2 className="loader" />}
                        </div>
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
        </Dialog>
    )
}

export default SignUp;