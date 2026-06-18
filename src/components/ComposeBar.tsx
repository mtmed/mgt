"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Banner an der Unterkante mit „+". Beim Runterscrollen ausblenden, beim
// Hochscrollen einblenden. „+" öffnet ein kleines Popup mit den Intents.
export function ComposeBar() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current + 8 && y > 64) {
        setHidden(true);
        setOpen(false);
      } else if (y < lastY.current - 8) {
        setHidden(false);
      }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-border-soft bg-white/90 backdrop-blur transition-transform duration-300 ${
        hidden ? "translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <span className="text-sm text-muted">Beitrag erstellen</span>
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
              <div className="absolute bottom-14 right-0 z-10 w-48 overflow-hidden rounded-xl border border-border-soft bg-white shadow-lg">
                <Link
                  href="/compose?intent=SEEK"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-kobalt hover:bg-eisblau/20"
                >
                  Input holen
                </Link>
                <Link
                  href="/compose?intent=GIVE"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-kobalt hover:bg-eisblau/20"
                >
                  Input geben
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
            className="flex h-11 w-11 items-center justify-center rounded-full bg-kobalt text-2xl font-light leading-none text-white shadow-md transition hover:opacity-90 active:scale-95"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
