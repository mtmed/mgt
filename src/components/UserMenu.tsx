"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";

// User-Kreis im Header → Menü mit eigenen & gespeicherten Beiträgen.
export function UserMenu({
  user,
  admin = false,
  unread = 0,
  onSignOut,
}: {
  user: { id: string; name: string };
  admin?: boolean;
  unread?: number;
  onSignOut?: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Mein Menü"
        aria-expanded={open}
        className="relative flex rounded-full ring-2 ring-transparent transition hover:ring-border-soft"
      >
        <Avatar id={user.id} name={user.name} size={30} />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-kobalt"
          />
        )}
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
            <div className="truncate border-b border-border-soft px-3 py-2 text-xs text-muted">
              {user.name}
            </div>
            <Link
              href="/profil"
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm hover:bg-eisblau/20"
            >
              Profil
            </Link>
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
            <Link
              href="/postfach"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between px-3 py-2 text-sm hover:bg-eisblau/20"
            >
              Postfach
              {unread > 0 && (
                <span className="rounded-full bg-kobalt px-1.5 text-[11px] font-semibold text-white">
                  {unread}
                </span>
              )}
            </Link>
            {admin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="block border-t border-border-soft px-3 py-2 text-sm text-kobalt hover:bg-eisblau/20"
              >
                Admin
              </Link>
            )}
            {onSignOut && (
              <form action={onSignOut} className="border-t border-border-soft">
                <button
                  type="submit"
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-eisblau/20"
                >
                  Abmelden
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}
