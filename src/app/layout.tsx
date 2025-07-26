import "./globals.css";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import ClientLayout from "./ClientLayout";

import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["100", "400", "700"],
});

export const metadata = {
  title: "EchoMind",
  description: "Where your thoughts take shape.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-gray-900 min-h-screen flex flex-col">
        <AuthProvider>
          <Toaster
            containerClassName="text-xs md:text-sm"
            position="bottom-center"
          />
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
