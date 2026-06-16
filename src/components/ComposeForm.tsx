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

export function ComposeForm({ initialIntent = "SEEK" }: { initialIntent?: Intent }) {
  const [state, formAction] = useActionState(createPost, {} as FormState);
  const [intent, setIntent] = useState<Intent>(initialIntent);
  const active = INTENTS.find((i) => i.value === intent)!;

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

      <div>
        <textarea
          name="text"
          rows={6}
          required
          placeholder={active.placeholder}
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
      </div>

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

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton accent={active.accent} />
    </form>
  );
}
