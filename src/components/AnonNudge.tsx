"use client";

import type { AnonHit } from "@/lib/anon-detect";

// Echtzeit-Anonymisierungs-Hinweis beim Schreiben eines Falls (§6a).
// Blau = Fakt/Struktur (Hinweis, kein Alarm-Rot), Grün = sauber. Kein Block —
// der/die Autor:in entscheidet („Überarbeiten" oder „Trotzdem teilen").
function ShieldIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CheckMini() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AnonNudge({
  hits,
  onRevise,
}: {
  hits: AnonHit[];
  onRevise: () => void;
}) {
  const flagged = hits.length > 0;

  return (
    <div
      className={`anim-in rounded-xl border p-3.5 ${
        flagged
          ? "border-diverg-bd bg-diverg-bg"
          : "border-safe-bd bg-safe-bg"
      }`}
    >
      <div
        className={`flex items-center gap-2 ${
          flagged ? "text-diverg-fg" : "text-safe-fg"
        }`}
      >
        {flagged ? <ShieldIcon /> : <CheckIcon />}
        <span className="text-sm font-semibold">
          {flagged
            ? "Mögliche Identifikatoren erkannt"
            : "Keine offensichtlichen Identifikatoren"}
        </span>
      </div>

      {flagged && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {hits.map((h) => (
            <span
              key={h.sig}
              className="inline-flex items-center rounded-md border border-chip-quelle-bd bg-chip-quelle-bg px-2 py-1 text-xs text-kobalt"
            >
              <b className="font-semibold">{h.sig}</b>
              {h.hint ? <span>&nbsp;· {h.hint}</span> : null}
            </span>
          ))}
        </div>
      )}

      <div className="mt-2.5 border-t border-black/5 pt-2.5">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
          Anonymisierungs-Check
        </div>
        <ul className="space-y-1 text-xs leading-snug text-ink/80">
          <li className="flex gap-1.5">
            <CheckMini /> Keine Namen, kein namentlicher Betrieb.
          </li>
          <li className="flex gap-1.5">
            <CheckMini />
            <span>
              <b className="font-semibold">Mosaik-Effekt:</b> keine Kombination
              aus exakter Betriebsgröße + Region + seltenem Detail — auch ohne
              Namen re-identifizierbar.
            </span>
          </li>
        </ul>
      </div>

      {flagged && (
        <div className="mt-3">
          <button
            type="button"
            onClick={onRevise}
            className="rounded-md bg-kobalt px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
          >
            Überarbeiten
          </button>
        </div>
      )}
    </div>
  );
}
