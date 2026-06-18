// Stichwörter je Thema (slug) für die textbasierten Vorschläge im Compose.
// Bewusst einfach (Substring-Treffer, kein KI) — leicht erweiterbar.
export const THEME_KEYWORDS: Record<string, string[]> = {
  bildschirm: ["bildschirm", "monitor", "sehhilfe", "brille", "auge", "display"],
  "laerm-vibration": ["lärm", "laerm", "gehörschutz", "otoplastik", "vibration", "dezibel", "db(a)"],
  nachtarbeit: ["nacht", "schicht", "nachtdienst", "nachtarbeit"],
  mutterschutz: ["schwanger", "mutterschutz", "stillzeit", "mutterschaft"],
  vgue: ["vgü", "gesundheitsüberwachung", "eignungsuntersuchung", "folgeuntersuchung"],
  evaluierung: ["evaluierung", "gefährdungsbeurteilung", "aschg"],
  eignung: ["eignung", "tauglichkeit", "stapler", "lenker", "fahr", "absturz", "höhe", "leiter", "gerüst"],
  berufskrankheit: ["berufskrankheit", "auva", "bk ", "anerkennung", "meldung"],
  impfen: ["impf", "impfung", "tetanus", "fsme", "influenza", "grippe"],
  "bio-arbeitsstoffe": ["hepatitis", "infektion", "biologisch", "nadelstich", "tuberkulose", "tbc"],
  gefahrstoffe: ["gefahrstoff", "haut", "dermatitis", "ekzem", "handschuh", "feuchtarbeit", "lösungsmittel", "allergie"],
  ergonomie: ["ergonomie", "rücken", "lws", "heben", "tragen", "muskel", "skelett", "haltung", "bandscheibe"],
  psyche: ["psych", "stress", "burnout", "belastung", "bgf", "mobbing"],
  sucht: ["sucht", "alkohol", "drogen", "screening", "nikotin"],
  reisemedizin: ["reise", "tropen", "malaria", "entsendung", "ausland", "gelbfieber"],
  wiedereingliederung: ["wiedereingliederung", "fit2work", "stufenplan", "wietz", "reha", "rückkehr"],
  "recht-datenschutz": ["datenschutz", "dsgvo", "schweigepflicht", "einwilligung", "recht"],
};

// Liefert vorgeschlagene Theme-Slugs für einen Text (nur aus der erlaubten Liste).
export function suggestThemes(text: string, allowed: string[]): string[] {
  const t = text.toLowerCase();
  if (t.trim().length < 8) return [];
  const allowedSet = new Set(allowed);
  return Object.entries(THEME_KEYWORDS)
    .filter(([slug, kws]) => allowedSet.has(slug) && kws.some((k) => t.includes(k)))
    .map(([slug]) => slug);
}
