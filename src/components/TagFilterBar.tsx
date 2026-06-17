import Link from "next/link";

// Tag-Filter für den Korpus. Tags = Fakt/Struktur → Kobalt.
export function TagFilterBar({
  tags,
  active,
}: {
  tags: { slug: string; label: string }[];
  active?: string;
}) {
  const chip = (on: boolean) =>
    `rounded-full px-2.5 py-1 text-xs transition ${
      on
        ? "bg-kobalt text-white"
        : "border border-chip-quelle-bd bg-chip-quelle-bg text-kobalt hover:border-kobalt/40"
    }`;

  return (
    <div className="mt-4 flex flex-wrap gap-1.5">
      <Link href="/korpus" className={chip(!active)}>
        Alle
      </Link>
      {tags.map((t) => (
        <Link
          key={t.slug}
          href={`/korpus?tag=${t.slug}`}
          className={chip(active === t.slug)}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
