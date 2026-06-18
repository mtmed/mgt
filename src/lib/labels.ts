import { prisma } from "@/lib/prisma";

// Editierbare UI-Texte. Default im Code, Override in der DB (Admin pflegt sie).
export type LabelDef = {
  key: string;
  group: string;
  desc: string;
  def: string;
};

export const LABEL_DEFS: LabelDef[] = [
  { key: "footer", group: "Allgemein", desc: "Fußzeile", def: "Antworten sind immer namentlich." },
  { key: "feed_empty", group: "Feed", desc: "Leerer Feed", def: "Noch nichts hier. Mach den Anfang." },
  { key: "intent_seek_label", group: "Beitrag erstellen", desc: "Input holen — Titel", def: "Input holen" },
  { key: "intent_seek_hint", group: "Beitrag erstellen", desc: "Input holen — Unterzeile", def: "Frage oder Fall" },
  { key: "intent_give_label", group: "Beitrag erstellen", desc: "Input geben — Titel", def: "Input geben" },
  { key: "intent_give_hint", group: "Beitrag erstellen", desc: "Input geben — Unterzeile", def: "Info teilen" },
  { key: "intent_pause_label", group: "Beitrag erstellen", desc: "Pause — Titel", def: "Pause" },
  { key: "intent_pause_hint", group: "Beitrag erstellen", desc: "Pause — Unterzeile", def: "leicht & menschlich" },
];

export const DEFAULT_LABELS: Record<string, string> = Object.fromEntries(
  LABEL_DEFS.map((d) => [d.key, d.def]),
);

export type Labels = Record<string, string>;

// Merge: Defaults + DB-Overrides (nur nicht-leere).
export async function getLabels(): Promise<Labels> {
  const rows = await prisma.label.findMany();
  const map: Labels = { ...DEFAULT_LABELS };
  for (const r of rows) {
    if (r.value.trim()) map[r.key] = r.value;
  }
  return map;
}
