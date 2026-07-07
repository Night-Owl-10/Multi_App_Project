import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";

type UserProps = {
    id: number,
    fullName: string,
    username: string,
    imageUrl: string,
    createdAt: string,
    emailAddress: string,
    verification: {
        status: string
    }
}

function Profile() {
    const user: UserProps = {
        id: 1,
        fullName: "John Doe",
        username: "johndoe",
        imageUrl: "https://via.placeholder.com/150",
        createdAt: "2022-01-01",
        emailAddress: "[EMAIL_ADDRESS]",
        verification: {
            status: "verified"
        }
    };


    const joinedDate = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Unknown";

    async function handleSignOut() {
        // firebase signout logic
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center py-20">
                Loading...
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 px-4">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

                <div className="bg-gradient-to-r from-blue-500 to-sky-500 h-28"></div>

                <div className="flex flex-col items-center -mt-14 pb-8">

                    <img
                        src={user.imageUrl}
                        alt="Profile"
                        className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
                    />

                    <h1 className="text-3xl font-bold mt-4">
                        {user.fullName || "No Name"}
                    </h1>

                    <p className="text-gray-500">
                        @{user.username || "No Username"}
                    </p>

                    <div className="w-full mt-8 px-8 space-y-5">

                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500">
                                Email
                            </h2>

                            <p className="font-medium">
                                {user.emailAddress}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4 flex justify-between items-center">
                            <span>Email Verification</span>

                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${user.verification.status ===
                                    "verified"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {user.verification.status ===
                                    "verified"
                                    ? "Verified"
                                    : "Not Verified"}
                            </span>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500">
                                User ID
                            </h2>

                            <p className="text-sm break-all">
                                {user.id}
                            </p>
                        </div>

                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500">
                                Joined
                            </h2>

                            <p>{joinedDate}</p>
                        </div>

                    </div>

                    <div className="flex gap-4 mt-8">

                        <button
                            onClick={handleSignOut}
                            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
                        >
                            Sign Out
                        </button>

                    </div>

                </div>
            </div>
        </div>
    );
}

export default Profile;