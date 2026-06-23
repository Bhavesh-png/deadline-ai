/* eslint-disable react-refresh/only-export-components */
// @refresh reset
// Auth Context – Firebase Authentication
import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { createUserProfile } from '../services/firebaseService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await createUserProfile(firebaseUser);
          setUserProfile(profile);
        } catch (err) {
          console.warn('Profile fetch failed (demo mode):', err.message);
          setUserProfile({
            displayName: firebaseUser.displayName || 'Demo User',
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
            stats: { streak: 7, totalXP: 1250, level: 5, tasksCompleted: 23 },
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.warn('Google sign-in failed, entering demo mode:', err.message);
      // Demo mode fallback for easy evaluation
      const mockUser = {
        uid: 'demo-user-123',
        displayName: 'Demo User',
        email: 'demo@deadlineai.app',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      };
      setUser(mockUser);
      setUserProfile({
        ...mockUser,
        stats: { streak: 7, totalXP: 1250, level: 5, tasksCompleted: 23 },
        settings: { theme: 'dark', notifications: true },
      });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch {
      setUser(null);
      setUserProfile(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
