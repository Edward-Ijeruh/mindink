"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/useAuth";
import { useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import {
  LogOut,
  Pencil,
  MapPin,
  AlertCircle,
  Mail,
  FileText,
  FileTextIcon,
} from "lucide-react";
import Loader from "@/components/Loader";
import { AnimatePresence, motion } from "framer-motion";

interface UserProfile {
  email: string;
  username: string;
  location?: string;
  bio?: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  image?: string;
  createdAt?: { seconds: number };
  author: { name: string };
  tags?: string[];
  likeCount?: number;
}

export default function ProfilePage() {
  const { user, logout, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  //Listen for users posts
  useEffect(() => {
    if (!user) return;

    const fetchPosts = async () => {
      try {
        const q = query(
          collection(firestore, "posts"),
          where("author.id", "==", user.uid),
          orderBy("createdAt", "desc"),
        );
        const querySnapshot = await getDocs(q);
        const postsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Post, "id">),
        }));
        setPosts(postsData);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const docRef = doc(firestore, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile;
          setProfile(profileData);
          localStorage.setItem("userProfile", JSON.stringify(profileData));
        } else {
          throw new Error("No profile found in Firestore.");
        }
      } catch (err) {
        console.warn("Firestore fetch failed, trying localStorage...");
        setError("Failed to load profile. Using offline data.");
        console.error(err);

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

  if (loading || profileLoading) return <Loader />;

  if (!user) {
    return (
      <div className="text-center mt-20 text-[var(--text-muted)]">
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
    <main className="max-w-6xl mx-auto flex flex-col">
      <div
        className="bg-[var(--card-bg)] shadow-lg rounded-[var(--card-radius)] p-6 sm:p-8 border border-[var(--card-border)]"
        style={{ boxShadow: "var(--card-shadow)" }}
      >
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--border-glass)] pb-4">
          <div>
            <h2 className="text-xl md:text-3xl font-bold text-[var(--text-primary)]">
              Hi, {profile.username}!
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Welcome to your profile.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/profile/edit")}
              className="flex items-center gap-1 border border-[var(--border-glass)] px-3 py-1.5 rounded text-sm text-[var(--text-primary)] hover:bg-[var(--accent-hover)]/10 transition  cursor-pointer"
            >
              <Pencil size={16} /> Edit Profile
            </button>
          </div>
        </div>

        {/* Details Section */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <MapPin size={16} className="flex-shrink-0" />
            <span className="flex-1 break-words">
              {profile.location || "No location set"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]">
            <Mail size={16} className="flex-shrink-0" />
            <span className="flex-1 break-words">{profile.email}</span>
          </div>
          {profile.bio && (
            <div className="flex items-start gap-2 mt-2 text-[var(--text-secondary)]">
              <FileText size={16} className="flex-shrink-0 mt-1" />
              <p className="flex-1 whitespace-pre-line break-words overflow-hidden">
                {profile.bio}
              </p>
            </div>
          )}
        </div>

        {/* User's Posts Section */}
        <div className="mt-6 border-t border-[var(--border-glass)]">
          <h2 className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold text-[var(--text-primary)] pt-6 pb-4">
            My Posts{" "}
            <FileTextIcon size={20} className="w-6 h-6 md:w-6 md:h-6" />
          </h2>

          {postsLoading ? (
            <Loader />
          ) : posts.length === 0 ? (
            <p className="text-center text-[var(--text-muted)]">
              You haven’t written any posts yet.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => router.push(`/posts/${post.id}`)}
                  className="cursor-pointer group"
                >
                  {post.image ? (
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-40 object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-40 bg-[var(--bg-muted)] rounded-lg flex items-center justify-center text-[var(--text-muted)] text-sm">
                      No Image
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <div className="mt-6 pt-6 border-t border-[var(--border-glass)] flex justify-center">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 border border-red-300 px-4 py-2 rounded text-sm text-red-600 hover:bg-red-50 cursor-pointer"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Logout Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[var(--card-bg)] border border-[var(--border-glass)] text-[var(--text-primary)] rounded-2xl p-6 max-w-sm w-11/12 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-xl font-semibold mb-3 text-center">
                Confirm Logout
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-6 text-center">
                Are you sure you want to log out?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-glass)] bg-[var(--bg-glass)] hover:bg-[var(--accent-hover)]/10 transition text-sm text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    setShowLogoutModal(false);
                    router.push("/login");
                  }}
                  className="px-4 py-2 rounded-lg border border-red-400 bg-red-100 text-red-700 hover:bg-red-200 transition text-sm cursor-pointer"
                >
                  Yes, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
