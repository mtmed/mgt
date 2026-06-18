import Link from "next/link";
import type { FeedTab } from "@/lib/post";
import { getLabels } from "@/lib/labels";

// Ein Feed, vier Linsen — als „Browser-Tabs" (aktiver Tab verschmilzt mit der
// Fläche darunter). Werte (tag/fach/pause/korpus) bleiben fürs Routing.
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

export async function FeedTabs({ active }: { active: FeedTab }) {
  const labels = await getLabels();
  const current = TABS.find((t) => t.value === active) ?? TABS[0];
  const mood = labels[`mood_${current.value}`] ?? "";

  return (
    <div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border-soft">
        {TABS.map((tab) => {
          const isActive = tab.value === active;
          return (
            <Link
              key={tab.value}
              href={tab.href}
              className={
                isActive
                  ? `relative -mb-px flex items-center gap-1.5 whitespace-nowrap rounded-t-lg border border-b-0 border-border-soft px-3 py-2 text-sm font-semibold ${tab.bg} ${tab.color}`
                  : "flex items-center gap-1.5 whitespace-nowrap rounded-t-lg border border-transparent px-3 py-2 text-sm font-medium text-muted hover:bg-white/50 hover:text-ink"
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
      </nav>
      {mood && <p className="mt-3 text-sm text-muted">{mood}</p>}
    </div>
  );
}
