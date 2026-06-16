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
      className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : "Antwort abschicken"}
    </button>
  );
}

export function AnswerForm({ postId }: { postId: string }) {
  const [state, formAction] = useActionState(createAnswer, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="postId" value={postId} />
      <div>
        <label htmlFor="answer-text" className="block text-sm font-medium">
          Deine Antwort <span className="text-muted">(namentlich)</span>
        </label>
        <textarea
          id="answer-text"
          name="text"
          rows={4}
          required
          placeholder="Teile deine fachliche Einschätzung."
          className="mt-1 w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
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
