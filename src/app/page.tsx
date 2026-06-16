import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FeedTabs } from "@/components/FeedTabs";
import { PostCard, type FeedPost } from "@/components/PostCard";
import { isValidTab, type FeedTab } from "@/lib/post";

export const dynamic = "force-dynamic";

const TAB_BG: Record<FeedTab, string> = {
  tag: "bg-kreme",
  fach: "bg-bg-fach",
  pause: "bg-sand-warm",
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
    },
  });

  const feed: FeedPost[] = posts.map((p) => ({
    id: p.id,
    intent: p.intent,
    status: p.status,
    isPseudonym: p.isPseudonym,
    text: p.text,
    author: p.author,
    answerCount: p._count.answers,
    endorsementCount: p._count.endorsements,
    pauseFaces: p.pauseReactions.map((r) => r.user),
  }));

  return (
    <div className={`surface-transition -mx-4 -my-6 min-h-full px-4 py-6 ${TAB_BG[tab]}`}>
      <FeedTabs active={tab} />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <ComposeLink intent="SEEK" label="Input holen" accent="kobalt" />
        <ComposeLink intent="GIVE" label="Input geben" accent="kobalt" />
        <ComposeLink intent="PAUSE" label="Pause" accent="terra" />
      </div>

      <ul className="mt-5 space-y-3">
        {feed.length === 0 ? (
          <li className="rounded-[12px] border border-dashed border-border-soft bg-white/60 p-8 text-center text-sm text-muted">
            Noch nichts hier. Mach den Anfang.
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
