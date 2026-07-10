import axios from "axios";
import { auth } from "../firebase/firebase";

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
});

// Attach a fresh Firebase ID token to every outgoing request.
// The token is fetched inside the interceptor (not once at module load)
// so it is always current after sign-in, page refresh, or token rotation.
API.interceptors.request.use(async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
        const token = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
