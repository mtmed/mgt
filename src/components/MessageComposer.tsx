"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { sendMessage } from "@/lib/message-actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : label}
    </button>
  );
}

export function MessageComposer({
  recipientId,
  placeholder = "Nachricht schreiben …",
  label = "Senden",
}: {
  recipientId: string;
  placeholder?: string;
  label?: string;
}) {
  const [state, formAction] = useActionState(sendMessage, {});

  return (
    <form action={formAction} className="space-y-2">
      <input type="hidden" name="recipientId" value={recipientId} />
      <textarea
        name="body"
        rows={3}
        required
        maxLength={4000}
        placeholder={placeholder}
        className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
      />
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <SubmitButton label={label} />
    </form>
  );
}
