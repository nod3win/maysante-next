"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Envoie une page vue à /api/track à chaque navigation.
 * Le référent (document.referrer) n'est pertinent que pour la première
 * page de la visite ; pour les navigations internes il est ignoré côté
 * serveur (même domaine).
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === lastPath.current) return;
    lastPath.current = pathname;

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
