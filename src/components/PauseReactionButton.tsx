"use client";

import { useTransition } from "react";
import { togglePauseReaction } from "@/lib/actions";

// „haben geschmunzelt" — Terrakotta, keine Zahl, kein Gelb. Off the record.
export function PauseReactionButton({
  postId,
  active,
}: {
  postId: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => togglePauseReaction(postId))}
      aria-pressed={active}
      className={`rounded-full px-3 py-1 text-xs font-medium transition disabled:opacity-60 ${
        active
          ? "bg-chip-pause-bg text-terra-deep"
          : "border border-border-pause text-terra-deep hover:bg-chip-pause-bg/60"
      }`}
    >
      {active ? "geschmunzelt ✓" : "schmunzeln"}
    </button>
  );
}
