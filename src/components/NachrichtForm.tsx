"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendAdminMessage } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : "Senden"}
    </button>
  );
}

export function NachrichtForm() {
  const [state, formAction] = useActionState(sendAdminMessage, {});

  if (state.ok) {
    return (
      <div className="mt-4 rounded-md border border-safe-bd bg-safe-bg p-4 text-sm text-safe-fg">
        Danke — deine Nachricht ist beim Admin angekommen.
      </div>
    );
  }

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <textarea
        name="body"
        rows={6}
        required
        maxLength={2000}
        placeholder="Was möchtest du dem Admin mitteilen? (Frage, Hinweis, Problem …)"
        className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
      />
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton />
    </form>
  );
}
