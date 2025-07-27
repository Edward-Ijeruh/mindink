"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export function navigateToFeed(router: AppRouterInstance) {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("lastFeedFilters");

    if (saved) {
      const { searchTerm, activeTag } = JSON.parse(saved);
      const params = new URLSearchParams();

      if (searchTerm) params.set("q", searchTerm);
      if (activeTag) params.set("tag", activeTag);

      if (params.toString()) {
        router.push(`/?${params.toString()}`);
        return;
      }
    }

    router.push("/");
  }
}
