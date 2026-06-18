import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { typeLabel } from "@/lib/post";
import { Avatar } from "@/components/Avatar";
import { AnswersSection } from "@/components/AnswersSection";
import { EndorseButton } from "@/components/EndorseButton";
import { SolvedButton } from "@/components/SolvedButton";
import { PauseReactionButton } from "@/components/PauseReactionButton";
import { PostSources } from "@/components/PostSources";
import { BookmarkButton } from "@/components/BookmarkButton";

export const dynamic = "force-dynamic";

const df = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, current] = await Promise.all([
    prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        answers: {
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
            _count: { select: { endorsements: true } },
          },
        },
        _count: { select: { endorsements: true } },
        pauseReactions: { include: { user: { select: { id: true, name: true } } } },
        sources: { orderBy: { createdAt: "asc" } },
        tags: { include: { tag: true } },
        attachments: { orderBy: { createdAt: "asc" } },
      },
    }),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  const answerIds = post.answers.map((a) => a.id);
  const myEndorsements = current
    ? await prisma.endorsement.findMany({
        where: {
          userId: current.id,
          OR: [{ postId: id }, { answerId: { in: answerIds } }],
        },
        select: { postId: true, answerId: true },
      })
    : [];
  const myPostEndorsed = myEndorsements.some((e) => e.postId === id);
  const myAnswerEndorsed = new Set(
    myEndorsements.map((e) => e.answerId).filter(Boolean) as string[],
  );

  const bookmark = current
    ? await prisma.bookmark.findUnique({
        where: { userId_postId: { userId: current.id, postId: id } },
      })
    : null;

  const isPause = post.intent === "PAUSE";
  const isAuthor = current ? post.authorId === current.id : false;
  const iSmirked = current
    ? post.pauseReactions.some((r) => r.userId === current.id)
    : false;

  return (
    <div className="anim-in">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück zum Feed
      </Link>

      <article
        className={`mt-2 p-5 ${
          isPause
            ? "rounded-[18px] border border-dashed border-border-pause bg-sand"
            : "rounded-[12px] border border-border-soft border-l-[3px] border-l-kobalt bg-card-fach"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          {isPause ? (
            <span className="inline-block rounded-[6px] bg-chip-pause-bg px-2 py-0.5 text-xs font-medium text-terra-deep">
              Pause
            </span>
          ) : (
            <span className="inline-block rounded-[6px] bg-chip-neutral-bg px-2 py-0.5 text-xs font-medium text-chip-neutral-fg">
              {typeLabel(post.intent)}
            </span>
          )}
          {post.status === "SOLVED" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gelb px-2 py-0.5 text-xs font-semibold text-ink">
              ✓ gelöst
            </span>
          )}
        </div>

        {post.title && (
          <h1 className="mt-3 text-lg font-semibold leading-snug">
            {post.title}
          </h1>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
          {post.text}
        </p>

        {post.attachments.length > 0 && (
          <div
            className={`mt-3 gap-2 ${
              post.attachments.length === 1 ? "" : "grid grid-cols-2"
            }`}
          >
            {post.attachments.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={a.url}
                  alt="Anhang"
                  loading="lazy"
                  className="w-full rounded-md border border-border-soft"
                />
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="flex items-center gap-1.5 text-xs text-muted">
            {!post.isPseudonym && (
              <Avatar id={post.author.id} name={post.author.name} size={20} />
            )}
            {post.isPseudonym ? "pseudonym" : post.author.name} ·{" "}
            {df.format(post.createdAt)}
          </span>
          <BookmarkButton postId={post.id} active={Boolean(bookmark)} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map(({ tag }) => (
              <Link
                key={tag.id}
                href={`/korpus?tag=${tag.slug}`}
                className="rounded-full border border-chip-quelle-bd bg-chip-quelle-bg px-2 py-0.5 text-xs text-kobalt hover:border-kobalt/40"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}

        {post.sources.length > 0 && <PostSources sources={post.sources} />}

        {/* Info-Beitrag: selbst „würde ich genauso machen" sammeln */}
        {post.intent === "GIVE" && (
          <div className="mt-4">
            <EndorseButton
              target={{ postId: post.id }}
              redirectPostId={post.id}
              active={myPostEndorsed}
              count={post._count.endorsements}
            />
          </div>
        )}

        {/* SEEK & Fragende:r & offen → als gelöst markieren */}
        {post.intent === "SEEK" && post.status === "OPEN" && isAuthor && (
          <div className="mt-4">
            <SolvedButton postId={post.id} />
          </div>
        )}
      </article>

      {isPause ? (
        <section className="mt-6">
          <PauseReactionButton postId={post.id} active={iSmirked} />
          {post.pauseReactions.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="flex -space-x-1.5">
                {post.pauseReactions.slice(0, 8).map((r) => (
                  <Avatar key={r.user.id} id={r.user.id} name={r.user.name} size={24} />
                ))}
              </span>
              <span className="text-xs text-muted">haben geschmunzelt</span>
            </div>
          )}
        </section>
      ) : (
        <AnswersSection
          postId={post.id}
          currentUser={current ? { id: current.id, name: current.name } : null}
          answers={post.answers.map((a) => ({
            id: a.id,
            text: a.text,
            authorId: a.author.id,
            authorName: a.author.name,
            dateLabel: df.format(a.createdAt),
            endorsementCount: a._count.endorsements,
            mineEndorsed: myAnswerEndorsed.has(a.id),
          }))}
        />
      )}
    </div>
  );
}
