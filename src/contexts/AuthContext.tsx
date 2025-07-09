import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: any;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  updateProfileData: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        setUserProfile(userDoc.data());
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email: string, password: string, userData: any) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      email,
      createdAt: new Date().toISOString(),
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Check if username already exists
        const displayName = user.displayName || user.email?.split('@')[0] || 'User';
        let uniqueName = displayName;
        let counter = 1;
        
        // Ensure unique username
        while (true) {
          const nameQuery = query(
            collection(db, 'users'),
            where('name', '==', uniqueName)
          );
          const nameSnapshot = await getDocs(nameQuery);
          
          if (nameSnapshot.empty) {
            break;
          }
          
          uniqueName = `${displayName}${counter}`;
          counter++;
        }
        
        // Create new user profile
        await setDoc(doc(db, 'users', user.uid), {
          name: uniqueName,
          email: user.email,
          role: 'Developer',
          skills: '',
          about: '',
          github: '',
          linkedin: '',
          website: '',
          profileImage: user.photoURL || '',
          projects: [],
          profileVisibility: 'public',
          createdAt: new Date().toISOString(),
          authProvider: 'google'
        });
      }
    } catch (error: any) {
      // Handle specific Google Sign-In errors
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled');
      } else {
        throw new Error(error.message || 'Failed to sign in with Google');
      }
    }
  };
  const logout = async () => {
    await signOut(auth);
  };

  const updateProfileData = async (updates: any) => {
    if (!user) return;
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, updates);
    setUserProfile((prev: any) => ({ ...prev, ...updates }));
  };

  const value = {
    user,
    userProfile,
    login,
    loginWithGoogle,
    register,
    logout,
    loading,
    updateProfileData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};