import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import serviceAccount from "../firebase-service-account.json";

// Initialize Firebase Admin once using the local service account file.
if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount as any),
    });
}

export async function verifyFirebaseToken(req: any, res: any, next: any) {
    const authHeader = req.headers.authorization as string | undefined;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const token = authHeader.split("Bearer ")[1];

    try {
        const decoded = await getAuth().verifyIdToken(token);
        req.user = { uid: decoded.uid };
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized: invalid token" });
    }
}
