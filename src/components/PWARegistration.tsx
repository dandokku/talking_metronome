"use client";

import { useEffect } from "react";

export default function PWARegistration() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      (window as any).workbox !== undefined
    ) {
      const wb = (window as any).workbox;

      // Add debug logging
      wb.addEventListener("installed", (event: any) => {
        console.log(`[PWA] Service worker installed: ${event.type}`);
      });

      wb.addEventListener("activated", (event: any) => {
        console.log(`[PWA] Service worker activated: ${event.type}`);
        if (!event.isUpdate) {
          console.log("[PWA] Content is cached for offline use.");
        }
      });

      wb.addEventListener("waiting", () => {
        console.log("[PWA] New content is available; please refresh.");
      });

      wb.addEventListener("controlling", () => {
        console.log("[PWA] Service worker is controlling the page.");
      });

      // Register the service worker
      wb.register().then((registration: any) => {
        console.log("[PWA] Service worker registered successfully:", registration.scope);
      }).catch((error: any) => {
        console.error("[PWA] Service worker registration failed:", error);
      });
    } else if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
        // Fallback for when workbox window is not available but SW is supported
        navigator.serviceWorker.register("/sw.js").then((reg) => {
            console.log("[PWA] Service worker registered (fallback):", reg.scope);
        }).catch((err) => {
            console.error("[PWA] Service worker registration failed (fallback):", err);
        });
    }
  }, []);

  return null;
}
