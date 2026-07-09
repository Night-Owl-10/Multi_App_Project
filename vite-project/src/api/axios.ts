import axios from "axios";
import { getAuth } from "firebase/auth";

const auth = getAuth();
const firebaseUser = auth.currentUser;

const token = await firebaseUser?.getIdToken();

const API = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true,
});

API.interceptors.request.use((config) => {
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;
