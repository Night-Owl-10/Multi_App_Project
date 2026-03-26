import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Edit, Check, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/Dialog"
import clsx from "clsx";


function Profile() {

  const { user, setUser } = useContext(AuthContext)!;
  const [usernameEditing, setUsernameEditing] = useState(false);
  const [emailEditing, setEmailEditing] = useState(false);
  const [imageEditing, setImageEditing] = useState(user?.avatar);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || "",
    email: user?.email || "",
    avatar: imageEditing
  });
  const [confirmDelete, setConfirmDelete] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    setLoading(true);
    const img = e.target.files;
    const data = new FormData();
    data.append("file", img ? img[0] : "");
    data.append("upload_preset", "multi-app");
    try {
      const response = await axios.post("https://api.cloudinary.com/v1_1/dru7e6cnq/image/upload", data)
      const imageUrl = response.data.url
      setImageEditing(imageUrl)
      setEditedUser({ ...editedUser, avatar: imageUrl });
    } catch (error) {
      console.log(error);
      toast.error("Error uploading image");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (editedUser.username.trim() === "" || editedUser.email.trim() === "") {
      toast.error("All fields are required");
      return;
    }
    try {
      const response = await axios.put("http://localhost:5000/api/users/update", editedUser, { withCredentials: true })
      if (response.status == 200) {
        localStorage.setItem("user", JSON.stringify(response.data));
        setUser(response.data);
        toast.success("Info updated successfully")
      }
    } catch (error) {
      toast.error("Error while updating info.");
    }
  }

  async function handleDelete() {
    try {
      const response = await axios.delete("http://localhost:5000/api/users/delete", { withCredentials: true })
      if (response.status == 200) {
        localStorage.removeItem("user");
        setUser(null);
        toast.success("Account deleted successfully");
        navigate("/");
      }
    } catch (error) {
      toast.error("Error while deleting account.");
    }
  }

  return (
    <div className="max-w-7xl mx-auto min-h-screen pt-12">
      <h1 className="text-3xl font-bold mb-4">Your Profile</h1>
      <button onClick={() => navigate("/")} className="bg-gray-500 text-white text-sm xs:text-base px-2 xs:px-4 py-2 rounded-full hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 mb-12 flex items-center gap-2"><ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5" />Back</button>
      <div className="w-full min-h-[350px] border border-gray-300 shadow-gray-400 shadow-md rounded-lg px-8 py-4 md:py-0 gap-12 flex flex-col justify-center items-center">
        <form onSubmit={(e) => handleUpdate(e)} className="w-full flex flex-col md:flex-row justify-center items-center gap-4 ">
          <div className="h-38 w-38 md:h-48 md:w-48 rounded-full overflow-hidden group relative">
            <img src={imageEditing} className="h-full w-full object-cover" alt="Vite logo" />
            <label htmlFor="file" className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {!loading && <Edit className="text-white" />}
              <input type="file" onChange={(e) => handleImageChange(e)} id="file" className="hidden" />
            </label>
            {loading && <Loader2 className="loader" />}
          </div>
          <div className="flex flex-col align-center md:align-start gap-4">
            <div className="flex items-center gap-2">
              {usernameEditing ? (
                <div className="flex items-center gap-2">
                  <input className=" border-b border-gray-300 rounded-md p-2 focus:outline-none" type="text" name="username" value={editedUser.username ? editedUser.username : user?.username} onChange={(e) => handleChange(e)} />
                  <button type="button" className="cursor-pointer" onClick={() => setUsernameEditing(false)}><Check /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-xl font-semibold">{editedUser.username ? editedUser.username : user?.username}</p>
                  <button type="button" className="cursor-pointer" onClick={() => setUsernameEditing(true)}><Edit /></button>
                </div>
              )}

            </div>
            <div className="flex items-center gap-2">
              {emailEditing ? (
                <div className="flex items-center gap-2">
                  <input className=" border-b border-gray-300 rounded-md p-2 focus:outline-none" type="text" name="email" value={editedUser.email ? editedUser.email : user?.email} onChange={(e) => handleChange(e)} />
                  <button type="button" className="cursor-pointer" onClick={() => setEmailEditing(false)}><Check /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-gray-500">{editedUser.email ? editedUser.email : user?.email}</p>
                  <button type="button" className="cursor-pointer" onClick={() => setEmailEditing(true)}><Edit /></button>
                </div>
              )}
            </div>
            <button type="submit" className="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 self-center md:self-start">Update</button>
          </div>
        </form>
        <Dialog>
          <DialogTrigger asChild>
            <button className="w-[200px] bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors duration-300 flex justify-center items-center gap-2 mb-4 md:mb-0"><Trash2 />Delete Account</button>
          </DialogTrigger>
          <DialogContent className="w-[300px] xs:w-[400px] sm:w-fit">
            <DialogTitle>Are you sure you want to delete your account?</DialogTitle>
            <DialogDescription className="mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </DialogDescription>
            <input type="text" placeholder="DELETE" value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4" />
            <div className="flex justify-center items-center gap-4">
              <DialogClose asChild>
                <button onClick={handleDelete} disabled={confirmDelete !== "DELETE"} className={clsx("w-[200px] text-white text-sm xs:text-base p-2 rounded-md transition-colors duration-300 flex justify-center items-center gap-2", confirmDelete !== "DELETE" ? "cursor-not-allowed bg-red-500/50" : "bg-red-500 hover:bg-red-600")}><Trash2 className="hidden xs:block" />Confirm Delete</button>
              </DialogClose>
              <DialogClose asChild>
                <button className="w-[200px] bg-gray-500 text-white text-sm xs:text-base p-2 rounded-md hover:bg-gray-600 transition-colors duration-300 flex justify-center items-center gap-2">Cancel</button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default Profile;