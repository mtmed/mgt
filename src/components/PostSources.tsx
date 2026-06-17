import type { Source, SourceRelation } from "@prisma/client";

// Quelle (Kobalt-Chip) + Divergenz-Anzeige (§7). Fakt/Struktur = Kobalt,
// kein Anerkennungssignal. Divergenz wird offen gegen die Leitlinie gezeigt.
const RELATION_LABEL: Record<SourceRelation, string> = {
  MATCHES: "deckt sich mit der Leitlinie",
  EXCEEDS: "geht über die Leitlinie hinaus",
  DIVERGES: "weicht bewusst von der Leitlinie ab",
};

export function PostSources({ sources }: { sources: Source[] }) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      {sources.map((s) => (
        <div key={s.id} className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-[6px] border border-chip-quelle-bd bg-chip-quelle-bg px-2 py-0.5 text-xs font-medium text-kobalt hover:underline"
              >
                Quelle · {s.title}
              </a>
            ) : (
              <span className="inline-block rounded-[6px] border border-chip-quelle-bd bg-chip-quelle-bg px-2 py-0.5 text-xs font-medium text-kobalt">
                Quelle · {s.title}
              </span>
            )}
            {s.relation !== "DIVERGES" && (
              <span className="text-xs text-muted">
                {RELATION_LABEL[s.relation]}
              </span>
            )}
          </div>

          {s.relation === "DIVERGES" && (
            <div className="rounded-md border border-diverg-bd bg-diverg-bg px-3 py-2 text-xs text-diverg-fg">
              <span className="font-semibold">
                Divergenz: weicht bewusst von der Leitlinie ab
              </span>
              {s.reason && <p className="mt-1">{s.reason}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
