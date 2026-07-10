import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let serviceAccount;

if (process.env.NODE_ENV === "production") {
    serviceAccount = JSON.parse(
        process.env.FIREBASE_SERVICE_ACCOUNT_JSON!
    );
} else {
    serviceAccount = require("../firebase-service-account.json");
}

if (!getApps().length) {
    initializeApp({
        credential: cert(serviceAccount),
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
