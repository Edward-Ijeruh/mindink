import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "MindInk",
  description: "Where your thoughts take shape.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)]">
        <AuthProvider>
          <Toaster position="top-center" />
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
