import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const signup = async (email, password, additionalData) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = userCredential.user;

  await setDoc(doc(firestore, "users", user.uid), {
    email: user.email,
    username: additionalData.username,
    location: additionalData.location,
    bio: additionalData.bio,
    profileImage: "",
    createdAt: serverTimestamp(),
  });

  return user;
};
