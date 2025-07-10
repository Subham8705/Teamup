import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged,
  sendEmailVerification,
  reload
} from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, query, collection, where, getDocs } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: any;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, userData: any) => Promise<void>;
  resendVerification: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  emailVerificationSent: boolean;
  setEmailVerificationSent: (sent: boolean) => void;
  updateProfileData: (updates: any) => Promise<void>;
  isAuthenticated: () => boolean;
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
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);

  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  // New helper function to check authentication status
  const isAuthenticated = () => {
    return !!user && (!!user.emailVerified || user.providerData.some(provider => provider.providerId === 'google.com'));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Check if user is verified (either through email or Google)
        if (firebaseUser.emailVerified || firebaseUser.providerData.some(provider => provider.providerId === 'google.com')) {
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setUserProfile(userDoc.data());
            } else {
              // Handle case where user exists in auth but not in Firestore
              await createDefaultUserProfile(firebaseUser);
            }
          } catch (error) {
            console.error("Error loading user profile:", error);
          }
        } else {
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const createDefaultUserProfile = async (firebaseUser: User) => {
    const displayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';
    let uniqueName = displayName;
    let counter = 1;
    
    // Ensure unique username
    while (true) {
      const nameQuery = query(
        collection(db, 'users'),
        where('name', '==', uniqueName)
      );
      const nameSnapshot = await getDocs(nameQuery);
      
      if (nameSnapshot.empty) break;
      
      uniqueName = `${displayName}${counter}`;
      counter++;
    }
    
    const newProfile = {
      name: uniqueName,
      email: firebaseUser.email,
      role: 'Developer',
      skills: '',
      about: '',
      github: '',
      linkedin: '',
      website: '',
      profileImage: firebaseUser.photoURL || '',
      projects: [],
      profileVisibility: 'public',
      emailVerified: firebaseUser.emailVerified || firebaseUser.providerData.some(p => p.providerId === 'google.com'),
      createdAt: new Date().toISOString(),
      authProvider: firebaseUser.providerData[0]?.providerId || 'email'
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), newProfile);
    setUserProfile(newProfile);
  };

  const register = async (email: string, password: string, userData: any) => {
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      await sendEmailVerification(user);
      setEmailVerificationSent(true);
      
      await setDoc(doc(db, 'users', user.uid), {
        ...userData,
        email,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });
      
      throw new Error('VERIFICATION_SENT');
    } catch (error: any) {
      setLoading(false);
      if (error.message === 'VERIFICATION_SENT') {
        throw error;
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      if (!user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
      }
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        emailVerified: true,
        lastLoginAt: new Date().toISOString()
      });
      
      // Reload user data
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        await createDefaultUserProfile(user);
      } else {
        setUserProfile(userDoc.data());
      }
    } catch (error: any) {
      setLoading(false);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Sign-in was cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else if (error.code === 'auth/cancelled-popup-request') {
        throw new Error('Sign-in was cancelled');
      } else {
        throw new Error(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    await reload(user);
    
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }
    
    await sendEmailVerification(user);
    setEmailVerificationSent(true);
  };

  const logout = async () => {
    try {
      setLoading(true);
      setEmailVerificationSent(false);
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (updates: any) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);
      setUserProfile((prev: any) => ({ ...prev, ...updates }));
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userProfile,
    login,
    loginWithGoogle,
    register,
    resendVerification,
    logout,
    loading,
    emailVerificationSent,
    setEmailVerificationSent,
    updateProfileData,
    isAuthenticated // Add the new helper function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};