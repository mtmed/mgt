"use client";

import { useActionState, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPost, type FormState } from "@/lib/actions";
import { suggestThemes } from "@/lib/theme-keywords";
import { detectIdentifiers } from "@/lib/anon-detect";
import { AnonNudge } from "@/components/AnonNudge";

// Bild im Browser verkleinern (max. 1600 px) und als JPEG neu kodieren.
// Das umgeht Vercels 4,5-MB-Upload-Grenze und entfernt EXIF schon am Gerät.
async function resizeImage(file: File): Promise<Blob> {
  const MAX = 1600;
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas-Kontext fehlt.");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Bildkonvertierung fehlgeschlagen."))),
      "image/jpeg",
      0.8,
    ),
  );
}

type Intent = "SEEK" | "GIVE" | "PAUSE";

const INTENTS: {
  value: Intent;
  label: string;
  hint: string;
  placeholder: string;
  accent: "kobalt" | "terra";
}[] = [
  {
    value: "SEEK",
    label: "Frage",
    hint: "Frage oder Fall",
    placeholder: "Schildere deine Frage oder deinen Fall …",
    accent: "kobalt",
  },
  {
    value: "GIVE",
    label: "Info",
    hint: "Wissen teilen",
    placeholder: "Teile dein Vorgehen oder Wissen …",
    accent: "kobalt",
  },
  {
    value: "PAUSE",
    label: "Pause",
    hint: "leicht & menschlich",
    placeholder: "Was geht dir gerade durch den Kopf?",
    accent: "terra",
  },
];

function SubmitButton({
  accent,
  busy,
  flagged,
}: {
  accent: "kobalt" | "terra";
  busy: boolean;
  flagged: boolean;
}) {
  const { pending } = useFormStatus();
  const disabled = pending || busy;
  const idleLabel = flagged ? "Trotzdem teilen" : "Teilen";
  return (
    <button
      type="submit"
      disabled={disabled}
      className={`rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 ${
        accent === "terra" ? "bg-terra" : "bg-kobalt"
      }`}
    >
      {busy
        ? "Bilder werden verarbeitet …"
        : pending
          ? "Wird geteilt …"
          : idleLabel}
    </button>
  );
}

type Tag = { slug: string; label: string; category: "VORSORGE" | "THEMA" | null };

export function ComposeForm({
  initialIntent = "SEEK",
  tags = [],
  labels = {},
}: {
  initialIntent?: Intent;
  tags?: Tag[];
  labels?: Record<string, string>;
}) {
  const [state, formAction] = useActionState(createPost, {} as FormState);
  const [imagesBusy, setImagesBusy] = useState(false);
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [relation, setRelation] = useState<"MATCHES" | "EXCEEDS" | "DIVERGES">(
    "MATCHES",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const active = INTENTS.find((i) => i.value === intent)!;
  const isFach = intent !== "PAUSE";

  // Anonymisierungs-Nudge (§6a): nur im Fach-Register (Frage/Info), nur sobald
  // Text da ist. Läuft rein clientseitig — Treffer werden nie versendet/geloggt.
  const anonHits = isFach && text.trim() ? detectIdentifiers(text) : [];

  // Themen-Vorschläge aus dem Text (Stichwort-Treffer, nicht bereits gewählt).
  const suggestions = isFach
    ? suggestThemes(
        text,
        tags.map((t) => t.slug),
      ).filter((s) => !selectedTags.includes(s))
    : [];
  const labelFor = (slug: string) =>
    tags.find((t) => t.slug === slug)?.label ?? slug;

  const RELATIONS: { value: typeof relation; label: string }[] = [
    { value: "MATCHES", label: "deckt sich mit der Leitlinie" },
    { value: "EXCEEDS", label: "geht über die Leitlinie hinaus" },
    { value: "DIVERGES", label: "weicht bewusst ab" },
  ];

  const toggleTag = (slug: string) =>
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );

  const tagGroups: { title: string; items: Tag[] }[] = [
    {
      title: "Untersuchung & Recht",
      items: tags.filter((t) => t.category === "VORSORGE"),
    },
    { title: "Themenfelder", items: tags.filter((t) => t.category === "THEMA") },
  ];

  // Beim Auswählen: Bilder verkleinern + EXIF entfernen und die verkleinerten
  // Dateien zurück ins Feld schreiben — das Formular verschickt dann kleine JPEGs.
  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []).slice(0, 3);
    if (files.length === 0) return;
    setImagesBusy(true);
    try {
      const dt = new DataTransfer();
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          dt.items.add(file);
          continue;
        }
        try {
          const blob = await resizeImage(file);
          dt.items.add(new File([blob], "image.jpg", { type: "image/jpeg" }));
        } catch {
          dt.items.add(file); // Fallback: Original
        }
      }
      input.files = dt.files;
    } finally {
      setImagesBusy(false);
    }
  };

  return (
    <form action={formAction} className="space-y-4">
      <fieldset>
        <legend className="mb-2 text-sm font-medium">Was möchtest du tun?</legend>
        <div className="grid grid-cols-3 gap-2">
          {INTENTS.map((opt) => {
            const selected = opt.value === intent;
            const isTerra = opt.accent === "terra";
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setIntent(opt.value)}
                className={`rounded-lg border p-3 text-left transition ${
                  selected
                    ? isTerra
                      ? "border-terra bg-sand"
                      : "border-kobalt bg-eisblau/30"
                    : "border-border-soft bg-white hover:border-kobalt/40"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {labels[`intent_${opt.value.toLowerCase()}_label`] ?? opt.label}
                </span>
                <span className="block text-xs text-muted">
                  {labels[`intent_${opt.value.toLowerCase()}_hint`] ?? opt.hint}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <input type="hidden" name="intent" value={intent} />

      {isFach && (
        <div>
          <input
            type="text"
            name="title"
            required
            maxLength={160}
            placeholder="Titel — kurz und aussagekräftig"
            className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm font-medium focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
          />
        </div>
      )}

      <div>
        <textarea
          ref={textareaRef}
          name="text"
          rows={6}
          required
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={active.placeholder}
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
      </div>

      {isFach && text.trim() && (
        <div className="space-y-2">
          <AnonNudge
            hits={anonHits}
            onRevise={() => textareaRef.current?.focus()}
          />
          <p className="flex items-center gap-1.5 text-[11px] text-muted">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Diese Prüfung läuft nur auf deinem Gerät — nichts wird gesendet oder
            gespeichert.
          </p>
        </div>
      )}

      {isFach && tags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">
            Themen <span className="text-muted">(optional, Mehrfachauswahl)</span>
          </span>
          {selectedTags.map((slug) => (
            <input key={slug} type="hidden" name="tags" value={slug} />
          ))}
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted">Vorschläge:</span>
              {suggestions.map((slug) => (
                <button
                  key={slug}
                  type="button"
                  onClick={() => toggleTag(slug)}
                  className="rounded-full border border-dashed border-kobalt/50 bg-eisblau/20 px-2.5 py-1 text-xs text-kobalt transition hover:bg-eisblau/40"
                >
                  + {labelFor(slug)}
                </button>
              ))}
            </div>
          )}
          {tagGroups.map(
            (group) =>
              group.items.length > 0 && (
                <div key={group.title}>
                  <span className="text-xs text-muted">{group.title}</span>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {group.items.map((t) => {
                      const on = selectedTags.includes(t.slug);
                      return (
                        <button
                          key={t.slug}
                          type="button"
                          onClick={() => toggleTag(t.slug)}
                          aria-pressed={on}
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            on
                              ? "bg-kobalt text-white"
                              : "border border-chip-quelle-bd bg-chip-quelle-bg text-kobalt"
                          }`}
                        >
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ),
          )}
          <input
            type="text"
            name="newTags"
            placeholder="Neues Thema vorschlagen (kommagetrennt) — wird geprüft"
            className="mt-1 w-full rounded-md border border-border-soft bg-white px-3 py-2 text-xs focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
          />
        </div>
      )}

      {intent === "SEEK" && (
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            name="isPseudonym"
            className="mt-0.5 h-4 w-4 accent-kobalt"
          />
          <span>
            <span className="font-medium">Pseudonym fragen</span>
            <span className="block text-xs text-muted">
              Fragen dürfen anonym sein — Antworten sind immer namentlich.
            </span>
          </span>
        </label>
      )}

      {/* Bild-Anhänge — nur Fach, nicht-personenbezogen. */}
      {isFach && (
        <div>
          <label htmlFor="images" className="block text-sm font-medium">
            Bilder <span className="text-muted">(optional, max. 3)</span>
          </label>
          <input
            id="images"
            name="images"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            className="mt-1 block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-eisblau/40 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-kobalt"
          />
          <p className="mt-1 text-xs text-muted">
            Nur Arbeitsplatz/Situation — keine Personen, Gesichter, Namensschilder
            oder Kennzeichen. Standort-/Gerätedaten (EXIF) werden beim Hochladen
            entfernt.
          </p>
        </div>
      )}

      {/* Quelle anhängen (§7) — nur beim „Input geben". */}
      {intent === "GIVE" && (
        <fieldset className="rounded-lg border border-border-soft p-3">
          <legend className="px-1 text-sm font-medium">
            Quelle anhängen <span className="text-muted">(optional)</span>
          </legend>

          <input
            type="text"
            name="sourceTitle"
            placeholder="Titel der Leitlinie / Quelle"
            className="mt-1 w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
          />
          <input
            type="url"
            name="sourceUrl"
            placeholder="Link (optional)"
            className="mt-2 w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
          />

          <input type="hidden" name="sourceRelation" value={relation} />
          <div className="mt-3 space-y-1">
            <span className="text-xs text-muted">
              Verhältnis deiner Praxis zur Leitlinie:
            </span>
            <div className="flex flex-col gap-1">
              {RELATIONS.map((r) => (
                <label key={r.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="relationChoice"
                    checked={relation === r.value}
                    onChange={() => setRelation(r.value)}
                    className="h-4 w-4 accent-kobalt"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </div>

          {relation === "DIVERGES" && (
            <div className="mt-3">
              <label htmlFor="sourceReason" className="block text-xs text-muted">
                Warum weichst du bewusst ab? (kurz — Pflicht)
              </label>
              <textarea
                id="sourceReason"
                name="sourceReason"
                rows={2}
                placeholder="z. B. individuelle Gefährdungslage, aktuellere Evidenz …"
                className="mt-1 w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
              />
            </div>
          )}
        </fieldset>
      )}

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton
        accent={active.accent}
        busy={imagesBusy}
        flagged={anonHits.length > 0}
      />
    </form>
  );
}
