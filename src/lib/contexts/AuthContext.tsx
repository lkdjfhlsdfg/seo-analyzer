"use client";

import { createContext, useContext, useEffect, useState } from 'react';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  picture: string | null;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = async () => {
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) {
        throw new Error('Google Client ID is not configured');
      }

      // Create OAuth URL
      const redirectUri = `${window.location.origin}/api/auth/callback/google`;
      const scope = 'email profile';
      const responseType = 'token';
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${encodeURIComponent(scope)}`;

      // Open Google Sign-in popup
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        authUrl,
        'Google Sign In',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!popup) {
        throw new Error('Failed to open popup');
      }

      // Handle the OAuth response
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data?.type !== 'GOOGLE_SIGN_IN_SUCCESS') return;

        const { access_token } = event.data;
        
        // Get user info using the access token
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userData = await userResponse.json();
        const user = {
          id: userData.sub,
          name: userData.name,
          email: userData.email,
          picture: userData.picture
        };

        // Store user data
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);

        // Clean up
        window.removeEventListener('message', handleMessage);
        popup.close();
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
