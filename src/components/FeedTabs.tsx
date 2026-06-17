import Link from "next/link";
import type { FeedTab } from "@/lib/post";

// Ein Feed, vier Linsen (§3 + Korpus). Farb-Punkte als Vorschau der Farbsprache.
const TABS: {
  value: FeedTab;
  label: string;
  href: string;
  mood: string;
  dot?: "kobalt" | "terra";
}[] = [
  {
    value: "tag",
    label: "Tag",
    href: "/",
    mood: "Dein Berufstag — alles in einem Strom.",
  },
  {
    value: "fach",
    label: "Fach",
    href: "/?tab=fach",
    mood: "Gelöste Fälle und geteiltes Wissen.",
    dot: "kobalt",
  },
  {
    value: "pause",
    label: "Pause",
    href: "/?tab=pause",
    mood: "Kurz durchatmen. Hier zählt nichts.",
    dot: "terra",
  },
  {
    value: "korpus",
    label: "Korpus",
    href: "/korpus",
    mood: "Der gemeinsame Korpus — gelöstes Wissen, nach Thema durchsuchbar.",
    dot: "kobalt",
  },
];

export function FeedTabs({ active }: { active: FeedTab }) {
  const current = TABS.find((t) => t.value === active) ?? TABS[0];
  return (
    <div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border-soft">
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          const color =
            tab.value === "pause"
              ? "text-terra-deep border-terra"
              : tab.value === "tag"
                ? "text-ink border-ink"
                : "text-kobalt border-kobalt";
          return (
            <Link
              key={tab.value}
              href={tab.href}
              className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-semibold transition ${
                isActive ? color : "border-transparent text-muted hover:text-ink"
              }`}
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
      </nav>
      <p className="mt-3 text-sm text-muted">{current.mood}</p>
    </div>
  );
}
