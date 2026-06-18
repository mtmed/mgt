import Link from "next/link";

// Landing vor der Anmeldung: nur Logo, Vision, Anmelden/Registrieren.
export function Landing() {
  return (
    <div className="anim-in mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="bada bup"
        width={92}
        height={92}
        className="rounded-[22px]"
      />
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">bada bup</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        bada bup stellt Menschen und ihr Können in den Mittelpunkt – frei von
        wirtschaftlichen Interessen. Die Plattform vernetzt Berufsgruppen, schafft
        gemeinsames Wissen und lässt Menschen in dem wachsen, was sie tun und
        lieben.
      </p>
      <div className="mt-7 flex w-full flex-col gap-2">
        <Link
          href="/anmelden"
          className="rounded-md bg-kobalt px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Anmelden
        </Link>
        <Link
          href="/registrieren"
          className="rounded-md border border-border-soft px-4 py-2.5 text-sm font-semibold text-kobalt transition hover:border-kobalt/40"
        >
          Zugang anfragen
        </Link>
      </div>
    </div>
  );
}
