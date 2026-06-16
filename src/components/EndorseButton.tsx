"use client";

import { useOptimistic, useTransition } from "react";
import { toggleEndorsement } from "@/lib/actions";
import { consensusBand } from "@/lib/consensus";

// „würde ich genauso machen" — gelbe Pill (verdiente Anerkennung) + Band.
// Optimistisch: Pill und Band reagieren sofort, der Server zieht nach.
export function EndorseButton({
  target,
  redirectPostId,
  active,
  count,
}: {
  target: { postId?: string; answerId?: string };
  redirectPostId: string;
  active: boolean;
  count: number;
}) {
  const [, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useOptimistic(
    { active, count },
    (state) => ({
      active: !state.active,
      count: state.count + (state.active ? -1 : 1),
    }),
  );

  const band = consensusBand(optimistic.count);

  const onClick = () =>
    startTransition(async () => {
      setOptimistic(undefined);
      await toggleEndorsement(target, redirectPostId);
    });

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={onClick}
        aria-pressed={optimistic.active}
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          optimistic.active
            ? "bg-gelb text-ink"
            : "border border-gelb text-ink hover:bg-gelb/20"
        }`}
      >
        würde ich genauso machen
      </button>
      {band && <span className="text-xs text-muted">{band}</span>}
    </div>
  );
}
