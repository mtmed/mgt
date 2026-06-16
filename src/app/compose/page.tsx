import Link from "next/link";
import { ComposeForm } from "@/components/ComposeForm";

export const metadata = { title: "Beitrag erstellen · bada bup" };

type Intent = "SEEK" | "GIVE" | "PAUSE";

export default async function ComposePage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const initial: Intent =
    intent === "GIVE" || intent === "PAUSE" ? intent : "SEEK";

  return (
    <div className="anim-in">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück zum Feed
      </Link>
      <h1 className="mt-2 mb-4 text-xl font-semibold">Beitrag erstellen</h1>
      <div className="rounded-[12px] border border-border-soft bg-white p-5">
        <ComposeForm initialIntent={initial} />
      </div>
    </div>
  );
}
