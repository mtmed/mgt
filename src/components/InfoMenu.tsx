"use client";

import Link from "next/link";
import { useState } from "react";

// Info-/Transparenz-Menü im Header (links neben dem User-Kreis): Datenschutz,
// Impressum, Entwicklung. Bewusst neutral (Kobalt/Struktur), getrennt von den
// inhaltlichen Reitern.
const ITEMS = [
  { href: "/datenschutz", label: "Datenschutz" },
  { href: "/impressum", label: "Impressum" },
  { href: "/entwicklung", label: "Entwicklung" },
];

export function InfoMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex items-center">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Info & Rechtliches"
        aria-expanded={open}
        className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-muted ring-2 ring-transparent transition hover:text-ink hover:ring-border-soft"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
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
          <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-border-soft bg-white py-1 shadow-md">
            {ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2 text-sm hover:bg-eisblau/20"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
