import Link from "next/link";

export const metadata = { title: "Impressum · bada bup" };

export default function ImpressumPage() {
  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Impressum</h1>

      <p className="mt-3 rounded-md border border-diverg-bd bg-diverg-bg px-3 py-2 text-xs text-diverg-fg">
        Entwurf — Pflichtangaben nach § 5 ECG und § 25 MedienG. Vor dem Pilot
        rechtlich zu finalisieren; eckige Klammern sind Platzhalter.
      </p>

      <div className="mt-5 space-y-5 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold">Medieninhaber & Betreiber</h2>
          <p className="mt-1 text-muted">
            [Name / Rechtsform]
            <br />
            [Anschrift]
            <br />
            [PLZ Ort, Österreich]
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Kontakt</h2>
          <p className="mt-1 text-muted">
            E-Mail: [kontakt@…]
            <br />
            [ggf. Telefon]
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Unternehmensgegenstand</h2>
          <p className="mt-1 text-muted">
            Betrieb einer berufszentrierten Wissensplattform für
            Arbeitsmediziner:innen.
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Weitere Angaben</h2>
          <p className="mt-1 text-muted">
            [Firmenbuchnummer & -gericht, UID, Kammer-/Berufsangaben, soweit
            zutreffend.]
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Verantwortlich für den Datenschutz</h2>
          <p className="mt-1 text-muted">
            Siehe <Link href="/datenschutz" className="text-kobalt hover:underline">Datenschutz</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
