import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/Dialog"
import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

type SignUpProps = {
    isSignUpOpen: boolean;
    setIsSignUpOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

function SignUp({ isSignUpOpen, setIsSignUpOpen }: SignUpProps) {

    const [imageURL, setImageURL] = useState("https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356042/profile_n0nnut.png");
    const [info, setInfo] = useState({
        username: "",
        email: "",
        password: "",
        avatar: imageURL
    });
    const [loading, setLoading] = useState(false);

    async function uploadImage(e: React.ChangeEvent<HTMLInputElement>) {
        setLoading(true);
        const img = e.target.files;
        const data = new FormData();
        data.append("file", img ? img[0] : "");
        data.append("upload_preset", "multi-app");
        try {
            const response = await axios.post("https://api.cloudinary.com/v1_1/dru7e6cnq/image/upload", data)
            const imageUrl = response.data.url
            setImageURL(imageUrl)
            setInfo({ ...info, avatar: imageUrl });
        } catch (error) {
            console.log(error);
            toast.error("Error uploading image");
        } finally {
            setLoading(false);
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setInfo({ ...info, [name]: value });
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (info.username.trim() === "" || info.email.trim() === "" || info.password.trim() === "") {
            toast.error("All fields are required");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/users/register", info, { withCredentials: true });
            toast.success(response.data.message);
            info.username = "";
            info.email = "";
            info.password = "";
            setImageURL("https://res.cloudinary.com/dru7e6cnq/image/upload/v1772469098/default-profile-picture1_xdypkl.jpg");
            setIsSignUpOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error registering user");
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
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex justify-center items-center gap-2">
                            <p className="text-sm xs:text-base">Upload Avatar:</p>
                            <input type="file" onChange={(e) => uploadImage(e)} className="w-38 xs:w-48 text-center p-1 text-xs xs:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div className="w-16 h-16 border border-gray-300 rounded-full overflow-hidden relative">
                            <img src={imageURL} className="h-full w-full object-cover rounded-full" alt="Avatar preview" />
                            {loading && <Loader2 className="loader" />}
                        </div>
                    </div>
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