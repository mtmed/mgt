import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Seed: freigeschaltete Nutzer:innen + lebendige Beispiel-Inhalte.
// Idempotent (fixe IDs + upsert / skipDuplicates) — mehrfach ausführbar.

// Die ersten drei sind die umschaltbaren Haupt-Personas (siehe src/lib/users.ts),
// der Rest ist die „Kohorte" (für Autorenschaft & Zustimmungen / Konsens-Bänder).
const USERS = [
  { id: "u-mira", name: "Dr. Mira Falk", role: "Arbeitsmedizinerin" },
  { id: "u-jonas", name: "Dr. Jonas Berger", role: "Arbeitsmediziner" },
  { id: "u-amelie", name: "Dr. Amelie Stark", role: "Arbeitsmedizinerin" },
  { id: "u-lena", name: "Dr. Lena Hofer", role: "Arbeitsmedizinerin" },
  { id: "u-paul", name: "Dr. Paul Wagner", role: "Arbeitsmediziner" },
  { id: "u-sofia", name: "Dr. Sofia Gruber", role: "Arbeitsmedizinerin" },
  { id: "u-david", name: "Dr. David Moser", role: "Arbeitsmediziner" },
  { id: "u-clara", name: "Dr. Clara Bauer", role: "Arbeitsmedizinerin" },
  { id: "u-noah", name: "Dr. Noah Steiner", role: "Arbeitsmediziner" },
  { id: "u-emma", name: "Dr. Emma Huber", role: "Arbeitsmedizinerin" },
  { id: "u-felix", name: "Dr. Felix Maier", role: "Arbeitsmediziner" },
  { id: "u-anna", name: "Dr. Anna Pichler", role: "Arbeitsmedizinerin" },
];

const ALL = USERS.map((u) => u.id);
const others = (exclude: string[], n: number) =>
  ALL.filter((id) => !exclude.includes(id)).slice(0, n);

const h = (hours: number) => new Date(Date.now() - hours * 3600 * 1000);

type Intent = "SEEK" | "GIVE" | "PAUSE";
type Status = "OPEN" | "SOLVED";

const POSTS: {
  id: string;
  intent: Intent;
  status?: Status;
  isPseudonym?: boolean;
  authorId: string;
  text: string;
  hoursAgo: number;
}[] = [
  {
    id: "p01",
    intent: "SEEK",
    status: "SOLVED",
    authorId: "u-mira",
    hoursAgo: 52,
    text: "G37-Untersuchung: Ein Mitarbeiter braucht für die Bildschirmarbeit eine Gleitsichtbrille. Muss der Arbeitgeber die spezielle Bildschirmbrille zahlen — und wie grenze ich das sauber von der privaten Sehhilfe ab?",
  },
  {
    id: "p02",
    intent: "SEEK",
    isPseudonym: true,
    authorId: "u-jonas",
    hoursAgo: 46,
    text: "Mitarbeiter mit gut eingestellter Epilepsie (seit 3 Jahren anfallsfrei) soll künftig auf Leitern und Gerüsten mit Absturzgefahr eingesetzt werden. Wie beurteilt ihr die Eignung?",
  },
  {
    id: "p03",
    intent: "GIVE",
    authorId: "u-amelie",
    hoursAgo: 40,
    text: "Tipp Feuchtarbeit: Wir haben den Hautschutzplan (Schutz – Reinigung – Pflege) als kompakten Aushang direkt an die Waschplätze gehängt, statt ihn in der Mappe zu vergraben. Die Compliance ist spürbar gestiegen.",
  },
  {
    id: "p04",
    intent: "SEEK",
    authorId: "u-amelie",
    hoursAgo: 34,
    text: "Lärmbereich: Brillenträger klagen über undichten Kapselgehörschutz. Lohnen sich Otoplastiken für die ganze Abteilung, oder reicht eine Nachschulung zum richtigen Sitz?",
  },
  {
    id: "p05",
    intent: "GIVE",
    authorId: "u-mira",
    hoursAgo: 30,
    text: "Hepatitis-B-Impfung: Bei Non-Respondern nach der 2. Impfserie kläre ich zuerst Anti-HBc ab (stille Infektion ausschließen!), bevor ich mit doppelter Dosis weitermache. Dieser Check wird erstaunlich oft übersprungen.",
  },
  {
    id: "p06",
    intent: "PAUSE",
    authorId: "u-jonas",
    hoursAgo: 27,
    text: "Kurze Umfrage in die Runde: Welcher G-Grundsatz löst bei euch das spontanste Augenrollen aus? Ich fang an: G41. 🙃",
  },
  {
    id: "p07",
    intent: "SEEK",
    status: "SOLVED",
    authorId: "u-mira",
    hoursAgo: 24,
    text: "Schwangere Mitarbeiterin im Nachtdienst (Pflege): generelles Beschäftigungsverbot oder individuelle Gefährdungsbeurteilung? Wie haltet ihr es mit der Nachtarbeit?",
  },
  {
    id: "p08",
    intent: "GIVE",
    authorId: "u-jonas",
    hoursAgo: 21,
    text: "Homeoffice-Ergonomie: Unsere 1-Seiten-Checkliste (Stuhlhöhe, Bildschirmoberkante in Augenhöhe, externe Tastatur, Mikropausen) schicke ich jetzt vor jeder telefonischen Beratung vorab raus. Spart in der Beratung viel Zeit.",
  },
  {
    id: "p09",
    intent: "SEEK",
    isPseudonym: true,
    authorId: "u-amelie",
    hoursAgo: 18,
    text: "Verdacht auf BK 2108 (bandscheibenbedingte LWS-Erkrankung) bei langjährigem Lagerarbeiter. Wie dokumentiert ihr die berufliche Belastung sauber für die Meldung?",
  },
  {
    id: "p10",
    intent: "PAUSE",
    authorId: "u-amelie",
    hoursAgo: 14,
    text: "Vorschlag fürs nächste Teammeeting: eine Wartezimmer-Playlist, die nicht nach Fahrstuhl klingt. Wünsche werden entgegengenommen. 🎶",
  },
  {
    id: "p11",
    intent: "SEEK",
    authorId: "u-jonas",
    hoursAgo: 11,
    text: "Drogenscreening bei sicherheitsrelevanter Tätigkeit: Wo sind die rechtlichen Grenzen, und wie holt ihr die Einwilligung rechtssicher ein?",
  },
  {
    id: "p12",
    intent: "GIVE",
    authorId: "u-mira",
    hoursAgo: 8,
    text: "Wiedereingliederung: Beim Stufenplan schreibe ich immer konkrete Stunden und feste Zwischentermine rein. Vage Pläne ('langsam steigern') scheitern fast immer an der Umsetzung.",
  },
  {
    id: "p13",
    intent: "SEEK",
    status: "SOLVED",
    authorId: "u-amelie",
    hoursAgo: 6,
    text: "Entsendung nach Westafrika für 3 Monate: Welche Tropentauglichkeits-Checks und welche Malariaprophylaxe sind bei euch Standard?",
  },
  {
    id: "p14",
    intent: "PAUSE",
    authorId: "u-jonas",
    hoursAgo: 4,
    text: "Mein Lieblingssatz der Woche, frei aus der Personalabteilung: „Können Sie den kurz mal eben durchchecken?“ — kurz. mal. eben. 😄",
  },
  {
    id: "p15",
    intent: "GIVE",
    authorId: "u-amelie",
    hoursAgo: 2,
    text: "Erste Hilfe im Betrieb: Wir frischen die AED-/Reanimations-Schulung jetzt jährlich statt alle zwei Jahre auf. Die Sicherheit der Ersthelfer:innen im Ernstfall ist merklich besser.",
  },
];

const ANSWERS: {
  id: string;
  postId: string;
  authorId: string;
  text: string;
  hoursAgo: number;
}[] = [
  {
    id: "a01",
    postId: "p01",
    authorId: "u-jonas",
    hoursAgo: 50,
    text: "Der AG trägt die Kosten nur für die spezielle Sehhilfe für den Bildschirmabstand, wenn die normale Brille nachweislich nicht ausreicht. Reine Gleitsichtbrillen für den Alltag bleiben privat. Ich verordne dann eine Arbeitsplatzbrille mit fixer Intermediär-Korrektur.",
  },
  {
    id: "a02",
    postId: "p01",
    authorId: "u-amelie",
    hoursAgo: 49,
    text: "Wichtig: die Notwendigkeit über Sehtest + tatsächlichen Arbeitsplatzabstand dokumentieren und im Befund festhalten — sonst gibt es regelmäßig Diskussionen mit der Buchhaltung.",
  },
  {
    id: "a03",
    postId: "p02",
    authorId: "u-mira",
    hoursAgo: 44,
    text: "Anfallsfreiheit allein reicht mir nicht. Ich hole den aktuellen neurologischen Befund und die Medikation ein und orientiere mich an den Begutachtungsleitlinien. Bei echter Absturzgefahr bin ich sehr zurückhaltend.",
  },
  {
    id: "a04",
    postId: "p02",
    authorId: "u-lena",
    hoursAgo: 43,
    text: "Individuelle Gefährdungsbeurteilung, und wenn möglich eine gleichwertige Tätigkeit ohne Absturzgefahr anbieten. Fürsorgepflicht vor Mitarbeiterwunsch.",
  },
  {
    id: "a05",
    postId: "p04",
    authorId: "u-paul",
    hoursAgo: 32,
    text: "Otoplastiken zahlen sich bei Dauerträgern aus: Tragekomfort und damit die Tragequote steigen deutlich. Höhere Einmalkosten, aber langfristig weniger Lärmschwerhörigkeit.",
  },
  {
    id: "a06",
    postId: "p07",
    authorId: "u-sofia",
    hoursAgo: 23,
    text: "Individuelle GBU nach MuSchG — Nachtarbeit ist nicht automatisch verboten, aber zwischen 22 und 6 Uhr braucht es Bewilligung und die Zustimmung der Mitarbeiterin. In der Praxis ist die Umsetzung in den Tagdienst meist der pragmatische Weg.",
  },
  {
    id: "a07",
    postId: "p07",
    authorId: "u-david",
    hoursAgo: 22,
    text: "Wir bieten fast immer den Tagdienst an — das erspart die Bewilligungsschleife und ist für alle Beteiligten entspannter.",
  },
  {
    id: "a08",
    postId: "p09",
    authorId: "u-clara",
    hoursAgo: 17,
    text: "Ich erfasse die Hebe- und Tragebelastung möglichst quantitativ (Mainz-Dortmunder Dosismodell, Jahre, Lasten) und melde bei begründetem Verdacht. Die eigentliche Kausalitätsprüfung macht ohnehin der Unfallversicherungsträger.",
  },
  {
    id: "a09",
    postId: "p11",
    authorId: "u-noah",
    hoursAgo: 10,
    text: "Nur mit informierter, freiwilliger Einwilligung und klarer Zweckbindung. Anlassbezogen ist sauberer als verdachtsunabhängig — eine Betriebsvereinbarung als Grundlage hilft enorm.",
  },
  {
    id: "a10",
    postId: "p13",
    authorId: "u-emma",
    hoursAgo: 5,
    text: "Tauglichkeit inkl. Belastungs-EKG ab Risikofaktoren, Impfstatus prüfen (Gelbfieber ist für viele Länder Pflicht!), und Atovaquon/Proguanil als Prophylaxe bzw. Standby je nach Region. Reisemedizinische Beratung unbedingt dokumentieren.",
  },
];

// Zustimmungen („würde ich genauso machen") — als Bänder sichtbar.
const ENDORSE: ({ users: string[] } & (
  | { answerId: string }
  | { postId: string }
))[] = [
  { answerId: "a01", users: others(["u-jonas"], 11) }, // → „Viele"
  { answerId: "a02", users: others(["u-amelie"], 4) }, // → „Einige"
  { answerId: "a03", users: others(["u-mira"], 7) }, // → „Einige"
  { answerId: "a04", users: others(["u-lena"], 2) }, // → „Einzelne"
  { answerId: "a05", users: others(["u-paul"], 5) },
  { answerId: "a06", users: others(["u-sofia"], 9) }, // → „Einige" (oberes Ende)
  { answerId: "a07", users: others(["u-david"], 3) },
  { answerId: "a08", users: others(["u-clara"], 4) },
  { answerId: "a09", users: others(["u-noah"], 6) },
  { answerId: "a10", users: others(["u-emma"], 8) },
  { postId: "p05", users: others(["u-mira"], 11) }, // Info → „Viele"
  { postId: "p03", users: others(["u-amelie"], 7) },
  { postId: "p08", users: others(["u-jonas"], 5) },
  { postId: "p12", users: others(["u-mira"], 3) },
  { postId: "p15", users: others(["u-amelie"], 6) },
];

// „haben geschmunzelt" (Pause) — Gesichter, keine Zahl.
const PAUSE_REACTIONS: { postId: string; users: string[] }[] = [
  { postId: "p06", users: others(["u-jonas"], 7) },
  { postId: "p10", users: others(["u-amelie"], 5) },
  { postId: "p14", users: others(["u-jonas"], 6) },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL ist nicht gesetzt.");

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const u of USERS) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { name: u.name, role: u.role, approved: true },
        create: { ...u, approved: true },
      });
    }

    for (const p of POSTS) {
      const data = {
        intent: p.intent,
        status: p.status ?? "OPEN",
        isPseudonym: p.isPseudonym ?? false,
        text: p.text,
        authorId: p.authorId,
        createdAt: h(p.hoursAgo),
      };
      await prisma.post.upsert({
        where: { id: p.id },
        update: data,
        create: { id: p.id, ...data },
      });
    }

    for (const a of ANSWERS) {
      const data = {
        text: a.text,
        postId: a.postId,
        authorId: a.authorId,
        createdAt: h(a.hoursAgo),
      };
      await prisma.answer.upsert({
        where: { id: a.id },
        update: data,
        create: { id: a.id, ...data },
      });
    }

    const endorseRows = ENDORSE.flatMap((e) =>
      e.users.map((userId) =>
        "answerId" in e
          ? { userId, answerId: e.answerId }
          : { userId, postId: e.postId },
      ),
    );
    await prisma.endorsement.createMany({
      data: endorseRows,
      skipDuplicates: true,
    });

    const pauseRows = PAUSE_REACTIONS.flatMap((r) =>
      r.users.map((userId) => ({ userId, postId: r.postId })),
    );
    await prisma.pauseReaction.createMany({
      data: pauseRows,
      skipDuplicates: true,
    });

    console.log(
      `Seed fertig: ${USERS.length} Nutzer:innen, ${POSTS.length} Beiträge, ${ANSWERS.length} Antworten, ${endorseRows.length} Zustimmungen, ${pauseRows.length} Pause-Reaktionen.`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
