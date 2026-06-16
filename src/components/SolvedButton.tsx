"use client";

import { useOptimistic, useTransition } from "react";
import { markSolved } from "@/lib/actions";

// „gelöst" setzt nur der/die Fragende (§5). Optimistisch: sofortiges Feedback.
export function SolvedButton({ postId }: { postId: string }) {
  const [, startTransition] = useTransition();
  const [done, setDone] = useOptimistic(false, () => true);

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-gelb px-3 py-1 text-xs font-semibold text-ink">
        ✓ gelöst
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          setDone(undefined);
          await markSolved(postId);
        })
      }
      className="rounded-full border border-gelb px-3 py-1 text-xs font-semibold text-ink hover:bg-gelb/20"
    >
      als gelöst markieren
    </button>
  );
}
