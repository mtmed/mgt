import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users";
import { NachrichtForm } from "@/components/NachrichtForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nachricht an Admin · bada bup" };

export default async function NachrichtPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");

  return (
    <div className="anim-in mx-auto max-w-sm">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Nachricht an Admin</h1>
      <p className="mt-2 text-sm text-muted">
        Direkt an die Moderation — z. B. eine Frage, ein Hinweis oder ein
        Problem. Du schreibst als <span className="font-medium">{me.name}</span>.
      </p>

      <NachrichtForm />
    </div>
  );
}
