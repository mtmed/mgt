import Link from "next/link";

export type SortKey = "relevanz" | "neueste" | "offen";

const OPTIONS: { key: SortKey; label: string; href: string }[] = [
  { key: "relevanz", label: "Relevanz", href: "/" },
  { key: "neueste", label: "Neueste", href: "/?sort=neueste" },
  { key: "offen", label: "Offen zuerst", href: "/?sort=offen" },
];

export function SortControl({ active }: { active: SortKey }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className="text-muted">Sortieren:</span>
      {OPTIONS.map((o) => (
        <Link
          key={o.key}
          href={o.href}
          className={`wob rounded-full px-2.5 py-1 transition ${
            o.key === active
              ? "bg-ink text-white"
              : "border border-border-soft text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
