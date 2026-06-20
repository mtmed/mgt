"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginRequest } from "@/lib/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : "Code senden"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(loginRequest, {});

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <input
        type="text"
        name="email"
        id="email"
        required
        autoComplete="email"
        inputMode="email"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="name@beispiel.at"
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
