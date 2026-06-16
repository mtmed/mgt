// Avatar aus Initialen. Hauttonpalette §2 — rotierend, nie ein einzelner Ton.
const SKINS = [
  { bg: "#F2C9A0", fg: "#7A5230" },
  { bg: "#E0A878", fg: "#6A3F1E" },
  { bg: "#C98D5E", fg: "#FFFFFF" },
  { bg: "#8A5A38", fg: "#FFFFFF" },
  { bg: "#5E3A22", fg: "#FFFFFF" },
] as const;

function initials(name: string): string {
  const words = name
    .replace(/\b(Dr|Prof|Mag|Dipl)\.?/gi, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const letters = words.slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "");
  return letters.join("") || "?";
}

function skinFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return SKINS[Math.abs(hash) % SKINS.length];
}

export function Avatar({
  id,
  name,
  size = 28,
}: {
  id: string;
  name: string;
  size?: number;
}) {
  const skin = skinFor(id);
  return (
    <span
      title={name}
      aria-label={name}
      style={{
        backgroundColor: skin.bg,
        color: skin.fg,
        width: size,
        height: size,
        fontSize: size * 0.4,
      }}
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
    >
      {initials(name)}
    </span>
  );
}
