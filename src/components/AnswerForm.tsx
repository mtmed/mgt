"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { createAnswer, type FormState } from "@/lib/actions";

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : "Antwort abschicken"}
    </button>
  );
}

export function AnswerForm({ caseId }: { caseId: string }) {
  const [state, formAction] = useActionState(createAnswer, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Nach erfolgreichem Absenden (kein Fehler) das Feld leeren.
  useEffect(() => {
    if (!state.error) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="caseId" value={caseId} />
      <div>
        <label htmlFor="answer-body" className="block text-sm font-medium">
          Deine Antwort <span className="text-gray-400">(namentlich)</span>
        </label>
        <textarea
          id="answer-body"
          name="body"
          rows={4}
          required
          placeholder="Teile deine fachliche Einschätzung."
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
