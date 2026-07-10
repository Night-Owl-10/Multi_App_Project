import cloudinary from "../Connection/cloudinary";
import User from "../Model/userModal";
import Task from "../Model/taskModel";



export async function UpdateUsername(req: any, res: any) {
    try {
        const { firebase_uid } = req.params;
        const { username } = req.body;

        if (!username || username.trim() === "") {
            return res.status(400).json({ message: "Username is required" });
        }

        const trimmed = username.trim();

        if (trimmed.length < 3) {
            return res.status(400).json({ message: "Username must be at least 3 characters" });
        }

        if (trimmed.length > 30) {
            return res.status(400).json({ message: "Username must be at most 30 characters" });
        }

        if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
            return res.status(400).json({ message: "Username can only contain letters, numbers, and underscores" });
        }

        // Check for duplicate username (exclude the requesting user)
        const duplicate = await User.findOne({ username: trimmed, firebase_uid: { $ne: firebase_uid } });
        if (duplicate) {
            return res.status(409).json({ message: "Username already taken." });
        }

        const user = await User.findOneAndUpdate(
            { firebase_uid },
            { username: trimmed },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ message: "Username updated successfully", user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error updating username", error });
    }
}

export async function UpdateAvatar(req: any, res: any) {
    try {
        const { firebase_uid } = req.params;
        const { avatar_url, avatar_public_id } = req.body;

        if (!avatar_url) {
            return res.status(400).json({ message: "Avatar URL is required" });
        }

        // Fetch current user to get the old avatar_public_id before overwriting
        const existingUser = await User.findOne({ firebase_uid });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const oldPublicId = existingUser.avatar_public_id;

        // Update the database with new avatar
        const user = await User.findOneAndUpdate(
            { firebase_uid },
            { avatar_url, avatar_public_id: avatar_public_id || null },
            { new: true }
        );

        // Delete the old Cloudinary image after a successful DB update
        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(oldPublicId);
            } catch (cloudinaryError) {
                // Non-critical: log but don't fail the request
                console.log("Failed to delete old Cloudinary image:", cloudinaryError);
            }
        }

        return res.status(200).json({ message: "Avatar updated successfully", user });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error updating avatar", error });
    }
}

export async function DeleteAccount(req: any, res: any) {
    try {
        const { firebase_uid } = req.params;

        // Step 1: Find the user first (needed to read avatar_public_id before deleting)
        const user = await User.findOne({ firebase_uid });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Step 2: Delete custom avatar from Cloudinary if one exists
        if (user.avatar_public_id) {
            try {
                await cloudinary.uploader.destroy(user.avatar_public_id);
            } catch (cloudinaryError) {
                // Non-critical: log but continue with account deletion
                console.log("Failed to delete avatar from Cloudinary:", cloudinaryError);
            }
        }

        // Step 3: Delete all tasks belonging to this user
        await Task.deleteMany({ user: user._id });

        // Step 4: Delete the MongoDB user document
        await User.findOneAndDelete({ firebase_uid });

        return res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Error deleting account", error });
    }
}
