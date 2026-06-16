import { consensusBand } from "@/lib/consensus";

// Qualitatives Band statt laufender Zahl (§5a). Nie namentlich, nie eine Zahl.
export function ConsensusBand({ count }: { count: number }) {
  const label = consensusBand(count);
  if (!label) return null;
  return <span className="text-xs text-muted">{label}</span>;
}
