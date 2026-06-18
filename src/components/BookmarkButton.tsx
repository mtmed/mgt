"use client";

import { useOptimistic, useTransition } from "react";
import { toggleBookmark } from "@/lib/actions";

// Privates Speichern — neutral (Kobalt), kein Gelb (keine Anerkennung).
export function BookmarkButton({
  postId,
  active,
}: {
  postId: string;
  active: boolean;
}) {
  const [, startTransition] = useTransition();
  const [on, setOn] = useOptimistic(active, (s) => !s);

  return (
    <button
      type="button"
      onClick={() =>
        startTransition(async () => {
          setOn(undefined);
          await toggleBookmark(postId);
        })
      }
      aria-pressed={on}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        on
          ? "bg-eisblau/60 text-kobalt"
          : "border border-chip-quelle-bd text-kobalt hover:bg-eisblau/30"
      }`}
    >
      {on ? "✓ gemerkt" : "merken"}
    </button>
  );
}
