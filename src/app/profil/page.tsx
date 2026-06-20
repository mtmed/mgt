import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users";
import { ProfileForm } from "@/components/ProfileForm";
import { DeleteAccountSection } from "@/components/DeleteAccountSection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profil · bada bup" };

export default async function ProfilPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");

  return (
    <div className="anim-in mx-auto max-w-sm">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zum Feed
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Profil</h1>
      <p className="mt-2 text-sm text-muted">
        Dein Username ist überall sichtbar — Antworten sind immer namentlich.
      </p>

      <ProfileForm currentName={me.name} />

      <div className="mt-6 space-y-1 text-sm text-muted">
        {me.email && <p>E-Mail: {me.email}</p>}
        <p>
          Status:{" "}
          {me.approved ? (
            <span className="text-kobalt">freigeschaltet</span>
          ) : (
            <span className="text-diverg-fg">wird geprüft</span>
          )}
        </p>
      </div>

      <DeleteAccountSection name={me.name} />
    </div>
  );
}
