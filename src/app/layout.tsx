import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayout from "./ClientLayout";

export const metadata = {
  title: "EchoMind",
  description: "Where your thoughts take shape.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-white text-gray-900 dark:bg-[#121212] dark:text-white">
        <AuthProvider>
          <Toaster position="top-center" />
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
