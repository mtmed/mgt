import type { Intent } from "@prisma/client";

// Register und Typ werden aus dem Intent abgeleitet (nicht doppelt gespeichert).
export type Register = "FACH" | "PAUSE";

export function registerOf(intent: Intent): Register {
  return intent === "PAUSE" ? "PAUSE" : "FACH";
}

// Typ-Label (UI): Frage vs. Info. Pause hat kein Typ-Label.
export function typeLabel(intent: Intent): "Frage" | "Info" | null {
  if (intent === "SEEK") return "Frage";
  if (intent === "GIVE") return "Info";
  return null;
}

// Feed-Linsen. „korpus" ist eine eigene Route (/korpus), die übrigen sind ?tab=.
export type FeedTab = "tag" | "fach" | "pause" | "korpus";

export function isValidTab(value: string | undefined): value is FeedTab {
  return value === "tag" || value === "fach" || value === "pause";
}
