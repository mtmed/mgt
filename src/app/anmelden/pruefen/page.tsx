import Link from "next/link";

export const metadata = { title: "E-Mail prüfen · bada bup" };

export default function PruefenPage() {
  return (
    <div className="anim-in mx-auto max-w-sm text-center">
      <h1 className="text-xl font-semibold">Prüfe deine E-Mails</h1>
      <p className="mt-2 text-sm text-muted">
        Wir haben dir einen Anmelde-Link geschickt. Öffne ihn auf diesem Gerät,
        um dich anzumelden.
      </p>
      <Link
        href="/"
        className="mt-4 inline-block text-sm text-kobalt hover:underline"
      >
        ← Zum Feed
      </Link>
    </div>
  );
}
