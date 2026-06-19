import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { Avatar } from "@/components/Avatar";

export const dynamic = "force-dynamic";
export const metadata = { title: "Postfach · bada bup" };

export default async function PostfachPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");

  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    orderBy: { updatedAt: "desc" },
    include: {
      userA: { select: { id: true, name: true } },
      userB: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { senderId: { not: me.id }, readAt: null } },
        },
      },
    },
  });

  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zum Feed
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Postfach</h1>
      <p className="mt-1 text-sm text-muted">
        Direkte Nachrichten mit Kolleg:innen.
      </p>

      {conversations.length === 0 ? (
        <p className="mt-5 rounded-[12px] border border-dashed border-border-soft bg-white/60 p-8 text-center text-sm text-muted">
          Noch keine Nachrichten. Du kannst über das Profil einer Person ein
          Gespräch beginnen.
        </p>
      ) : (
        <ul className="mt-5 space-y-2">
          {conversations.map((c) => {
            const other = c.userAId === me.id ? c.userB : c.userA;
            const last = c.messages[0];
            const unread = c._count.messages;
            return (
              <li key={c.id}>
                <Link
                  href={`/postfach/${c.id}`}
                  className="flex items-center gap-3 rounded-[12px] border border-border-soft bg-white p-3 hover:shadow-sm"
                >
                  <Avatar id={other.id} name={other.name} size={36} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {other.name}
                      </span>
                      {unread > 0 && (
                        <span className="shrink-0 rounded-full bg-kobalt px-1.5 text-[11px] font-semibold text-white">
                          {unread}
                        </span>
                      )}
                    </span>
                    {last && (
                      <span className="mt-0.5 block truncate text-xs text-muted">
                        {last.senderId === me.id ? "Du: " : ""}
                        {last.body}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
