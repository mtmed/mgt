import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { blockUser, unblockUser } from "@/lib/message-actions";
import { Avatar } from "@/components/Avatar";
import { typeLabel } from "@/lib/post";

export const dynamic = "force-dynamic";

export default async function MitgliedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");

  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, role: true, approved: true, deleted: true },
  });
  if (!user || user.deleted) notFound();

  const isSelf = user.id === me.id;

  const [posts, iBlocked] = await Promise.all([
    prisma.post.findMany({
      where: {
        authorId: user.id,
        isPseudonym: false,
        hidden: false,
        intent: { in: ["SEEK", "GIVE"] },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, intent: true, title: true, text: true, status: true },
    }),
    isSelf
      ? Promise.resolve(null)
      : prisma.block.findUnique({
          where: {
            blockerId_blockedId: { blockerId: me.id, blockedId: user.id },
          },
        }),
  ]);

  return (
    <div className="anim-in mx-auto max-w-2xl">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zum Feed
      </Link>

      <div className="mt-3 flex items-center gap-3">
        <Avatar id={user.id} name={user.name} size={48} />
        <div>
          <h1 className="text-xl font-semibold">{user.name}</h1>
          <p className="text-sm text-muted">{user.role}</p>
        </div>
      </div>

      {!user.approved && (
        <p className="mt-3 rounded-md border border-diverg-bd bg-diverg-bg px-3 py-2 text-xs text-diverg-fg">
          Dieser Zugang ist noch nicht freigeschaltet.
        </p>
      )}

      {/* Aktionen */}
      {isSelf ? (
        <p className="mt-4 text-sm text-muted">
          Das ist dein öffentliches Profil.{" "}
          <Link href="/profil" className="text-kobalt hover:underline">
            Profil bearbeiten
          </Link>
        </p>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          {user.approved && !iBlocked && (
            <Link
              href={`/postfach/neu/${user.id}`}
              className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Nachricht schreiben
            </Link>
          )}
          {iBlocked ? (
            <form action={unblockUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button className="rounded-md border border-border-soft px-3 py-2 text-sm text-muted hover:text-ink">
                Blockierung aufheben
              </button>
            </form>
          ) : (
            <form action={blockUser}>
              <input type="hidden" name="userId" value={user.id} />
              <button className="rounded-md border border-border-soft px-3 py-2 text-sm text-muted hover:text-ink">
                Blockieren
              </button>
            </form>
          )}
        </div>
      )}

      {iBlocked && (
        <p className="mt-2 text-xs text-muted">
          Du hast diese Person blockiert — sie kann dir nicht schreiben.
        </p>
      )}

      {/* Beiträge */}
      <h2 className="mt-8 mb-2 text-lg font-semibold">Beiträge</h2>
      {posts.length === 0 ? (
        <p className="text-sm text-muted">Noch keine öffentlichen Beiträge.</p>
      ) : (
        <ul className="space-y-2">
          {posts.map((p) => (
            <li key={p.id}>
              <Link
                href={`/posts/${p.id}`}
                className="block rounded-[12px] border border-border-soft bg-white p-3 hover:shadow-sm"
              >
                <span className="flex items-center gap-2">
                  <span className="rounded-[6px] bg-chip-neutral-bg px-2 py-0.5 text-xs font-medium text-chip-neutral-fg">
                    {typeLabel(p.intent)}
                  </span>
                  {p.status === "SOLVED" && (
                    <span className="rounded-full bg-gelb px-2 py-0.5 text-xs font-semibold text-ink">
                      ✓ gelöst
                    </span>
                  )}
                </span>
                <span className="mt-1 block truncate text-sm font-medium">
                  {p.title ?? p.text.slice(0, 80)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
