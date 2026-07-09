import { auth } from "./firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    sendEmailVerification,
    signOut,
    sendPasswordResetEmail,
} from "firebase/auth";
import type { User } from "firebase/auth";

export async function signUp(
    email: string,
    password: string
) {
    return createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export async function signIn(
    email: string,
    password: string
) {
    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );
}

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle() {
    return signInWithPopup(auth, googleProvider);
}

export async function sendVerificationEmail(user: User) {
    await sendEmailVerification(user);
}

export async function logout() {
    await signOut(auth);
}

export async function forgotPassword(email: string) {
    return await sendPasswordResetEmail(auth, email);
}