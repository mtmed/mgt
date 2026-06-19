"use client";

import Link from "next/link";
import { useState } from "react";

// Dezenter Dropdown-Pfeil neben „Unser Wissen": Info-/Transparenz-Seiten
// (Datenschutz, Impressum, Entwicklung). Bewusst neutral (Kobalt/Struktur).
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
        aria-label="Mehr"
        aria-expanded={open}
        className="wob flex items-center rounded-t-lg px-2 py-2 text-muted hover:text-ink"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
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
