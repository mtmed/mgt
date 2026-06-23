import Link from "next/link";

// Landing vor der Anmeldung: unscharfes App-Video als Hintergrund (Kontext ohne
// Ablenkung), darüber Creme-Schleier für Lesbarkeit; Logo, Vision, Anmelden/
// Registrieren auf einer dezent milchglasigen Karte.
// Datensparsam: klein-optimiertes /public/landing-bg.mp4 (~1 MB). Bei
// `prefers-reduced-motion` ersetzt das vorab unscharfe Poster das Video (CSS).
export function Landing() {
  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 py-12 text-center">
      {/* Hintergrund-Ebene */}
      <div
        aria-hidden
        className="landing-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <video
          className="landing-bg-video h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/landing-bg-poster.jpg"
        >
          <source src="/landing-bg.mp4" type="video/mp4" />
        </video>
        <div className="landing-scrim absolute inset-0" />
      </div>

      {/* Inhalt */}
      <div className="anim-in w-full max-w-md rounded-[28px] border border-white/50 bg-kreme/70 p-7 shadow-sm backdrop-blur-md sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.png"
          alt="bada bup"
          width={92}
          height={92}
          className="mx-auto rounded-[22px] shadow-sm"
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
            className="rounded-md border border-border-soft bg-white/60 px-4 py-2.5 text-sm font-semibold text-kobalt transition hover:border-kobalt/40"
          >
            Zugang anfragen
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted">
          <Link href="/datenschutz" className="hover:text-ink">
            Datenschutz
          </Link>
          <Link href="/impressum" className="hover:text-ink">
            Impressum
          </Link>
          <Link href="/entwicklung" className="hover:text-ink">
            Entwicklung
          </Link>
        </div>
      </div>
    </div>
  );
}
