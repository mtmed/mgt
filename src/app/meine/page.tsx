import Link from "next/link";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { PostCard, type FeedPost } from "@/components/PostCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Meine · bada bup" };

const postInclude = {
  author: { select: { id: true, name: true } },
  _count: { select: { answers: true, endorsements: true } },
  pauseReactions: { include: { user: { select: { id: true, name: true } } } },
  sources: { select: { relation: true } },
  tags: { include: { tag: { select: { slug: true, label: true } } } },
  attachments: { select: { url: true }, take: 1, orderBy: { createdAt: "asc" } },
} satisfies Prisma.PostInclude;

type PostWithRelations = Prisma.PostGetPayload<{ include: typeof postInclude }>;

function toFeedPost(p: PostWithRelations): FeedPost {
  return {
    id: p.id,
    intent: p.intent,
    status: p.status,
    isPseudonym: p.isPseudonym,
    title: p.title,
    imageUrl: p.attachments[0]?.url ?? null,
    text: p.text,
    author: p.author,
    tags: p.tags.map((pt) => pt.tag),
    answerCount: p._count.answers,
    endorsementCount: p._count.endorsements,
    pauseFaces: p.pauseReactions.map((r) => r.user),
    hasSource: p.sources.length > 0,
    diverges: p.sources.some((s) => s.relation === "DIVERGES"),
  };
}

export default async function MeinePage({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show } = await searchParams;
  const saved = show === "saved";
  const me = await getCurrentUser();
  if (!me) redirect("/anmelden");

  let posts: PostWithRelations[];
  if (saved) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: me.id },
      orderBy: { createdAt: "desc" },
      include: { post: { include: postInclude } },
    });
    posts = bookmarks.map((b) => b.post);
  } else {
    posts = await prisma.post.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: "desc" },
      include: postInclude,
    });
  }

  const feed = posts.map(toFeedPost);

  const chip = (on: boolean) =>
    `rounded-full px-3 py-1 text-sm font-semibold transition ${
      on
        ? "bg-kobalt text-white"
        : "border border-border-soft text-ink hover:border-kobalt/40"
    }`;

  return (
    <div className="anim-in">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück zum Feed
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Meine Ansicht</h1>
      <p className="text-sm text-muted">{me.name}</p>

      <div className="mt-4 flex gap-1.5">
        <Link href="/meine" className={chip(!saved)}>
          Meine Beiträge
        </Link>
        <Link href="/meine?show=saved" className={chip(saved)}>
          Gespeichert
        </Link>
      </div>

      <ul className="mt-4 space-y-3">
        {feed.length === 0 ? (
          <li className="rounded-[12px] border border-dashed border-border-soft bg-white/60 p-8 text-center text-sm text-muted">
            {saved
              ? "Noch nichts gespeichert. Auf einem Beitrag „speichern“ tippen."
              : "Du hast noch nichts eingebracht."}
          </li>
        ) : (
          feed.map((post) => (
            <li key={post.id} className="feed-item">
              <PostCard post={post} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
