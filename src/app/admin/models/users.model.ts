export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    customClaims?: {
        role?: string;
    };
}
