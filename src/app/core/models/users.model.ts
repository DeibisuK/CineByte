export interface UserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  creationTime?: string;
  lastSignInTime?: string;
  customClaims?: {
    role?: string;
    isAdmin?: boolean;
    isEmployee?: boolean;
    [key: string]: any; // Para claims adicionales
  };
  providerData?: Array<{
    providerId: string;
  }>;
}

export interface UserWithTokenInfo extends UserProfile {
  tokenInfo?: {
    issuedAt: number;
    expirationTime: number;
    signInProvider: string;
  };
}

export interface CustomClaims {
  role: 'admin' | 'employee' | 'user';
  isAdmin: boolean;
  isEmployee: boolean;
  [key: string]: any;
}