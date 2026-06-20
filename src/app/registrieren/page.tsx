import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/users";
import { RegisterForm } from "@/components/RegisterForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Zugang anfragen · bada bup" };

export default async function RegistrierenPage() {
  if (await getSessionUser()) redirect("/");

  return (
    <div className="anim-in mx-auto max-w-sm">
      <h1 className="text-xl font-semibold">Zugang anfragen</h1>
      <p className="mt-2 text-sm text-muted">
        Neu hier? Username und berufliche E-Mail eingeben — du bekommst einen
        Bestätigungs-Code. Dein Zugang wird danach manuell freigeschaltet.
      </p>

      <RegisterForm />

      <p className="mt-4 text-sm">
        Schon Mitglied?{" "}
        <Link href="/anmelden" className="font-medium text-kobalt hover:underline">
          Anmelden →
        </Link>
      </p>
      <p className="mt-3 text-xs text-muted">
        Dein Username ist sichtbar — Antworten sind immer namentlich. Fragen
        dürfen pseudonym sein.
      </p>
    </div>
  );
}
