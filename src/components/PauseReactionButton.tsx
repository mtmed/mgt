"use client";

import { useOptimistic, useTransition } from "react";
import { togglePauseReaction } from "@/lib/actions";

// „haben geschmunzelt" — Terrakotta, keine Zahl, kein Gelb. Off the record.
// Optimistisch: Zustand kippt sofort.
export function PauseReactionButton({
  postId,
  active,
}: {
  postId: string;
  active: boolean;
}) {
  const [, startTransition] = useTransition();
  const [optimActive, setOptimActive] = useOptimistic(active, (s) => !s);

  const onClick = () =>
    startTransition(async () => {
      setOptimActive(undefined);
      await togglePauseReaction(postId);
    });

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={optimActive}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        optimActive
          ? "bg-chip-pause-bg text-terra-deep"
          : "border border-border-pause text-terra-deep hover:bg-chip-pause-bg/60"
      }`}
    >
      {optimActive ? "geschmunzelt ✓" : "schmunzeln"}
    </button>
  );
}
