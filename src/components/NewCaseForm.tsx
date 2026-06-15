"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createCase, type FormState } from "@/lib/actions";

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
    >
      {pending ? "Wird gespeichert …" : "Fall einbringen"}
    </button>
  );
}

export function NewCaseForm() {
  const [state, formAction] = useActionState(createCase, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Titel
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="Kurz und aussagekräftig"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label htmlFor="setting" className="block text-sm font-medium">
          Setting <span className="text-gray-400">(optional)</span>
        </label>
        <input
          id="setting"
          name="setting"
          type="text"
          placeholder="z. B. Großbetrieb, Schichtdienst"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
        />
      </div>

      <div>
        <label htmlFor="body" className="block text-sm font-medium">
          Fragetext
        </label>
        <textarea
          id="body"
          name="body"
          rows={6}
          required
          placeholder="Beschreibe den Fall und deine konkrete Frage."
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
