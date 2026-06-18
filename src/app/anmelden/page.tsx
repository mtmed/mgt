import Link from "next/link";
import { signIn, signOut } from "@/auth";
import { getSessionUser } from "@/lib/users";

export const dynamic = "force-dynamic";
export const metadata = { title: "Anmelden · bada bup" };

export default async function AnmeldenPage() {
  const me = await getSessionUser();

  if (me) {
    return (
      <div className="anim-in mx-auto max-w-sm">
        <h1 className="text-xl font-semibold">Angemeldet</h1>
        <p className="mt-2 text-sm">
          Du bist als <span className="font-medium">{me.name}</span> ({me.email})
          angemeldet.
        </p>
        {!me.approved && (
          <p className="mt-3 rounded-md border border-diverg-bd bg-diverg-bg px-3 py-2 text-sm text-diverg-fg">
            Dein Zugang wird gerade von einem Menschen geprüft. Du kannst schon
            mitlesen — Beiträge und Antworten sind nach der Freigabe möglich.
          </p>
        )}
        <div className="mt-4 flex items-center gap-3">
          <Link href="/" className="text-sm text-kobalt hover:underline">
            ← Zum Feed
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-md border border-border-soft px-3 py-1.5 text-sm font-medium hover:border-kobalt/40"
            >
              Abmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="anim-in mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Anmelden</h1>
      <p className="mt-2 text-sm text-muted">
        Gib deine berufliche E-Mail-Adresse ein — du bekommst einen Anmelde-Link.
        Neue Zugänge werden manuell freigeschaltet.
      </p>

      <form
        action={async (formData: FormData) => {
          "use server";
          await signIn("resend", {
            email: String(formData.get("email") ?? ""),
            redirectTo: "/",
          });
        }}
        className="mt-4 space-y-3"
      >
        <input
          type="email"
          name="email"
          required
          placeholder="name@beispiel.at"
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
        <button
          type="submit"
          className="w-full rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Anmelde-Link senden
        </button>
      </form>

      <p className="mt-4 text-xs text-muted">
        Antworten sind immer namentlich. Fragen dürfen pseudonym sein.
      </p>
    </div>
  );
}
