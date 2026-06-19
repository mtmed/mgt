import Link from "next/link";

export const metadata = { title: "Entwicklung · bada bup" };

// Öffentliches Änderungsprotokoll (volle Transparenz). Neueste zuerst.
// Bei jeder spürbaren Änderung hier einen Eintrag ergänzen — in der Sprache
// der Mitglieder, nicht technisch.
const CHANGELOG: { date?: string; title: string; items: string[] }[] = [
  {
    date: "19. Juni 2026",
    title: "Schutz & Transparenz",
    items: [
      "Anonymisierungs-Hinweis beim Verfassen von Fällen: erkennt mögliche Identifikatoren (Name, Betrieb, Datum …) in Echtzeit — die Prüfung läuft nur auf deinem Gerät, es wird nichts gesendet oder gespeichert.",
      "Neue Transparenz-Seiten: Datenschutz, Impressum und dieses Änderungsprotokoll.",
      "Eigener Admin-Account für Moderation (statt Passwort) — im Feed als solcher sichtbar.",
      "Kopfzeile: Berufsangabe sichtbar, kollektive Leistung über den Reitern, „Abmelden“ ins Menü verschoben.",
      "Anmeldung: E-Mail-Adresse wird vom Browser zum Merken/Vorschlagen angeboten.",
    ],
  },
  {
    title: "Frühere Iterationen",
    items: [
      "Anmeldung per E-Mail-Code; installierbare App (PWA) für Handy und Desktop.",
      "Schnellere Bedienung: Reiter, Sortierung und Antworten reagieren sofort.",
      "„Frage“ und „Info“ als klare Beitragsarten; Themen-Vorschläge aus dem Text.",
      "„Unser Wissen“: durchsuchbarer Korpus aus gelösten Fällen und geteiltem Wissen.",
      "Bild-Anhänge für Arbeitsplatz-Situationen (Standortdaten werden entfernt).",
      "Kernschleife: Fall einbringen → namentlich antworten → „gelöst“ → Konsens-Bänder.",
    ],
  },
];

export default function EntwicklungPage() {
  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Entwicklung</h1>
      <p className="mt-2 text-sm text-muted">
        Was sich an bada bup verändert — offen dokumentiert. Neueste Änderungen
        zuerst.
      </p>

      <div className="mt-6 space-y-6">
        {CHANGELOG.map((entry, i) => (
          <section
            key={i}
            className="rounded-[12px] border border-border-soft bg-white p-4"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-sm font-semibold">{entry.title}</h2>
              {entry.date && (
                <span className="shrink-0 text-xs text-muted">{entry.date}</span>
              )}
            </div>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-ink/85">
              {entry.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-kobalt" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
