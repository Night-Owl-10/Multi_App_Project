
import { useState, useEffect } from "react"
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'

function Header() {

  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          <Show when="signed-out">
            <div className="h-8 w-8 rounded-full overflow-hidden flex justify-center items-center cursor-pointer" onClick={() => setDropdownOpen(prev => !prev)}>
              <img src={"https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356031/default-profile-picture1_cfijqb.jpg"} className="h-full w-full object-cover" alt="Vite logo" />
            </div>
          </Show>
          <Show when="signed-in">
            <UserButton
              userProfileMode="navigation"
              userProfileUrl="/profile"
              appearance={{
                variables: {
                  colorPrimary: "#2563eb",
                  colorBackground: "#ffffff",
                  colorForeground: "#111827",
                },

                elements: {
                  avatarBox:
                    "!h-10 !w-10 border-2 border-blue-500",

                  userButtonPopoverCard:
                    "rounded-xl shadow-xl",

                  userButtonPopoverActionButton:
                    "hover:bg-blue-50",

                  userButtonPopoverActionButtonText:
                    "text-gray-700",

                  userButtonPopoverFooter:
                    "hidden",
                },
              }}
            />
          </Show>

          {
            dropdownOpen && (
              <Show when="signed-out">
                <div className="absolute top-10 right-0 z-10 bg-white border border-gray-300 rounded-md shadow-md w-40 flex flex-col">

                  <SignInButton
                    mode="modal"
                    appearance={{
                      variables: {
                        colorPrimary: "#2563eb",
                        colorBackground: "#ffffff",
                        colorForeground: "#111827",
                        colorInputForeground: "#111827",
                        colorInput: "#f9fafb",
                        borderRadius: "12px",
                      },

                      elements: {
                        card: "shadow-2xl rounded-xl",
                        headerTitle: "text-2xl font-bold",
                        headerSubtitle: "text-gray-500",

                        formButtonPrimary:
                          "bg-blue-600 hover:bg-blue-700 text-white",

                        formFieldInput:
                          "rounded-lg border border-gray-300",

                        socialButtonsBlockButton:
                          "rounded-lg border",

                        footerActionLink:
                          "text-blue-600",
                      },
                    }}
                  >
                    <button className="px-4 py-2 hover:bg-gray-100 text-left">Sign In</button>
                  </SignInButton>
                  <SignUpButton
                    mode="modal"
                    appearance={{
                      variables: {
                        colorPrimary: "#2563eb",
                        colorBackground: "#ffffff",
                        colorForeground: "#111827",
                        borderRadius: "12px",
                      },

                      elements: {
                        card: "rounded-xl shadow-xl",

                        formButtonPrimary:
                          "bg-blue-600 hover:bg-blue-700",

                        formFieldInput:
                          "rounded-lg",

                        socialButtonsBlockButton:
                          "rounded-lg",
                      },
                    }}
                  >
                    <button className="px-4 py-2 hover:bg-gray-100 text-left">Sign Up</button>
                  </SignUpButton>

                </div>
              </Show>
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