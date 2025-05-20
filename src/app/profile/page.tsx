"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import {
  LogOut,
  Settings,
  Pencil,
  MapPin,
  Info,
  UserCircle,
  AlertCircle,
} from "lucide-react";

interface UserProfile {
  email: string;
  username: string;
  location?: string;
  profileImage?: string;
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);

          // Save to localStorage for offline use
          localStorage.setItem("userProfile", JSON.stringify(profileData));
        } else {
          throw new Error("No profile in Firestore");
        }
      } catch (error) {
        console.warn("Fetching from Firestore failed, trying localStorage...");

        // Fallback: try from localStorage
        const stored = localStorage.getItem("userProfile");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setProfile(parsed);
          } catch (err) {
            console.error("Invalid localStorage userProfile");
          }
        } else {
          console.error("No profile data available anywhere.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (error)
    return (
      <div className="text-center mt-20 text-red-600 flex flex-col items-center">
        <AlertCircle size={24} />
        <p className="mt-2">{error}</p>
      </div>
    );

  if (!profile) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-8">
        <div>
          {profile.profileImage ? (
            <img
              src={profile.profileImage}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
              <UserCircle className="w-12 h-12" />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <h2 className="text-2xl font-semibold">{profile.username}</h2>
          <button
            onClick={() => router.push("/profile/edit")}
            className="flex items-center gap-1 border px-3 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Pencil size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="mt-6 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <Info size={16} />
          <span>{profile.bio || "No bio provided"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <MapPin size={16} />
          <span>{profile.location || "No location set"}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
          <strong>Email:</strong>
          <span>{profile.email}</span>
        </div>
      </div>

      <div className="h-64" />

      <div className="mt-10 flex justify-center gap-4 border-t pt-6">
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center gap-2 border px-4 py-2 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Settings size={18} /> Settings
        </button>
        <button
          onClick={logout}
          className="flex items-center gap-2 border px-4 py-2 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </main>
  );
}
