"use client";

import Link from "next/link";
import { useState } from "react";

// Kleines Menü rechts in der Reiterleiste: eigene & gespeicherte Beiträge.
export function MeineMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative ml-auto">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="whitespace-nowrap px-3 py-2 text-sm font-semibold text-muted hover:text-ink"
      >
        Meine ▾
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-md border border-border-soft bg-white py-1 shadow-md">
            <Link
              href="/meine"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-eisblau/20"
            >
              Meine Beiträge
            </Link>
            <Link
              href="/meine?show=saved"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-eisblau/20"
            >
              Gespeichert
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
