import { EmailSignUp, GoogleSignUp, SignIn, GetUser } from "../Controller/userController";
import express from "express";

const router = express.Router();

router.post("/email-signUp", EmailSignUp);
router.post("/google-signUp", GoogleSignUp);
router.post("/email-signIn", SignIn);
router.post("/google-signIn", SignIn);
router.get("/get-user/:firebase_uid", GetUser);


export default router;
