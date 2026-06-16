"use client";

import { useTransition } from "react";
import { markSolved } from "@/lib/actions";

// „gelöst" setzt nur der/die Fragende (§5). Wird nur dieser Person angezeigt.
export function SolvedButton({ postId }: { postId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => markSolved(postId))}
      className="rounded-full border border-gelb px-3 py-1 text-xs font-semibold text-ink hover:bg-gelb/20 disabled:opacity-60"
    >
      als gelöst markieren
    </button>
  );
}
