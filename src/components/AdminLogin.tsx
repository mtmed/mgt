"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin, type AdminLoginState } from "@/lib/admin-actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Prüfe …" : "Anmelden"}
    </button>
  );
}

export function AdminLogin() {
  const [state, formAction] = useActionState(adminLogin, {} as AdminLoginState);
  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="admin-pw" className="block text-sm font-medium">
          Admin-Passwort
        </label>
        <input
          id="admin-pw"
          name="password"
          type="password"
          autoFocus
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
