"use client";

import Loader from "@/components/Loader";

export default function GlobalLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader />
    </div>
  );
}
