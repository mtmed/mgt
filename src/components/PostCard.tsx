import Link from "next/link";
import type { Intent, PostStatus } from "@prisma/client";
import { Avatar } from "@/components/Avatar";
import { ConsensusBand } from "@/components/ConsensusBand";
import { typeLabel } from "@/lib/post";

export type FeedPost = {
  id: string;
  intent: Intent;
  status: PostStatus;
  isPseudonym: boolean;
  text: string;
  author: { id: string; name: string };
  answerCount: number;
  endorsementCount: number;
  pauseFaces: { id: string; name: string }[];
  hasSource: boolean;
  diverges: boolean;
};

function excerpt(text: string, max = 180) {
  return text.length > max ? text.slice(0, max).trimEnd() + " …" : text;
}

export function PostCard({ post }: { post: FeedPost }) {
  const isPause = post.intent === "PAUSE";

  if (isPause) {
    return (
      <Link
        href={`/posts/${post.id}`}
        className="block rounded-[18px] border border-dashed border-border-pause bg-sand p-4"
      >
        <span className="inline-block rounded-[6px] bg-chip-pause-bg px-2 py-0.5 text-xs font-medium text-terra-deep">
          Pause
        </span>
        <p className="mt-2 text-sm leading-relaxed">{excerpt(post.text)}</p>
        <div className="mt-3 flex items-center gap-2">
          {post.pauseFaces.length > 0 ? (
            <>
              <span className="flex -space-x-1.5">
                {post.pauseFaces.slice(0, 5).map((u) => (
                  <Avatar key={u.id} id={u.id} name={u.name} size={22} />
                ))}
              </span>
              <span className="text-xs text-muted">haben geschmunzelt</span>
            </>
          ) : (
            <span className="text-xs text-muted">{post.author.name}</span>
          )}
        </div>
      </Link>
    );
  }

  const tLabel = typeLabel(post.intent);
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-[12px] border border-border-soft border-l-[3px] border-l-kobalt bg-card-fach p-4 hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="inline-block rounded-[6px] bg-chip-neutral-bg px-2 py-0.5 text-xs font-medium text-chip-neutral-fg">
          {tLabel}
        </span>
        {post.status === "SOLVED" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-gelb px-2 py-0.5 text-xs font-semibold text-ink">
            ✓ gelöst
          </span>
        )}
      </div>

      <p className="mt-2 text-sm leading-relaxed">{excerpt(post.text)}</p>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          {!post.isPseudonym && (
            <Avatar id={post.author.id} name={post.author.name} size={20} />
          )}
          {post.isPseudonym ? "pseudonym" : post.author.name}
        </span>
        {post.intent === "SEEK" && (
          <span>
            {post.answerCount}{" "}
            {post.answerCount === 1 ? "Antwort" : "Antworten"}
          </span>
        )}
        {post.intent === "GIVE" && <ConsensusBand count={post.endorsementCount} />}
        {post.hasSource && !post.diverges && (
          <span className="rounded-[6px] border border-chip-quelle-bd bg-chip-quelle-bg px-1.5 py-0.5 text-kobalt">
            Quelle
          </span>
        )}
        {post.diverges && (
          <span className="rounded-[6px] border border-diverg-bd bg-diverg-bg px-1.5 py-0.5 text-diverg-fg">
            Divergenz
          </span>
        )}
      </div>
    </Link>
  );
}
