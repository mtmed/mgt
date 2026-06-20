import Link from "next/link";
import { signOut } from "@/auth";
import { getSessionUser } from "@/lib/users";
import { LoginForm } from "@/components/LoginForm";

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
        Für bestehende Mitglieder: E-Mail eingeben, du bekommst einen
        6-stelligen Code (kein Passwort nötig).
      </p>

      <LoginForm />

      <p className="mt-4 text-sm">
        Noch keinen Zugang?{" "}
        <Link href="/registrieren" className="font-medium text-kobalt hover:underline">
          Zugang anfragen →
        </Link>
      </p>
    </div>
  );
}
