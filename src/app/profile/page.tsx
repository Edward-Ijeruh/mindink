"use client";

import Image from "next/image";
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
  const { user, logout, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const router = useRouter();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (loading) return; // Wait for Firebase to initialize
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);

          // Save for offline fallback
          localStorage.setItem("userProfile", JSON.stringify(profileData));
        } else {
          throw new Error("No profile found in Firestore.");
        }
      } catch (err) {
        console.warn("Firestore fetch failed, trying localStorage...");
        setError("Failed to load profile. Using offline data.");

        const cached = localStorage.getItem("userProfile");
        if (cached) {
          try {
            const parsed = JSON.parse(cached) as UserProfile;
            setProfile(parsed);
          } catch (err) {
            console.error("Invalid cached profile", err);
          }
        }
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user, loading]);

  if (loading || profileLoading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="text-center mt-20 text-gray-600">
        You must be logged in to view this page.
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="text-center mt-20 text-red-600 flex flex-col items-center">
        <AlertCircle size={24} />
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 flex flex-col min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-8">
        {profile.profileImage ? (
          <Image
            src={profile.profileImage}
            alt="Profile"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300">
            <UserCircle className="w-12 h-12" />
          </div>
        )}

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
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center gap-2 border px-4 py-2 rounded text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:text-red-400"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded shadow-lg text-center">
            <p className="text-lg mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  await logout();
                  setShowLogoutModal(false);
                  router.push("/login");
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes, logout
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
