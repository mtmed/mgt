import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FeedTabs } from "@/components/FeedTabs";
import { TagFilterBar } from "@/components/TagFilterBar";
import { PostCard, type FeedPost } from "@/components/PostCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Korpus · bada bup" };

export default async function KorpusPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;

  // Korpus = gelöste Fälle (SEEK/SOLVED) + geteiltes Wissen (GIVE).
  const where: Prisma.PostWhereInput = {
    OR: [{ intent: "SEEK", status: "SOLVED" }, { intent: "GIVE" }],
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
  };

  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { answers: true, endorsements: true } },
        pauseReactions: {
          include: { user: { select: { id: true, name: true } } },
        },
        sources: { select: { relation: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
      },
    }),
    prisma.tag.findMany({
      where: { approved: true },
      orderBy: [{ category: "asc" }, { label: "asc" }],
      select: { slug: true, label: true },
    }),
  ]);

  const activeLabel = tags.find((t) => t.slug === tag)?.label;

  const feed: FeedPost[] = posts.map((p) => ({
    id: p.id,
    intent: p.intent,
    status: p.status,
    isPseudonym: p.isPseudonym,
    title: p.title,
    text: p.text,
    author: p.author,
    tags: p.tags.map((pt) => pt.tag),
    answerCount: p._count.answers,
    endorsementCount: p._count.endorsements,
    pauseFaces: p.pauseReactions.map((r) => r.user),
    hasSource: p.sources.length > 0,
    diverges: p.sources.some((s) => s.relation === "DIVERGES"),
  }));

  return (
    <div className="anim-in">
      <FeedTabs active="korpus" />
      <TagFilterBar tags={tags} active={tag} />

      <p className="mt-4 text-sm text-muted">
        {activeLabel ? (
          <>
            {feed.length}{" "}
            {feed.length === 1 ? "Eintrag" : "Einträge"} zu „{activeLabel}"
          </>
        ) : (
          <>{feed.length} Einträge im Korpus</>
        )}
      </p>

      <ul className="mt-3 space-y-3">
        {feed.length === 0 ? (
          <li className="rounded-[12px] border border-dashed border-border-soft bg-white/60 p-8 text-center text-sm text-muted">
            Noch nichts im Korpus{activeLabel ? ` zu „${activeLabel}"` : ""}.
          </li>
        ) : (
          feed.map((post) => (
            <li key={post.id}>
              <PostCard post={post} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
