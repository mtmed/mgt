"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@/components/Avatar";

// User-Kreis im Header → Menü mit eigenen & gespeicherten Beiträgen.
export function UserMenu({
  user,
  admin = false,
  onSignOut,
}: {
  user: { id: string; name: string };
  admin?: boolean;
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
        className="flex rounded-full ring-2 ring-transparent transition hover:ring-border-soft"
      >
        <Avatar id={user.id} name={user.name} size={30} />
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
