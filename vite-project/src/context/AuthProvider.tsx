import {
    createContext,
    useEffect,
    useState,
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
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext<AuthContextType>({
    firebaseUser: null,
    profile: null,
    loading: true,
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

    return (
        <AuthContext.Provider
            value={{
                firebaseUser,
                profile,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}