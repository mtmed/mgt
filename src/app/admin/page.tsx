import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import {
  approveTag,
  approveUser,
  deletePost,
  rejectTag,
  revokeUser,
  saveLabels,
  unhidePost,
} from "@/lib/admin-actions";
import { getLabels, LABEL_DEFS } from "@/lib/labels";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin · bada bup" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-in">
      <Link href="/" className="text-sm text-kobalt hover:underline">
        ← Zurück zum Feed
      </Link>
      <h1 className="mt-2 mb-4 text-xl font-semibold">Admin</h1>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[12px] border border-border-soft bg-white p-4">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const { saved } = await searchParams;

  if (!(await isAdmin())) {
    return (
      <Shell>
        <p className="rounded-md border border-border-soft bg-white p-4 text-sm text-muted">
          Kein Zugriff. Diese Seite ist nur für Admin-Konten. Melde dich mit dem
          Admin-Account an.
        </p>
      </Shell>
    );
  }

  // --- Kennzahlen (aggregiert, §9: kein Personenprofil) ---
  const [
    totalPosts,
    seek,
    give,
    pause,
    seekSolved,
    answers,
    endorsements,
    pauseReactions,
    diverges,
    answerers,
    tagCounts,
    pendingTags,
    pendingUsers,
    approvedMembers,
    hiddenPosts,
    seekWithFirst,
    labels,
  ] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { intent: "SEEK" } }),
    prisma.post.count({ where: { intent: "GIVE" } }),
    prisma.post.count({ where: { intent: "PAUSE" } }),
    prisma.post.count({ where: { intent: "SEEK", status: "SOLVED" } }),
    prisma.answer.count(),
    prisma.endorsement.count(),
    prisma.pauseReaction.count(),
    prisma.source.count({ where: { relation: "DIVERGES" } }),
    prisma.answer.findMany({ distinct: ["authorId"], select: { authorId: true } }),
    prisma.tag.findMany({
      where: { approved: true },
      select: { label: true, _count: { select: { posts: true } } },
    }),
    prisma.tag.findMany({ where: { approved: false }, orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
      where: { approved: false },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { approved: true, email: { not: null } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true },
    }),
    prisma.post.findMany({
      where: { hidden: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, text: true },
    }),
    prisma.post.findMany({
      where: { intent: "SEEK" },
      select: {
        createdAt: true,
        answers: { select: { createdAt: true }, orderBy: { createdAt: "asc" }, take: 1 },
      },
    }),
    getLabels(),
  ]);

  const solveRate = seek > 0 ? Math.round((seekSolved / seek) * 100) : 0;
  const avgAnswers = seek > 0 ? (answers / seek).toFixed(1) : "0";

  const firstAnswerDiffs = seekWithFirst
    .filter((p) => p.answers.length > 0)
    .map((p) => p.answers[0].createdAt.getTime() - p.createdAt.getTime());
  const avgFirstAnswerH =
    firstAnswerDiffs.length > 0
      ? (
          firstAnswerDiffs.reduce((a, b) => a + b, 0) /
          firstAnswerDiffs.length /
          3_600_000
        ).toFixed(1)
      : "—";

  const topTags = tagCounts
    .filter((t) => t._count.posts > 0)
    .sort((a, b) => b._count.posts - a._count.posts)
    .slice(0, 8);

  const labelGroups = [...new Set(LABEL_DEFS.map((d) => d.group))];

  return (
    <Shell>
      {/* Kennzahlen */}
      <h2 className="mb-2 text-lg font-semibold">Kennzahlen</h2>
      <p className="mb-3 text-xs text-muted">
        Aggregiert, intern. Keine personenbezogenen Profile.
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label="Beiträge gesamt" value={totalPosts} />
        <Stat label="Fälle (SEEK)" value={seek} />
        <Stat label="Infos (GIVE)" value={give} />
        <Stat label="Pause" value={pause} />
        <Stat label="Lösungsquote" value={`${solveRate} %`} />
        <Stat label="Ø Antworten / Fall" value={avgAnswers} />
        <Stat label="Ø Zeit bis 1. Antwort" value={`${avgFirstAnswerH} h`} />
        <Stat label="Antworten gesamt" value={answers} />
        <Stat label="aktive Antwortende" value={answerers.length} />
        <Stat label="Zustimmungen" value={endorsements} />
        <Stat label="Pause-Reaktionen" value={pauseReactions} />
        <Stat label="bewusste Divergenzen" value={diverges} />
      </div>

      <h3 className="mt-5 mb-2 text-sm font-semibold">Aktivität je Thema</h3>
      <div className="flex flex-wrap gap-1.5">
        {topTags.length === 0 ? (
          <span className="text-sm text-muted">Noch keine verschlagworteten Beiträge.</span>
        ) : (
          topTags.map((t) => (
            <span
              key={t.label}
              className="rounded-full border border-chip-quelle-bd bg-chip-quelle-bg px-2 py-0.5 text-xs text-kobalt"
            >
              {t.label} · {t._count.posts}
            </span>
          ))
        )}
      </div>

      {/* Nutzer freischalten */}
      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Zugänge freischalten ({pendingUsers.length})
      </h2>
      <p className="mb-3 text-xs text-muted">
        Neue Anmeldungen warten auf manuelle Freigabe. {approvedMembers.length}{" "}
        Mitglied(er) freigeschaltet.
      </p>
      {pendingUsers.length === 0 ? (
        <p className="text-sm text-muted">Keine offenen Anmeldungen.</p>
      ) : (
        <ul className="space-y-2">
          {pendingUsers.map((u) => (
            <li
              key={u.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-white p-3"
            >
              <span className="min-w-0 text-sm">
                <span className="font-medium">{u.name}</span>{" "}
                <span className="text-muted">{u.email ?? "(keine E-Mail)"}</span>
              </span>
              <form action={approveUser}>
                <input type="hidden" name="userId" value={u.id} />
                <button className="shrink-0 rounded-md border border-kobalt px-2 py-1 text-xs font-semibold text-kobalt hover:bg-eisblau/30">
                  Freischalten
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {approvedMembers.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer text-sm text-muted hover:text-ink">
            Freigeschaltete Mitglieder ({approvedMembers.length})
          </summary>
          <ul className="mt-2 space-y-2">
            {approvedMembers.map((u) => (
              <li
                key={u.id}
                className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-white p-3"
              >
                <span className="min-w-0 text-sm">
                  <span className="font-medium">{u.name}</span>{" "}
                  <span className="text-muted">{u.email}</span>
                </span>
                <form action={revokeUser}>
                  <input type="hidden" name="userId" value={u.id} />
                  <button className="shrink-0 rounded-md border border-border-soft px-2 py-1 text-xs text-muted hover:text-ink">
                    Freigabe zurücknehmen
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </details>
      )}

      {/* Ausgeblendete Beiträge */}
      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Ausgeblendete Beiträge ({hiddenPosts.length})
      </h2>
      {hiddenPosts.length === 0 ? (
        <p className="text-sm text-muted">Keine ausgeblendeten Beiträge.</p>
      ) : (
        <ul className="space-y-2">
          {hiddenPosts.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-white p-3"
            >
              <span className="min-w-0 truncate text-sm">
                {p.title ?? p.text.slice(0, 60)}
              </span>
              <span className="flex shrink-0 gap-2">
                <form action={unhidePost}>
                  <input type="hidden" name="postId" value={p.id} />
                  <button className="rounded-md border border-kobalt px-2 py-1 text-xs font-semibold text-kobalt hover:bg-eisblau/30">
                    Wiederherstellen
                  </button>
                </form>
                <form action={deletePost}>
                  <input type="hidden" name="postId" value={p.id} />
                  <button className="rounded-md border border-border-soft px-2 py-1 text-xs text-red-600 hover:bg-red-50">
                    Löschen
                  </button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Vorgeschlagene Tags */}
      <h2 className="mt-8 mb-2 text-lg font-semibold">
        Vorgeschlagene Themen ({pendingTags.length})
      </h2>
      {pendingTags.length === 0 ? (
        <p className="text-sm text-muted">Keine offenen Vorschläge.</p>
      ) : (
        <ul className="space-y-2">
          {pendingTags.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 rounded-md border border-border-soft bg-white p-3"
            >
              <span className="text-sm">{t.label}</span>
              <span className="flex gap-2">
                <form action={approveTag}>
                  <input type="hidden" name="tagId" value={t.id} />
                  <button className="rounded-md border border-kobalt px-2 py-1 text-xs font-semibold text-kobalt hover:bg-eisblau/30">
                    Freigeben
                  </button>
                </form>
                <form action={rejectTag}>
                  <input type="hidden" name="tagId" value={t.id} />
                  <button className="rounded-md border border-border-soft px-2 py-1 text-xs text-muted hover:text-ink">
                    Verwerfen
                  </button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Beschriftungen */}
      <h2 className="mt-8 mb-2 text-lg font-semibold">Beschriftungen</h2>
      {saved && (
        <p className="mb-3 rounded-md border border-kobalt bg-eisblau/30 px-3 py-2 text-sm text-kobalt">
          Gespeichert.
        </p>
      )}
      <p className="mb-3 text-xs text-muted">
        Leer lassen = Standardtext verwenden.
      </p>
      <form action={saveLabels} className="space-y-5">
        {labelGroups.map((group) => (
          <fieldset key={group} className="rounded-[12px] border border-border-soft bg-white p-4">
            <legend className="px-1 text-sm font-semibold">{group}</legend>
            <div className="space-y-3">
              {LABEL_DEFS.filter((d) => d.group === group).map((d) => (
                <div key={d.key}>
                  <label
                    htmlFor={`label_${d.key}`}
                    className="block text-xs text-muted"
                  >
                    {d.desc}
                  </label>
                  <input
                    id={`label_${d.key}`}
                    name={`label_${d.key}`}
                    defaultValue={labels[d.key]}
                    placeholder={d.def}
                    className="mt-1 w-full rounded-md border border-border-soft px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
                  />
                </div>
              ))}
            </div>
          </fieldset>
        ))}
        <button
          type="submit"
          className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Beschriftungen speichern
        </button>
      </form>
    </Shell>
  );
}
