
import { useState, useEffect } from "react"
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../firebase/authService";


function Header() {

  const { firebaseUser, profile, loading } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const [theme, setTheme] = useState(JSON.parse(localStorage.getItem("theme") || "null") || "medium");

  useEffect(() => {
    localStorage.setItem("theme", JSON.stringify(theme));
    document.documentElement.removeAttribute("class");
    document.documentElement.classList.add(theme);
  }, [theme]);
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname === path;
  }



  async function handleSignOut() {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error?.message || "Error signing out");
    }
  }

  return (
    <header>
      <div className="bg-white h-16 border border-gray-300 border-b-2 shadow-[-10px_0px_20px_-5px_rgba(0,0,0,0.3)] rounded-t-lg w-full flex justify-between items-center gap-4 px-4 md:px-8">
        <div className="flex justify-center items-center gap-4 px-2 md:px-4">
          <div onClick={() => navigate("/")} className="h-6 w-6 md:h-8 md:w-8 rounded-full overflow-hidden cursor-pointer">
            <img src="/vite.svg" className="h-full w-full object-cover" alt="Vite logo" />
          </div>
          <h1 className="text-xl md:text-2xl font-semibold">Multi App</h1>
        </div>
        <div className="relative">
          <div className="h-8 w-8 rounded-full overflow-hidden flex justify-center items-center cursor-pointer" onClick={() => setDropdownOpen(prev => !prev)}>
            <img
              src={profile?.avatar_url || "https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356031/default-profile-picture1_cfijqb.jpg"}
              alt="Profile"
              className="h-full w-full object-cover"
            />
          </div>

          <SignIn isSignInOpen={isSignInOpen} setIsSignInOpen={setIsSignInOpen} />
          <SignUp isSignUpOpen={isSignUpOpen} setIsSignUpOpen={setIsSignUpOpen} />
          {
            dropdownOpen && (

              <div className="absolute top-10 right-0 z-10 bg-white border border-gray-300 rounded-md shadow-md w-40 flex flex-col">
                {!firebaseUser && <button onClick={() => {
                  setIsSignInOpen(true);
                  setDropdownOpen(false);
                }} className="px-4 py-2 hover:bg-gray-100 text-left">Sign In</button>}
                {!firebaseUser && <button onClick={() => {
                  setIsSignUpOpen(true);
                  setDropdownOpen(false);
                }} className="px-4 py-2 hover:bg-gray-100 text-left">Sign Up</button>}
                {firebaseUser && <button onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }} className="px-4 py-2 hover:bg-gray-100 text-left">Profile</button>}
                {firebaseUser && <button onClick={() => {
                  handleSignOut();
                  setDropdownOpen(false);
                }} className="px-4 py-2 hover:bg-gray-100 text-left">Sign Out</button>}
              </div>

            )
          }
        </div>
      </div>
      <nav className="bg-white h-24 sm:h-12 border border-gray-300 border-r-0 xs:rounded-bl-full rounded-bl-lg shadow-[-10px_10px_20px_-5px_rgba(0,0,0,0.3)] w-full flex flex-col sm:flex-row justify-center sm:justify-between items-center sm:gap-4 gap-2 xs:px-4 sm:px-12 mt-1">
        <ul className="flex gap-6">
          <li><Link to="/" className="relative group">
            <span className="text-gray-500 xs:text-base text-sm font-semibold hover:text-gray-700 z-10">To Do List</span>
            <span
              className={
                isActive("/")
                  ? "absolute bottom-[-2px] left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-sky-500"
                  : "absolute bottom-[-2px] left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-sky-500 group-hover:w-full transition-all duration-300"
              }
            ></span>
          </Link></li>
          <li><Link to="/weather" className="relative group">
            <span className="text-gray-500 xs:text-base text-sm font-semibold hover:text-gray-700 z-10">Weather App</span>
            <span
              className={
                isActive("/weather")
                  ? "absolute bottom-[-2px] left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-sky-500"
                  : "absolute bottom-[-2px] left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-sky-500 group-hover:w-full transition-all duration-300"
              }
            ></span>
          </Link></li>
          <li><Link to="/tictactoe" className="relative group">
            <span className="text-gray-500 xs:text-base text-sm font-semibold hover:text-gray-700 z-10">Tic Tac Toe</span>
            <span
              className={
                isActive("/tictactoe")
                  ? "absolute bottom-[-2px] left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-sky-500"
                  : "absolute bottom-[-2px] left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-sky-500 group-hover:w-full transition-all duration-300"
              }
            ></span>
          </Link></li>
        </ul>
        <div className="themeSelector">
          <span onClick={() => setTheme("light")} className={theme === "light" ? "light activeTheme" : "light"}></span>
          <span onClick={() => setTheme("medium")} className={theme === "medium" ? "medium activeTheme" : "medium"}></span>
          <span onClick={() => setTheme("dark")} className={theme === "dark" ? "dark activeTheme" : "dark"}></span>
          <span onClick={() => setTheme("gOne")} className={theme === "gOne" ? "gOne activeTheme" : "gOne"}></span>
          <span onClick={() => setTheme("gTwo")} className={theme === "gTwo" ? "gTwo activeTheme" : "gTwo"}></span>
          <span onClick={() => setTheme("gThree")} className={theme === "gThree" ? "gThree activeTheme" : "gThree"}></span>
        </div>
      </nav>
    </header>
  )
}

export default Header