import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";
import { typeLabel } from "@/lib/post";
import { Avatar } from "@/components/Avatar";
import { AnswerForm } from "@/components/AnswerForm";
import { EndorseButton } from "@/components/EndorseButton";
import { SolvedButton } from "@/components/SolvedButton";
import { PauseReactionButton } from "@/components/PauseReactionButton";
import { PostSources } from "@/components/PostSources";

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
      },
    }),
    getCurrentUser(),
  ]);

  if (!post) notFound();

  const answerIds = post.answers.map((a) => a.id);
  const myEndorsements = await prisma.endorsement.findMany({
    where: {
      userId: current.id,
      OR: [{ postId: id }, { answerId: { in: answerIds } }],
    },
    select: { postId: true, answerId: true },
  });
  const myPostEndorsed = myEndorsements.some((e) => e.postId === id);
  const myAnswerEndorsed = new Set(
    myEndorsements.map((e) => e.answerId).filter(Boolean) as string[],
  );

  const isPause = post.intent === "PAUSE";
  const isAuthor = post.authorId === current.id;
  const iSmirked = post.pauseReactions.some((r) => r.userId === current.id);

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

        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
          {post.text}
        </p>

        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted">
          {!post.isPseudonym && (
            <Avatar id={post.author.id} name={post.author.name} size={20} />
          )}
          {post.isPseudonym ? "pseudonym" : post.author.name} · {df.format(post.createdAt)}
        </p>

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
        <>
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-semibold">
              Antworten ({post.answers.length})
            </h2>
            {post.answers.length === 0 ? (
              <p className="rounded-[12px] border border-dashed border-border-soft bg-white p-4 text-sm text-muted">
                Noch keine Antworten. Sei die erste namentliche Antwort.
              </p>
            ) : (
              <ul className="space-y-3">
                {post.answers.map((a) => (
                  <li
                    key={a.id}
                    className="rounded-[12px] border border-border-soft bg-white p-4"
                  >
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {a.text}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                      <Avatar id={a.author.id} name={a.author.name} size={20} />
                      {a.author.name} · {df.format(a.createdAt)}
                    </p>
                    <div className="mt-3">
                      <EndorseButton
                        target={{ answerId: a.id }}
                        redirectPostId={post.id}
                        active={myAnswerEndorsed.has(a.id)}
                        count={a._count.endorsements}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6 rounded-[12px] border border-border-soft bg-white p-5">
            <h2 className="mb-3 text-base font-semibold">Antwort hinzufügen</h2>
            <AnswerForm postId={post.id} />
          </section>
        </>
      )}
    </div>
  );
}
