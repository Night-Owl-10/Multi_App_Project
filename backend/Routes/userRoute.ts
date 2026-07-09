import { EmailSignUp, GoogleSignUp, SignIn, GetUser } from "../Controller/userController";
import { UpdateUsername, UpdateAvatar, DeleteAccount } from "../Controller/profileController";
import express from "express";

const router = express.Router();

router.post("/email-signUp", EmailSignUp);
router.post("/google-signUp", GoogleSignUp);
router.post("/email-signIn", SignIn);
router.post("/google-signIn", SignIn);
router.get("/get-user/:firebase_uid", GetUser);

// Profile routes
router.put("/update-username/:firebase_uid", UpdateUsername);
router.put("/update-avatar/:firebase_uid", UpdateAvatar);
router.delete("/delete-account/:firebase_uid", DeleteAccount);

export default router;
