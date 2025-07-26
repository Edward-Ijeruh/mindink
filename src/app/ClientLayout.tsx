"use client";

import { useEffect, useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PenLine, User, Menu, X, Rss } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { motion, AnimatePresence } from "framer-motion";

const publicRoutes = ["/login", "/signup", "/forgotPassword"];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublic = publicRoutes.includes(pathname);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading) {
      if (!user && !isPublic) {
        router.push("/login");
      } else if (user && isPublic) {
        router.push("/");
      }
    }
  }, [user, loading, pathname, router]);

  if (loading || (!isPublic && !isAuthenticated)) {
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
            />
            <NavLink
              href="/write"
              icon={<PenLine className="w-5 h-5" />}
              text="Write"
              pathname={pathname}
            />
            {isAuthenticated ? (
              <NavLink
                href="/profile"
                icon={<User className="w-5 h-5" />}
                text="Profile"
                pathname={pathname}
              />
            ) : (
              <Link
                href="/login"
                className="text-[var(--accent-main)] hover:text-[var(--accent-hover)] flex gap-1 items-center"
              >
                <User className="w-5 h-5" />
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Navbar */}
      <div className="md:hidden sticky top-0 z-50 shadow-md">
        {/* Navbar */}
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
              className="absolute top-full left-0 w-full bg-[var(--bg-glass)] backdrop-blur-lg border-b border-[var(--border-glass)] shadow-lg z-40"
            >
              <nav className="flex flex-col p-4  space-y-4 text-[var(--text-primary)]">
                <MobileNavLink
                  href="/"
                  icon={<Home />}
                  text="Home"
                  pathname={pathname}
                  onClick={() => setMenuOpen(false)}
                />
                <MobileNavLink
                  href="/write"
                  icon={<PenLine />}
                  text="Write"
                  pathname={pathname}
                  onClick={() => setMenuOpen(false)}
                />
                {isAuthenticated ? (
                  <MobileNavLink
                    href="/profile"
                    icon={<User />}
                    text="Profile"
                    pathname={pathname}
                    onClick={() => setMenuOpen(false)}
                  />
                ) : (
                  <MobileNavLink
                    href="/login"
                    icon={<User />}
                    text="Login"
                    pathname={pathname}
                    onClick={() => setMenuOpen(false)}
                  />
                )}
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
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center text-lg font-bold text-[var(--accent-main)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer"
          >
            EchoMind <Rss className="w-4 h-4" />
          </Link>

          {/* Built by */}
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

function NavLink({
  href,
  icon,
  text,
  pathname,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  pathname: string;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-1 transition-colors ${
        isActive
          ? "text-[var(--accent-main)]"
          : "hover:text-[var(--accent-hover)] text-[var(--text-secondary)]"
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function MobileNavLink({
  href,
  icon,
  text,
  pathname,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
  pathname: string;
  onClick: () => void;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-2 py-2 px-2 rounded-md transition-colors ${
        isActive
          ? "text-[var(--accent-main)]"
          : "text-[var(--text-secondary)] hover:text-[var(--accent-hover)]"
      }`}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}
