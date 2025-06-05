"use client";

import { useEffect, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PenLine, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

const publicRoutes = ["/login", "/signup"];

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = publicRoutes.includes(pathname);
  const isAuthenticated = !!user;

  useEffect(() => {
    if (!loading) {
      const isPublic = publicRoutes.includes(pathname);
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
    <>
      {/* Desktop Top Navbar */}
      <header className="hidden md:block sticky top-0 z-50 bg-[var(--background)] border-b border-gray-800 dark:border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            EchoMind 🧠
          </Link>
          <nav className="flex space-x-8 items-center text-sm font-medium">
            <NavLink href="/" icon={<Home className="w-5 h-5" />} text="Home" />
            <NavLink
              href="/write"
              icon={<PenLine className="w-5 h-5" />}
              text="Write"
            />
            {isAuthenticated ? (
              <NavLink
                href="/profile"
                icon={<User className="w-5 h-5" />}
                text="Profile"
              />
            ) : (
              <Link href="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Mobile Top Logo Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-[var(--background)] border-b border-gray-800 dark:border-gray-800 px-4 py-3 flex justify-center">
        <Link href="/" className="text-xl font-bold">
          EchoMind 🧠
        </Link>
      </div>

      {/* Main Content */}
      <main className=" pb-20 max-w-4xl mx-auto px-4">{children}</main>

      {/* Mobile Bottom Navbar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[var(--background)] border-t border-gray-800 dark:border-gray-800 flex justify-around py-2">
        <NavButton href="/" icon={<Home className="w-5 h-5" />} text="Home" />
        <NavButton
          href="/write"
          icon={<PenLine className="w-5 h-5" />}
          text="Write"
        />
        {isAuthenticated ? (
          <NavButton
            href="/profile"
            icon={<User className="w-5 h-5" />}
            text="Profile"
          />
        ) : (
          <NavButton
            href="/login"
            icon={<User className="w-5 h-5" />}
            text="Login"
          />
        )}
      </nav>
    </>
  );
}

function NavLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="hover:text-blue-600 flex items-center space-x-1 transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}

function NavButton({
  href,
  icon,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center text-xs text-[var(--foreground)] hover:text-blue-600 transition-colors"
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
}
