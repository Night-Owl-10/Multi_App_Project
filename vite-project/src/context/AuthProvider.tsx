import {
    createContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import API from "../api/axios";
import type { UserDocument } from "../type/user";

interface AuthContextType {
    firebaseUser: User | null;
    profile: UserDocument | null;
    loading: boolean;
    refreshProfile: () => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
    firebaseUser: null,
    profile: null,
    loading: true,
    refreshProfile: async () => {},
});

export function AuthProvider({ children }: AuthProviderProps) {
    const [loading, setLoading] = useState(true);
    const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserDocument | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                setFirebaseUser(null);
                setProfile(null);
                setLoading(false);
                return;
            }

            setFirebaseUser(currentUser);

            async function fetchProfile(user: User) {
                try {
                    const response = await API.get(`/users/get-user/${user.uid}`);
                    setProfile(response.data.user);
                } catch (error: any) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            }

            fetchProfile(currentUser);
        });

        return unsubscribe;
    }, []);

    /**
     * Re-fetches the profile from the backend using the current authenticated
     * user and updates the global profile state. Call this after any mutation
     * (e.g. username change, avatar update) to keep the UI in sync.
     */
    const refreshProfile = useCallback(async () => {
        if (!firebaseUser) return;
        try {
            const response = await API.get(`/users/get-user/${firebaseUser.uid}`);
            setProfile(response.data.user);
        } catch (error: any) {
            console.log("Failed to refresh profile:", error);
        }
    }, [firebaseUser]);

    return (
        <AuthContext.Provider
            value={{
                firebaseUser,
                profile,
                loading,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}