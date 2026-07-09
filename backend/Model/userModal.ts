import { Schema, model } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    firebase_uid: {
        type: String,
        required: true,
        unique: true
    },
    avatar_url: {
        type: String,
        default: "https://res.cloudinary.com/dru7e6cnq/image/upload/v1774356042/profile_n0nnut.png"
    },
    avatar_public_id: {
        type: String
    }
}, { timestamps: true });

const User = model("User", userSchema);

export default User;