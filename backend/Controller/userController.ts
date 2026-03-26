import User from "../Model/userModal";
import Task from "../Model/taskModel"
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const cookieSettings = { httpOnly: true, secure: false, sameSite: "lax", maxAge: 3600000 }

export const registerUser = async (req: any, res: any) => {
    try {
        const { username, email, password } = req.body;
        const userExists = await User.findOne({ username });
        const emailExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Username already exists" });
        }
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            avatar: req.body.avatar || ""
        });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error });
    }
};


export const loginUser = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY!, { expiresIn: "1h" });
        res.cookie("token", token, cookieSettings);

        res.status(200).json({ message: "Login successful", user });
    } catch (error) {
        res.status(500).json({ message: "Error logging in user", error });
    }
};

export const updateUser = async (req: any, res: any) => {
    try {
        const userId = req.user.userId
        const { username, email, avatar } = req.body;
        const userExists = await User.findOne({ username, _id: { $ne: userId } });
        const emailExists = await User.findOne({ email, _id: { $ne: userId } });
        if (userExists) {
            return res.status(400).json({ message: "Username already exists" });
        }
        if (emailExists) {
            return res.status(400).json({ message: "Email already exists" });
        }
        const updatedInfo = await User.findByIdAndUpdate(userId, { username, email, avatar }, { new: true, select: "-password" });
        if (!updatedInfo) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(updatedInfo);
    } catch (error) {
        res.status(500).json({ message: "Error updating user info", error });
    }
}

export const deleteUser = async (req: any, res: any) => {
    try {
        const userId = req.user.userId;
        const deletedUser = await User.findByIdAndDelete(userId);
        await Task.deleteMany({ user: userId });
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
}

export const logoutUser = async (req: any, res: any) => {
    try {
        res.clearCookie("token", cookieSettings);
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: "Error logging out user", error });
    }
};

export const getMe = async (req: any, res: any) => {
    try {
        const user = await User.findById(req.user.userId).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching user", error });
    }
};