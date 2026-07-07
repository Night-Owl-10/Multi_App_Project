export interface UserDocument {
    _id: string;
    username: string;
    email: string;
    firebase_uid: string;
    avatar_url: string;
    avatar_public_id: string | null;
    createdAt: string;
    updatedAt: string;
}