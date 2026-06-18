"use client";

import Link from "next/link";
import { useState } from "react";

// Schwebender „+"-Kreis unten rechts. Öffnet ein kleines Popup mit den Intents.
export function ComposeBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <div className="relative">
        {open && (
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-0 cursor-default"
            />
            <div className="absolute bottom-16 right-0 z-10 w-48 overflow-hidden rounded-xl border border-border-soft bg-white shadow-lg">
              <Link
                href="/compose?intent=SEEK"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-kobalt hover:bg-eisblau/20"
              >
                Frage
              </Link>
              <Link
                href="/compose?intent=GIVE"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-kobalt hover:bg-eisblau/20"
              >
                Info
              </Link>
              <Link
                href="/compose?intent=PAUSE"
                onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-medium text-terra-deep hover:bg-chip-pause-bg/40"
              >
                Pause
              </Link>
              <div className="border-t border-border-soft px-4 py-1.5 text-xs text-muted">
                weitere folgen
              </div>
            </div>
          </>
        )}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Beitrag erstellen"
          aria-expanded={open}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-kobalt text-3xl font-light leading-none text-white shadow-lg transition hover:opacity-90 active:scale-95"
        >
          +
        </button>
      </div>
    </div>
  );
}
