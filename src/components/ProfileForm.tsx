"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { updateName } from "@/lib/actions";

type State = { error?: string; ok?: boolean };

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Speichert …" : "Name speichern"}
    </button>
  );
}

export function ProfileForm({ currentName }: { currentName: string }) {
  const [state, action] = useActionState(updateName, {} as State);

  return (
    <form action={action} className="mt-4 space-y-3">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">
          Angezeigter Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={currentName}
          required
          maxLength={80}
          className="mt-1 w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
      </div>
      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="text-sm text-kobalt" role="status">
          Gespeichert.
        </p>
      )}
      <SaveButton />
    </form>
  );
}
