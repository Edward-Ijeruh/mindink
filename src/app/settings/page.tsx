"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main className="max-w-md mx-auto mt-10 px-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-sm text-blue-600 hover:underline"
        >
          <ArrowLeft className="mr-1 w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-center flex-1">Settings</h1>
        <div className="w-12" /> {/* Empty spacer to balance the layout */}
      </div>

      {/* Dummy settings list */}
      <ul className="space-y-4">
        <li className="border p-4 rounded">🔔 Notifications: On</li>
        <li className="border p-4 rounded">🎨 Theme: Light</li>
        <li className="border p-4 rounded">📧 Email Updates: Enabled</li>
        <li className="border p-4 rounded">🗂 Backup: Weekly</li>
      </ul>
    </main>
  );
}
