import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { MessageComposer } from "@/components/MessageComposer";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gespräch · bada bup" };

const df = new Intl.DateTimeFormat("de-AT", {
  dateStyle: "short",
  timeStyle: "short",
});

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");

  const convo = await prisma.conversation.findUnique({
    where: { id },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!convo || (convo.userAId !== me.id && convo.userBId !== me.id))
    notFound();

  const other = convo.userAId === me.id ? convo.userB : convo.userA;

  // Eingehende ungelesene Nachrichten als gelesen markieren.
  await prisma.message.updateMany({
    where: { conversationId: convo.id, senderId: { not: me.id }, readAt: null },
    data: { readAt: new Date() },
  });

  const iBlocked = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: me.id, blockedId: other.id } },
  });

  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link href="/postfach" className="text-sm text-kobalt hover:underline">
        ← Postfach
      </Link>
      <h1 className="mt-2 text-xl font-semibold">
        <Link href={`/mitglied/${other.id}`} className="hover:underline">
          {other.name}
        </Link>
      </h1>

      <ul className="mt-5 space-y-2">
        {convo.messages.map((m) => {
          const mine = m.senderId === me.id;
          return (
            <li
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <span
                className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  mine
                    ? "rounded-br-sm bg-kobalt text-white"
                    : "rounded-bl-sm border border-border-soft bg-white"
                }`}
              >
                <span className="block whitespace-pre-wrap">{m.body}</span>
                <span
                  className={`mt-1 block text-[10px] ${
                    mine ? "text-white/70" : "text-muted"
                  }`}
                >
                  {df.format(m.createdAt)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5">
        {iBlocked ? (
          <p className="rounded-md border border-border-soft bg-white p-3 text-sm text-muted">
            Du hast diese Person blockiert.{" "}
            <Link
              href={`/mitglied/${other.id}`}
              className="text-kobalt hover:underline"
            >
              Blockierung aufheben
            </Link>
          </p>
        ) : (
          <MessageComposer recipientId={other.id} label="Senden" />
        )}
      </div>
    </div>
  );
}
