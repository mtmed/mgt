"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createPost, type FormState } from "@/lib/actions";

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
    label: "Input holen",
    hint: "Frage oder Fall",
    placeholder: "Schildere deine Frage oder deinen Fall …",
    accent: "kobalt",
  },
  {
    value: "GIVE",
    label: "Input geben",
    hint: "Info teilen",
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

function SubmitButton({ accent }: { accent: "kobalt" | "terra" }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 ${
        accent === "terra" ? "bg-terra" : "bg-kobalt"
      }`}
    >
      {pending ? "Wird geteilt …" : "Teilen"}
    </button>
  );
}

type Tag = { slug: string; label: string; category: "VORSORGE" | "THEMA" | null };

export function ComposeForm({
  initialIntent = "SEEK",
  tags = [],
}: {
  initialIntent?: Intent;
  tags?: Tag[];
}) {
  const [state, formAction] = useActionState(createPost, {} as FormState);
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const [relation, setRelation] = useState<"MATCHES" | "EXCEEDS" | "DIVERGES">(
    "MATCHES",
  );
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const active = INTENTS.find((i) => i.value === intent)!;
  const isFach = intent !== "PAUSE";

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
    { title: "Vorsorge", items: tags.filter((t) => t.category === "VORSORGE") },
    { title: "Themen", items: tags.filter((t) => t.category === "THEMA") },
  ];

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
                <span className="block text-sm font-semibold">{opt.label}</span>
                <span className="block text-xs text-muted">{opt.hint}</span>
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
          name="text"
          rows={6}
          required
          placeholder={active.placeholder}
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
      </div>

      {isFach && tags.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium">
            Tags <span className="text-muted">(optional, Mehrfachauswahl)</span>
          </span>
          {selectedTags.map((slug) => (
            <input key={slug} type="hidden" name="tags" value={slug} />
          ))}
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
            placeholder="Neuen Tag vorschlagen (kommagetrennt) — wird geprüft"
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

      <SubmitButton accent={active.accent} />
    </form>
  );
}
