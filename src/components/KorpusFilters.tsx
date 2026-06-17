"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Korpus-Filter: Textsuche + „nur gelöste Fälle" + ausklappbare Tags.
// Alle Parameter werden zusammengeführt (Suche/Status/Tag bleiben erhalten).
export function KorpusFilters({
  tags,
  q,
  tag,
  solvedOnly,
}: {
  tags: { slug: string; label: string }[];
  q?: string;
  tag?: string;
  solvedOnly: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q ?? "");
  const [expanded, setExpanded] = useState(false);

  const go = (next: {
    q?: string;
    tag?: string;
    status?: string;
  }) => {
    const merged = {
      q: query.trim() || undefined,
      tag,
      status: solvedOnly ? "geloest" : undefined,
      ...next,
    };
    const params = new URLSearchParams();
    if (merged.q) params.set("q", merged.q);
    if (merged.tag) params.set("tag", merged.tag);
    if (merged.status) params.set("status", merged.status);
    const qs = params.toString();
    router.push(`/korpus${qs ? `?${qs}` : ""}`);
  };

  const activeTag = tags.find((t) => t.slug === tag);
  const chip = (on: boolean) =>
    `rounded-full px-2.5 py-1 text-xs transition ${
      on
        ? "bg-kobalt text-white"
        : "border border-chip-quelle-bd bg-chip-quelle-bg text-kobalt hover:border-kobalt/40"
    }`;

  return (
    <div className="mt-4 space-y-3">
      {/* Textsuche */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          go({ q: query.trim() || undefined });
        }}
        className="flex gap-2"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Im Korpus suchen …"
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
        <button
          type="submit"
          className="shrink-0 rounded-md bg-kobalt px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Suchen
        </button>
      </form>

      {/* „nur gelöste Fälle" */}
      <button
        type="button"
        onClick={() => go({ status: solvedOnly ? undefined : "geloest" })}
        aria-pressed={solvedOnly}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition ${
          solvedOnly
            ? "bg-gelb text-ink"
            : "border border-gelb text-ink hover:bg-gelb/20"
        }`}
      >
        {solvedOnly ? "✓ nur gelöste Fälle" : "nur gelöste Fälle"}
      </button>

      {/* Ausklappbare Tags */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => go({ tag: undefined })} className={chip(!tag)}>
          Alle
        </button>

        {/* Eingeklappt: aktiver Tag bleibt sichtbar */}
        {!expanded && activeTag && (
          <button type="button" className={chip(true)} onClick={() => go({ tag: undefined })}>
            {activeTag.label} ✕
          </button>
        )}

        {expanded &&
          tags.map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => go({ tag: t.slug })}
              className={chip(tag === t.slug)}
            >
              {t.label}
            </button>
          ))}

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="rounded-full px-2.5 py-1 text-xs text-muted hover:text-ink"
        >
          {expanded ? "Themen ▴" : "Themen wählen ▾"}
        </button>
      </div>
    </div>
  );
}
