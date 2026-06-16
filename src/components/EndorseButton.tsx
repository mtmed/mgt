"use client";

import { useTransition } from "react";
import { toggleEndorsement } from "@/lib/actions";
import { ConsensusBand } from "@/components/ConsensusBand";

// „würde ich genauso machen" — gelbe Pill (verdiente Anerkennung) + Band.
// Aktiv = eigene Zustimmung gesetzt. Zahl wird NIE gezeigt, nur das Band.
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
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(() => toggleEndorsement(target, redirectPostId))
        }
        aria-pressed={active}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${
          active
            ? "bg-gelb text-ink"
            : "border border-gelb text-ink hover:bg-gelb/20"
        }`}
      >
        würde ich genauso machen
      </button>
      <ConsensusBand count={count} />
    </div>
  );
}
