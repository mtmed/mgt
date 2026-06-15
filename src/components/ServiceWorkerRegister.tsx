"use client";

import { useEffect } from "react";

// Registriert den Service Worker clientseitig. Macht die App installierbar
// (Home-Bildschirm, Vollbild). Push folgt erst in einer späteren Phase.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }
    const onLoad = () => {
      navigator.serviceWorker.register("/sw.js").catch((error) => {
        console.error("Service-Worker-Registrierung fehlgeschlagen:", error);
      });
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return null;
}
