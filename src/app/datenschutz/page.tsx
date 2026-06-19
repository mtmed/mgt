import Link from "next/link";

export const metadata = { title: "Datenschutz · bada bup" };

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-semibold">{title}</h2>
      <div className="mt-1 space-y-2 text-muted">{children}</div>
    </section>
  );
}

export default function DatenschutzPage() {
  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Datenschutz</h1>

      <p className="mt-3 rounded-md border border-diverg-bd bg-diverg-bg px-3 py-2 text-xs text-diverg-fg">
        Entwurf. Diese Erklärung beschreibt den geplanten Umgang mit Daten und ist
        vor dem Pilot rechtlich (DSB / Anwält:in) zu finalisieren — insbesondere
        die Rechtsgrundlage für Gesundheitsdaten (Art. 9 DSGVO) und die
        Datenschutz-Folgenabschätzung (DSFA).
      </p>

      <div className="mt-5 space-y-5 text-sm leading-relaxed">
        <Section title="Verantwortlicher">
          <p>
            [Name / Rechtsform, Anschrift, E-Mail] — siehe{" "}
            <Link href="/impressum" className="text-kobalt hover:underline">
              Impressum
            </Link>
            .
          </p>
        </Section>

        <Section title="Grundsatz: Datensparsamkeit & geschützte Identität">
          <p>
            bada bup ist auf Datensparsamkeit ausgelegt. Mitglieder sind
            verifiziert; Antworten erscheinen immer namentlich, Fragen können
            pseudonym gestellt werden. Es gibt keine Werbung, kein Tracking zu
            Werbezwecken und keine Verhaltensprofile einzelner Personen.
          </p>
        </Section>

        <Section title="Welche Daten wir verarbeiten">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <b className="font-semibold text-ink">Kontodaten:</b> Name,
              E-Mail-Adresse, Rolle, Freischalt-Status.
            </li>
            <li>
              <b className="font-semibold text-ink">Inhalte:</b> Beiträge,
              Antworten, Quellen, Themen, Anerkennungen, Pause-Reaktionen,
              optionale Bild-Anhänge.
            </li>
            <li>
              <b className="font-semibold text-ink">Anmeldung:</b> einmalige
              Codes (Magic-Code) zur Authentifizierung.
            </li>
            <li>
              <b className="font-semibold text-ink">Technisch notwendige
              Cookies:</b> Sitzung und Grundeinstellungen — keine Marketing-/
              Tracking-Cookies.
            </li>
          </ul>
        </Section>

        <Section title="Gesundheitsbezug (Art. 9 DSGVO) & Anonymisierung">
          <p>
            Fälle sollen keinen identifizierbaren Patient:innen- oder
            Betriebsbezug enthalten. Beim Verfassen läuft eine{" "}
            <b className="font-semibold text-ink">Anonymisierungs-Prüfung direkt
            am Gerät</b>{" "}
            — sie weist auf mögliche Identifikatoren hin, sendet und speichert
            dabei aber nichts. Bild-Anhänge sind auf nicht-personenbezogene
            Motive beschränkt; Standort-/Gerätedaten (EXIF) werden beim Hochladen
            entfernt.
          </p>
        </Section>

        <Section title="Zwecke & Rechtsgrundlage">
          <p>
            Verarbeitung zum Betrieb der Plattform und zum Aufbau des
            gemeinsamen Fachwissens. [Rechtsgrundlage: Art. 6 Abs. 1 DSGVO; für
            etwaige besondere Kategorien Art. 9 Abs. 2 DSGVO — final festzulegen,
            z. B. ausdrückliche Einwilligung.]
          </p>
        </Section>

        <Section title="Empfänger / Auftragsverarbeiter">
          <p>Wir setzen Dienstleister in der EU-Region ein:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hosting / Datenbank: Vercel, Neon (EU/Frankfurt).</li>
            <li>Bild-Speicher: Vercel Blob (EU-Region).</li>
            <li>E-Mail-Versand (Anmeldecodes): Resend.</li>
          </ul>
          <p>
            [Mit allen Auftragsverarbeitern bestehen Verträge nach Art. 28 DSGVO.
            Soweit Anbieter US-Bezug haben, erfolgt eine Bewertung des
            Drittlandtransfers (Standardvertragsklauseln / Transfer-Impact-
            Assessment); Hosting-Residenz wird vor dem Pilot final geprüft.]
          </p>
        </Section>

        <Section title="Speicherdauer">
          <p>
            [Daten werden nur so lange gespeichert, wie es für den genannten
            Zweck erforderlich ist; konkrete Aufbewahrungsfristen werden vor dem
            Pilot festgelegt.] Konten und eigene Beiträge können auf Wunsch
            gelöscht werden.
          </p>
        </Section>

        <Section title="Deine Rechte">
          <p>
            Du hast das Recht auf Auskunft, Berichtigung, Löschung,
            Einschränkung, Datenübertragbarkeit und Widerspruch. Zur Ausübung
            genügt eine Nachricht an [kontakt@…].
          </p>
          <p>
            Beschwerderecht bei der österreichischen Datenschutzbehörde
            (dsb.gv.at).
          </p>
        </Section>
      </div>
    </div>
  );
}
