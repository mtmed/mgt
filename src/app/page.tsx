import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FeedTabs } from "@/components/FeedTabs";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { KorpusStats } from "@/components/KorpusStats";
import { Landing } from "@/components/Landing";
import { SortControl, type SortKey } from "@/components/SortControl";
import { isValidTab, type FeedTab } from "@/lib/post";
import { getLabels } from "@/lib/labels";
import { getCurrentUser } from "@/lib/users";

export const dynamic = "force-dynamic";

const TAB_BG: Record<FeedTab, string> = {
  tag: "bg-kreme",
  fach: "bg-bg-fach",
  pause: "bg-sand-warm",
  korpus: "bg-kreme",
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; sort?: string }>;
}) {
  // Nicht angemeldet → Landing (nur in Production ohne Session; im Dev greift
  // der Fallback-Nutzer, dann zeigt sich der Feed).
  const me = await getCurrentUser();
  if (!me) return <Landing />;

  const { tab: rawTab, sort: rawSort } = await searchParams;
  const tab: FeedTab = isValidTab(rawTab) ? rawTab : "tag";
  const sortKey: SortKey =
    rawSort === "neueste" || rawSort === "offen" ? rawSort : "relevanz";

  const where: Prisma.PostWhereInput =
    tab === "fach"
      ? { intent: { in: ["SEEK", "GIVE"] } }
      : tab === "pause"
        ? { intent: "PAUSE" }
        : {};

  const [posts, labels] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true } },
        _count: { select: { answers: true, endorsements: true } },
        pauseReactions: { include: { user: { select: { id: true, name: true } } } },
        sources: { select: { relation: true } },
        tags: { include: { tag: { select: { slug: true, label: true } } } },
        attachments: { select: { url: true }, take: 1, orderBy: { createdAt: "asc" } },
      },
    }),
    getLabels(),
  ]);

  // Sortierung nur im Alltag-Reiter. Relevanz = Aktualität + Resonanz +
  // Bonus für offene Fälle ohne Antwort (KEINE Views/Reichweite, §9).
  if (tab === "tag") {
    const now = Date.now();
    const score = (p: (typeof posts)[number]) => {
      const ageH = (now - p.createdAt.getTime()) / 3_600_000;
      const recency = Math.max(0, 1 - ageH / 336); // ~14 Tage linearer Verfall
      const engagement =
        p._count.answers + p._count.endorsements + p.pauseReactions.length * 0.5;
      const needsHelp =
        p.intent === "SEEK" && p.status === "OPEN" && p._count.answers === 0
          ? 3
          : 0;
      return recency * 5 + engagement + needsHelp;
    };
    if (sortKey === "relevanz") {
      posts.sort((a, b) => score(b) - score(a));
    } else if (sortKey === "offen") {
      const openRank = (p: (typeof posts)[number]) =>
        p.intent === "SEEK" && p.status === "OPEN" ? 1 : 0;
      posts.sort(
        (a, b) =>
          openRank(b) - openRank(a) ||
          b.createdAt.getTime() - a.createdAt.getTime(),
      );
    }
    // "neueste" → bleibt createdAt desc (Query-Reihenfolge)
  }

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

  return (
    <div
      className={`anim-in surface-transition -mx-4 -mt-6 min-h-full px-4 pb-6 pt-6 ${TAB_BG[tab]}`}
    >
      <FeedTabs active={tab} />

      <div className="mt-4">
        <KorpusStats />
      </div>

      {tab === "tag" && (
        <div className="mt-4">
          <SortControl active={sortKey} />
        </div>
      )}

      <ul className="mt-5 space-y-3">
        {feed.length === 0 ? (
          <li className="rounded-[12px] border border-dashed border-border-soft bg-white/60 p-8 text-center text-sm text-muted">
            {labels.feed_empty}
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
