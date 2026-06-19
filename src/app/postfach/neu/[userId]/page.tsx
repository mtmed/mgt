import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { MessageComposer } from "@/components/MessageComposer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Neue Nachricht · bada bup" };

export default async function NewMessagePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");
  if (userId === me.id) redirect("/postfach");

  const recipient = await prisma.user.findUnique({ where: { id: userId } });
  if (!recipient || !recipient.approved || recipient.deleted) notFound();

  // Existiert schon ein Gespräch? Dann direkt dorthin.
  const [aId, bId] = me.id < userId ? [me.id, userId] : [userId, me.id];
  const existing = await prisma.conversation.findUnique({
    where: { userAId_userBId: { userAId: aId, userBId: bId } },
  });
  if (existing) redirect(`/postfach/${existing.id}`);

  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link
        href={`/mitglied/${recipient.id}`}
        className="text-sm text-kobalt hover:underline"
      >
        ← Zurück
      </Link>
      <h1 className="mt-2 text-xl font-semibold">
        Nachricht an {recipient.name}
      </h1>
      <p className="mt-1 mb-4 text-sm text-muted">
        Du schreibst als <span className="font-medium">{me.name}</span>.
      </p>

      <MessageComposer
        recipientId={recipient.id}
        placeholder={`Schreibe an ${recipient.name} …`}
        label="Senden"
      />
    </div>
  );
}
