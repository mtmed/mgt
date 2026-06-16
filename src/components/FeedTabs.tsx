import Link from "next/link";
import type { FeedTab } from "@/lib/post";

// Ein Feed, drei Linsen (§3). Farb-Punkte als Vorschau der Farbsprache.
const TABS: {
  value: FeedTab;
  label: string;
  mood: string;
  dot?: "kobalt" | "terra";
}[] = [
  { value: "tag", label: "Tag", mood: "Dein Berufstag — alles in einem Strom." },
  {
    value: "fach",
    label: "Fach",
    mood: "Gelöste Fälle und geteiltes Wissen.",
    dot: "kobalt",
  },
  {
    value: "pause",
    label: "Pause",
    mood: "Kurz durchatmen. Hier zählt nichts.",
    dot: "terra",
  },
];

export function FeedTabs({ active }: { active: FeedTab }) {
  const current = TABS.find((t) => t.value === active) ?? TABS[0];
  return (
    <div>
      <nav className="flex gap-1 border-b border-border-soft">
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          const color =
            tab.value === "fach"
              ? "text-kobalt border-kobalt"
              : tab.value === "pause"
                ? "text-terra-deep border-terra"
                : "text-ink border-ink";
          return (
            <Link
              key={tab.value}
              href={tab.value === "tag" ? "/" : `/?tab=${tab.value}`}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? color
                  : "border-transparent text-muted hover:text-ink"
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
