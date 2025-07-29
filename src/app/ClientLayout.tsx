"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PenLine, User, Menu, X, Rss } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";
import { navigateToFeed } from "@/lib/navigation";
import toast from "react-hot-toast";

const publicRoutes = ["/", "/login", "/signup", "/forgotPassword"];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublic = publicRoutes.includes(pathname);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublic && pathname !== "/") {
        router.push("/login");
      }
    }
  }, [user, loading, pathname, router, isPublic]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-dark)] font-sans shadow-md text-[var(--text-primary)]">
      {/* Header */}
      <header className="hidden md:block sticky top-0 z-50 backdrop-blur-lg bg-[var(--bg-glass)] border-b border-[var(--border-glass)] shadow-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-2xl font-bold text-[var(--accent-main)]"
          >
            EchoMind <Rss />
          </Link>
          <nav className="flex space-x-8 items-center text-sm font-medium">
            <NavLink
              href="/"
              icon={<Home className="w-5 h-5" />}
              text="Home"
              pathname={pathname}
              isAuthenticated={isAuthenticated}
            />
            <NavLink
              href="/write"
              icon={<PenLine className="w-5 h-5" />}
              text="Write"
              pathname={pathname}
              isAuthenticated={isAuthenticated}
            />
            <NavLink
              href="/profile"
              icon={<User className="w-5 h-5" />}
              text={isAuthenticated ? "Profile" : "Login"}
              pathname={pathname}
              isAuthenticated={isAuthenticated}
            />
          </nav>
        </div>
      </header>

      {/* Mobile Navbar */}
      <div className="md:hidden sticky top-0 z-50 shadow-md">
        <div className="relative z-50 backdrop-blur-lg bg-[var(--bg-glass)] border-b border-[var(--border-glass)] py-3 px-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-xl font-bold text-[var(--accent-main)]"
          >
            EchoMind <Rss />
          </Link>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="h-6 w-6 text-[var(--text-primary)]" />
            ) : (
              <Menu className="h-6 w-6 text-[var(--text-primary)]" />
            )}
          </button>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              key="mobile-dropdown"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 w-full h-screen bg-[var(--bg-glass)] backdrop-blur-lg border-b border-[var(--border-glass)] shadow-lg z-40"
            >
              <nav className="flex flex-col p-4 space-y-4 text-[var(--text-primary)]">
                <MobileNavLink
                  href="/"
                  icon={<Home />}
                  text="Home"
                  pathname={pathname}
                  onClose={() => setMenuOpen(false)}
                  isAuthenticated={isAuthenticated}
                />
                <MobileNavLink
                  href="/write"
                  icon={<PenLine />}
                  text="Write"
                  pathname={pathname}
                  onClose={() => setMenuOpen(false)}
                  isAuthenticated={isAuthenticated}
                />
                <MobileNavLink
                  href={isAuthenticated ? "/profile" : "/login"}
                  icon={<User />}
                  text={isAuthenticated ? "Profile" : "Login"}
                  pathname={pathname}
                  onClose={() => setMenuOpen(false)}
                  isAuthenticated={isAuthenticated}
                />
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[var(--bg-glass)] border-t border-[var(--border-glass)] py-4 px-4 text-sm text-[var(--text-secondary)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <Link
            href="/"
            className="flex items-center text-lg font-bold text-[var(--accent-main)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            EchoMind <Rss className="w-4 h-4" />
          </Link>
          <p className="text-[var(--text-secondary)]">
            &copy; {new Date().getFullYear()} · Built by{" "}
            <Link
              href="https://edwardijeruh.netlify.app/"
              target="_blank"
              className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] font-medium cursor-pointer"
            >
              Edward Ijeruh
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}

/* Desktop NavLink */
function NavLink({
  href,
  icon,
  text,
  pathname,
  isAuthenticated,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  pathname: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((href === "/write" || href === "/profile") && !isAuthenticated) {
      toast("Please log in to continue.");
      router.push("/login");
      return;
    }
    if (href === "/") {
      navigateToFeed(router);
      return;
    }
    router.push(href);
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-1 transition-colors cursor-pointer ${
        isActive
          ? "text-[var(--accent-main)]"
          : "hover:text-[var(--accent-hover)] text-[var(--text-secondary)]"
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

/* Mobile NavLink */
function MobileNavLink({
  href,
  icon,
  text,
  pathname,
  onClose,
  isAuthenticated,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  pathname: string;
  onClose: () => void;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const isActive = pathname === href;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if ((href === "/write" || href === "/profile") && !isAuthenticated) {
      toast("Please log in to continue.");
      router.push("/login");
      onClose();
      return;
    }
    router.push(href);
    onClose();
  };

  if (href === "/") {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          navigateToFeed(router);
          onClose();
        }}
        className={`flex items-center space-x-2 py-2 px-2 rounded-md transition-colors ${
          isActive
            ? "text-[var(--accent-main)]"
            : "text-[var(--text-secondary)] hover:text-[var(--accent-hover)]"
        }`}
      >
        {icon}
        <span>{text}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 py-2 px-2 rounded-md transition-colors ${
        isActive
          ? "text-[var(--accent-main)]"
          : "text-[var(--text-secondary)] hover:text-[var(--accent-hover)]"
      }`}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}
