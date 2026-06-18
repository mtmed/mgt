import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FeedTabs } from "@/components/FeedTabs";
import { KorpusFilters } from "@/components/KorpusFilters";
import { PostCard, type FeedPost } from "@/components/PostCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Korpus · bada bup" };

export default async function KorpusPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string; status?: string }>;
}) {
  const { tag, q: rawQ, status } = await searchParams;
  const q = rawQ?.trim() || undefined;
  const solvedOnly = status === "geloest";

  // Korpus = gelöste Fälle (SEEK/SOLVED) + geteiltes Wissen (GIVE).
  // „nur gelöste Fälle" schränkt auf SEEK/SOLVED ein.
  const base: Prisma.PostWhereInput = solvedOnly
    ? { intent: "SEEK", status: "SOLVED" }
    : { OR: [{ intent: "SEEK", status: "SOLVED" }, { intent: "GIVE" }] };

  const and: Prisma.PostWhereInput[] = [base];
  if (tag) and.push({ tags: { some: { tag: { slug: tag } } } });
  if (q) {
    and.push({
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { text: { contains: q, mode: "insensitive" } },
      ],
    });
  }

  const [posts, tags] = await Promise.all([
    prisma.post.findMany({
      where: { AND: and },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { answers: true, endorsements: true } },
        pauseReactions: {
          include: { user: { select: { id: true, name: true } } },
        },
        sources: { select: { relation: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
        attachments: { select: { url: true }, take: 1, orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.tag.findMany({
      where: { approved: true },
      orderBy: [{ category: "asc" }, { label: "asc" }],
      select: { slug: true, label: true },
    }),
  ]);

  const feed: FeedPost[] = posts.map((p) => ({
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
  }));

  const countLabel = q
    ? `${feed.length} ${feed.length === 1 ? "Treffer" : "Treffer"} für „${q}"`
    : `${feed.length} ${feed.length === 1 ? "Eintrag" : "Einträge"} im Korpus`;

  return (
    <div className="anim-in">
      <FeedTabs active="korpus" />
      <KorpusFilters tags={tags} q={q} tag={tag} solvedOnly={solvedOnly} />

      <p className="mt-4 text-sm text-muted">{countLabel}</p>

      <ul className="mt-3 space-y-3">
        {feed.length === 0 ? (
          <li className="rounded-[12px] border border-dashed border-border-soft bg-white/60 p-8 text-center text-sm text-muted">
            Nichts gefunden. Andere Suche oder Filter probieren.
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
