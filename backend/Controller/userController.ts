import User from "../Model/userModal";

export async function EmailSignUp(req: any, res: any) {
    try {
        const { username, email, firebase_uid, avatar_url, avatar_public_id } = req.body;

        if (!username || !email || !firebase_uid) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({
            username,
            email,
            firebase_uid,
            avatar_url: avatar_url || "https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356042/profile_n0nnut.png",
            avatar_public_id: avatar_public_id || null
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully. Please verify the Email", user: newUser });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating user", error });
    }
}

export async function GoogleSignUp(req: any, res: any) {
    try {
        const { username, email, firebase_uid, avatar_url, avatar_public_id } = req.body;

        if (!username || !email || !firebase_uid) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(200).json({
                message: "Welcome back",
                user: existingUser,
            });
        }
        const newUser = new User({
            username,
            email,
            firebase_uid,
            avatar_url: avatar_url || "https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356042/profile_n0nnut.png",
            avatar_public_id: avatar_public_id || null
        });

        await newUser.save();
        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating user", error });
    }
}

export async function SignIn(req: any, res: any) {
    try {
        const { firebase_uid } = req.body;

        const user = await User.findOne({ firebase_uid });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Signed in successfully",
            user
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "Error signing in",
            error
        });
    }
}

export async function GetUser(req: any, res: any) {
    try {
        const { firebase_uid } = req.params;

        const user = await User.findOne({ firebase_uid });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            message: "User fetched successfully",
            user,
        });
    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Error fetching user",
            error,
        });
    }
}