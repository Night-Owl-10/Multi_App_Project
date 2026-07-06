import { UserProfile, useUser } from "@clerk/react";
import { Navigate } from "react-router-dom";

export default function Profile() {

    const { isLoaded, isSignedIn } = useUser();

    if (!isLoaded) {
        return <div className="flex justify-center items-center h-screen text-center text-2xl font-bold">Loading...</div>;
    }

    if (!isSignedIn) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="flex justify-center py-10">
            <UserProfile
                appearance={{
                    variables: {
                        colorPrimary: "#2563eb",
                        colorBackground: "#ffffff",
                        colorForeground: "#111827",
                        colorInput: "#f9fafb",
                        colorInputForeground: "#111827",
                        borderRadius: "12px",
                    },

                    elements: {
                        card: "shadow-2xl rounded-2xl border-0",

                        navbar: "bg-gray-50",

                        profileSection: "border-0",

                        avatarBox: "!w-16 !h-16",

                        profileSectionPrimaryButton:
                            "text-blue-600 hover:text-blue-700",

                        formFieldInput:
                            "rounded-lg",

                        navbarButton:
                            "rounded-lg",

                        navbarButtonActive:
                            "bg-blue-100",

                        footer:
                            "hidden",
                    }
                }}
            />
        </div>
    );
}