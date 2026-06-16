// Konsens-Bänder für „würde ich genauso machen" (DESIGN_DECISIONS.md §5a).
// Feste Schwellen, NIE View-/Reichweiten-abhängig. EINE zentrale Stelle zum
// Kalibrieren. Anzeige immer aggregiert, nie als laufende Zahl, nie namentlich.

export const CONSENSUS_THRESHOLDS = [
  { min: 10, label: "Viele Kolleg:innen würden es genauso machen" },
  { min: 3, label: "Einige Kolleg:innen würden es genauso machen" },
  { min: 1, label: "Einzelne würden es genauso machen" },
] as const;

/**
 * Liefert den Band-Text für eine Anzahl Zustimmungen — oder null bei 0
 * (dann zeigt das UI nur die Aktion selbst, keine Angabe).
 */
export function consensusBand(count: number): string | null {
  for (const band of CONSENSUS_THRESHOLDS) {
    if (count >= band.min) {
      return band.label;
    }
  }
  return null;
}
