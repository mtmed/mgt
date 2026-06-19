"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteAccount } from "@/lib/actions";

function ConfirmButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Wird gelöscht …" : "Endgültig löschen"}
    </button>
  );
}

export function DeleteAccountSection({ name }: { name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  const matches = typed.trim() === name;

  return (
    <div className="mt-10 border-t border-border-soft pt-5">
      <h2 className="text-sm font-semibold">Konto löschen</h2>
      <p className="mt-1 text-xs text-muted">
        Dein Konto und deine persönlichen Daten werden entfernt. Deine
        fachlichen Beiträge und Antworten bleiben als Teil des gemeinsamen
        Wissens erhalten — aber anonymisiert als „Nutzer gelöscht“. Das lässt
        sich nicht rückgängig machen.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-3 rounded-md border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Konto löschen
        </button>
      ) : (
        <form
          action={deleteAccount}
          className="mt-3 rounded-md border border-red-200 bg-red-50 p-3"
        >
          <p className="text-xs text-red-700">
            Dieser Schritt ist endgültig. Gib zur Bestätigung deinen Namen ein:{" "}
            <span className="font-semibold">{name}</span>
          </p>
          <input
            type="text"
            name="confirmName"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            placeholder="Dein Name"
            className="mt-2 w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-400"
          />
          <div className="mt-2 flex items-center gap-3">
            <ConfirmButton disabled={!matches} />
            <button
              type="button"
              onClick={() => {
                setConfirming(false);
                setTyped("");
              }}
              className="text-xs text-muted underline-offset-2 hover:underline"
            >
              Abbrechen
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
