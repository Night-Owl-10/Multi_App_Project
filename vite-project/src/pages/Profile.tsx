import { useNavigate, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useState, useRef } from "react";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../firebase/authService";
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword,
    deleteUser,
} from "firebase/auth";
import API from "../api/axios";
import axios from "axios";

const CLOUDINARY_CLOUD = "dru7e6cnq";
const CLOUDINARY_UPLOAD_PRESET = "multi-app";

function Profile() {
    const navigate = useNavigate();
    const { firebaseUser, profile, refreshProfile, loading } = useAuth();

    // ── Username editing ─────────────────────────────────────────────────────
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [newUsername, setNewUsername] = useState("");
    const [savingUsername, setSavingUsername] = useState(false);

    // ── Avatar ───────────────────────────────────────────────────────────────
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // ── Change Password modal ────────────────────────────────────────────────
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [changingPassword, setChangingPassword] = useState(false);

    // ── Delete Account modal ─────────────────────────────────────────────────
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingAccount, setDeletingAccount] = useState(false);

    // ── Derived values ───────────────────────────────────────────────────────
    const joinedDate = profile?.createdAt
        ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "Unknown";

    const isEmailVerified = firebaseUser?.emailVerified ?? false;

    const hasPasswordProvider = firebaseUser?.providerData.some(
        p => p.providerId === "password"
    );

    // ── Sign out ─────────────────────────────────────────────────────────────
    async function handleSignOut() {
        try {
            await logout();
            toast.success("Signed out successfully");
            navigate("/");
        } catch (error: any) {
            toast.error(error?.message || "Error signing out");
        }
    }

    // ── Username ─────────────────────────────────────────────────────────────
    function handleEditUsername() {
        setNewUsername(profile?.username || "");
        setIsEditingUsername(true);
    }

    async function handleSaveUsername() {
        if (!firebaseUser) return;

        const trimmed = newUsername.trim();
        if (!trimmed) {
            toast.error("Username cannot be empty");
            return;
        }
        if (trimmed.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }
        if (trimmed.length > 30) {
            toast.error("Username must be at most 30 characters");
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            toast.error("Username can only contain letters, numbers, and underscores");
            return;
        }

        try {
            setSavingUsername(true);
            await API.put(`/users/update-username/${firebaseUser.uid}`, {
                username: trimmed,
            });
            await refreshProfile();
            setIsEditingUsername(false);
            toast.success("Username updated successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to update username");
        } finally {
            setSavingUsername(false);
        }
    }

    // ── Avatar ───────────────────────────────────────────────────────────────
    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file || !firebaseUser) return;

        try {
            setUploadingAvatar(true);

            // 1. Upload new image directly to Cloudinary from the frontend
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const cloudRes = await axios.post(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`,
                formData
            );

            const { secure_url, public_id } = cloudRes.data;

            // 2. Send new avatar info to backend — the backend handles deleting
            //    the old Cloudinary image and updating the database
            await API.put(`/users/update-avatar/${firebaseUser.uid}`, {
                avatar_url: secure_url,
                avatar_public_id: public_id,
            });

            // 3. Refresh global profile state from the server
            await refreshProfile();
            toast.success("Avatar updated successfully");

        } catch (error: any) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update avatar");
        } finally {
            setUploadingAvatar(false);
            // Reset the file input so the same file can be re-selected if needed
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    }

    // ── Change Password ──────────────────────────────────────────────────────
    function handlePasswordFormChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        setPasswordForm((prev) => ({ ...prev, [name]: value }));
    }

    async function handleChangePassword() {
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("All fields are required");
            return;
        }

        if (newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!firebaseUser || !firebaseUser.email) {
            toast.error("User not found. Please sign in again.");
            return;
        }

        try {
            setChangingPassword(true);

            // Reauthenticate with current password before updating
            const credential = EmailAuthProvider.credential(
                firebaseUser.email,
                currentPassword
            );
            await reauthenticateWithCredential(firebaseUser, credential);

            // Update the password in Firebase Auth
            await updatePassword(firebaseUser, newPassword);

            toast.success("Password updated successfully");
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            if (
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-credential"
            ) {
                toast.error("Current password is incorrect");
            } else {
                toast.error(error?.message || "Failed to change password");
            }
        } finally {
            setChangingPassword(false);
        }
    }

    // ── Delete Account ───────────────────────────────────────────────────────
    async function handleDeleteAccount() {
        if (!firebaseUser) return;

        try {
            setDeletingAccount(true);

            // Step 1: Delete the Firebase Authentication account first.
            // If this fails (e.g. auth/requires-recent-login), we abort and
            // the database record is never touched.
            await deleteUser(firebaseUser);

            // Step 2: Firebase Auth deletion succeeded — now delete the DB record.
            await API.delete(`/users/delete-account/${firebaseUser.uid}`);

            // Step 3: Sign out and redirect
            await logout();
            toast.success("Account deleted successfully");
            navigate("/");

        } catch (error: any) {
            if (error.code === "auth/requires-recent-login") {
                toast.error(
                    "For security, please sign out and sign back in before deleting your account."
                );
            } else {
                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to delete account. Please try again."
                );
            }
            setDeletingAccount(false);
            setShowDeleteModal(false);
        }
    }

    if (loading) {
        return <div className='flex justify-center items-center h-screen text-center text-2xl font-bold'>Loading...</div>
    }

    if (!profile || !firebaseUser) {
        return <Navigate to="/" />
    }

    return (
        <div className="max-w-3xl mx-auto mt-10 px-4 pb-10">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">

                {/* Banner */}
                <div className="bg-gradient-to-r from-blue-500 to-sky-500 h-28"></div>

                <div className="flex flex-col items-center -mt-14 pb-8">

                    {/* Avatar */}
                    <div className="relative">
                        <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
                        />
                        {uploadingAvatar && (
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                                <span className="text-white text-xs font-medium">Uploading…</span>
                            </div>
                        )}
                    </div>

                    {/* Change Avatar button */}
                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                        id="avatar-upload"
                    />
                    <label
                        htmlFor="avatar-upload"
                        className={`mt-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer underline ${uploadingAvatar ? "opacity-50 pointer-events-none" : ""}`}
                    >
                        {uploadingAvatar ? "Uploading…" : "Change Avatar"}
                    </label>

                    {/* Username display */}
                    <h1 className="text-3xl font-bold mt-2">
                        {profile.username}
                    </h1>

                    <p className="text-gray-500 text-sm mt-1">
                        {profile.email}
                    </p>

                    {/* Info fields */}
                    <div className="w-full mt-8 px-8 space-y-5">

                        {/* Username (editable) */}
                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500 mb-1">Username</h2>
                            {isEditingUsername ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input
                                        type="text"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter new username"
                                        maxLength={30}
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSaveUsername}
                                        disabled={savingUsername}
                                        className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-md disabled:opacity-50"
                                    >
                                        {savingUsername ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                        onClick={() => setIsEditingUsername(false)}
                                        disabled={savingUsername}
                                        className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded-md disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <p className="font-medium">{profile.username}</p>
                                    <button
                                        onClick={handleEditUsername}
                                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                                    >
                                        Edit
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Email (read-only) */}
                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500 mb-1">Email</h2>
                            <p className="font-medium">{profile.email}</p>
                        </div>

                        {/* Firebase UID (read-only) */}
                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500 mb-1">Firebase UID</h2>
                            <p className="text-sm break-all text-gray-700">{profile.firebase_uid}</p>
                        </div>

                        {/* Email Verification (read-only) */}
                        <div className="border rounded-lg p-4 flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Email Verification</span>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${isEmailVerified
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {isEmailVerified ? "Verified" : "Not Verified"}
                            </span>
                        </div>

                        {/* Joined Date (read-only) */}
                        <div className="border rounded-lg p-4">
                            <h2 className="text-sm text-gray-500 mb-1">Joined</h2>
                            <p>{joinedDate}</p>
                        </div>

                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 mt-8 justify-center px-8">

                        {hasPasswordProvider && <button
                            onClick={() => {
                                setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                                setShowPasswordModal(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg text-sm"
                        >
                            Change Password
                        </button>}

                        <button
                            onClick={handleSignOut}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-lg text-sm"
                        >
                            Sign Out
                        </button>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg text-sm"
                        >
                            Delete Account
                        </button>

                    </div>

                </div>
            </div>

            {/* ── Change Password Modal ──────────────────────────────────── */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Change Password</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordForm.currentPassword}
                                    onChange={handlePasswordFormChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordForm.newPassword}
                                    onChange={handlePasswordFormChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter new password (min. 6 characters)"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordForm.confirmPassword}
                                    onChange={handlePasswordFormChange}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Confirm new password"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                disabled={changingPassword}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={changingPassword}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {changingPassword ? "Updating…" : "Update Password"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Account Modal ───────────────────────────────────── */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <h2 className="text-xl font-bold text-red-600 mb-3">Delete Account</h2>
                        <p className="text-gray-700 text-sm mb-1">
                            This action is <strong>permanent</strong> and cannot be undone.
                        </p>
                        <p className="text-gray-600 text-sm mb-6">
                            Your account, profile data, and all associated information will be permanently deleted.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                disabled={deletingAccount}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deletingAccount}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-50"
                            >
                                {deletingAccount ? "Deleting…" : "Yes, Delete My Account"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Profile;