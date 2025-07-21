"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";

//The contexts properties
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    email: string,
    password: string,
    profileData: AdditionalProfileData
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

//Additional data for the user signup
interface AdditionalProfileData {
  username: string;
  location?: string;
}

//Context created with default values as a fallback
export const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  resetPassword: async () => {},
});

//The provider component for user authentication and update/edit functions
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  //Login function
  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  //Signup function
  const signup = async (
    email: string,
    password: string,
    profileData: AdditionalProfileData
  ): Promise<void> => {
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: profileData.username,
      });

      await setDoc(doc(firestore, "users", user.uid), {
        email: user.email,
        username: profileData.username,
        location: profileData.location || "",
        profileImage: "",
        createdAt: serverTimestamp(),
      });

      localStorage.setItem(
        "userProfile",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          username: profileData.username,
          location: profileData.location || "",
          profileImage: "",
        })
      );

      setUser(user);
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  //Listening for user login or logout
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser || null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  //Main provider
  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
