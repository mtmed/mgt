import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FeedTabs } from "@/components/FeedTabs";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { isValidTab, type FeedTab } from "@/lib/post";
import { getLabels } from "@/lib/labels";

export const dynamic = "force-dynamic";

const TAB_BG: Record<FeedTab, string> = {
  tag: "bg-kreme",
  fach: "bg-bg-fach",
  pause: "bg-sand-warm",
  korpus: "bg-kreme", // eigener Reiter /korpus; hier nur zur Typvollständigkeit
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab: rawTab } = await searchParams;
  const tab: FeedTab = isValidTab(rawTab) ? rawTab : "tag";

  const where: Prisma.PostWhereInput =
    tab === "fach"
      ? { intent: { in: ["SEEK", "GIVE"] } }
      : tab === "pause"
        ? { intent: "PAUSE" }
        : {};

  const posts = await prisma.post.findMany({
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
  });

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

  const labels = await getLabels();

  return (
    <div className={`anim-in surface-transition -mx-4 -my-6 min-h-full px-4 py-6 ${TAB_BG[tab]}`}>
      <FeedTabs active={tab} />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ComposeLink intent="SEEK" label={labels.intent_seek_label} accent="kobalt" />
        <ComposeLink intent="GIVE" label={labels.intent_give_label} accent="kobalt" />
        <ComposeLink intent="PAUSE" label={labels.intent_pause_label} accent="terra" />
      </div>

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

function ComposeLink({
  intent,
  label,
  accent,
}: {
  intent: "SEEK" | "GIVE" | "PAUSE";
  label: string;
  accent: "kobalt" | "terra";
}) {
  return (
    <Link
      href={`/compose?intent=${intent}`}
      className={`rounded-lg border bg-white px-3 py-2 text-center text-sm font-semibold transition hover:shadow-sm ${
        accent === "terra"
          ? "border-border-pause text-terra-deep"
          : "border-border-soft text-kobalt"
      }`}
    >
      {label}
    </Link>
  );
}
