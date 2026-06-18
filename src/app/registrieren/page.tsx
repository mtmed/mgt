import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { signIn, PENDING_NAME_COOKIE } from "@/auth";
import { getSessionUser } from "@/lib/users";

export const dynamic = "force-dynamic";
export const metadata = { title: "Zugang anfragen · bada bup" };

export default async function RegistrierenPage() {
  if (await getSessionUser()) redirect("/");

  return (
    <div className="anim-in mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Zugang anfragen</h1>
      <p className="mt-2 text-sm text-muted">
        Neu hier? Name und berufliche E-Mail eingeben — du bekommst einen
        Bestätigungs-Link. Dein Zugang wird danach manuell freigeschaltet.
      </p>

      <form
        action={async (formData: FormData) => {
          "use server";
          const name = String(formData.get("name") ?? "").trim();
          const email = String(formData.get("email") ?? "");
          if (name) {
            (await cookies()).set(PENDING_NAME_COOKIE, name, {
              httpOnly: true,
              sameSite: "lax",
              path: "/",
              maxAge: 60 * 30,
            });
          }
          await signIn("resend", { email, redirectTo: "/" });
        }}
        className="mt-4 space-y-3"
      >
        <input
          type="text"
          name="name"
          required
          placeholder="Dr. Vorname Nachname"
          className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
        />
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
          Zugang anfragen
        </button>
      </form>

      <p className="mt-4 text-sm">
        Schon Mitglied?{" "}
        <Link href="/anmelden" className="font-medium text-kobalt hover:underline">
          Anmelden →
        </Link>
      </p>
      <p className="mt-3 text-xs text-muted">
        Der Name ist sichtbar — Antworten sind immer namentlich. Fragen dürfen
        pseudonym sein.
      </p>
    </div>
  );
}
