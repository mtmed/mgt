"use client";

import Link from "next/link";
import { useState } from "react";
import type { FeedTab } from "@/lib/post";
import { InfoMenu } from "@/components/InfoMenu";

// Ein Feed, vier Linsen — als „Browser-Tabs". Optimistisch: der geklickte Reiter
// wird SOFORT aktiv markiert, der Inhalt lädt im Hintergrund.
const TABS: {
  value: FeedTab;
  label: string;
  href: string;
  bg: string;
  color: string;
  dot?: "kobalt" | "terra";
}[] = [
  { value: "tag", label: "Alltag", href: "/", bg: "bg-kreme", color: "text-ink" },
  {
    value: "fach",
    label: "Beruf",
    href: "/?tab=fach",
    bg: "bg-bg-fach",
    color: "text-kobalt",
    dot: "kobalt",
  },
  {
    value: "pause",
    label: "Pause",
    href: "/?tab=pause",
    bg: "bg-sand-warm",
    color: "text-terra-deep",
    dot: "terra",
  },
  {
    value: "korpus",
    label: "Unser Wissen",
    href: "/korpus",
    bg: "bg-kreme",
    color: "text-kobalt",
    dot: "kobalt",
  },
];

export function FeedTabs({ active }: { active: FeedTab }) {
  const [target, setTarget] = useState<FeedTab | null>(null);
  const shown = target ?? active;

  return (
    <nav className="flex items-stretch border-b border-border-soft">
      <div className="flex gap-1 overflow-x-auto">
        {TABS.map((tab) => {
        const isActive = tab.value === shown;
        return (
          <Link
            key={tab.value}
            href={tab.href}
            onClick={() => setTarget(tab.value)}
            className={
              isActive
                ? `wob relative -mb-px flex items-center gap-1.5 whitespace-nowrap rounded-t-lg border border-b-0 border-border-soft px-3 py-2 text-sm font-semibold ${tab.bg} ${tab.color}`
                : "wob flex items-center gap-1.5 whitespace-nowrap rounded-t-lg border border-transparent px-3 py-2 text-sm font-medium text-muted hover:bg-white/50 hover:text-ink"
            }
          >
            {tab.dot && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  tab.dot === "kobalt" ? "bg-kobalt" : "bg-terra"
                }`}
              />
            )}
            {tab.label}
          </Link>
        );
        })}
      </div>
      <div className="ml-auto flex items-center">
        <InfoMenu />
      </div>
    </nav>
  );
}
