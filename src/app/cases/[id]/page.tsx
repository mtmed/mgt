import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AnswerForm } from "@/components/AnswerForm";

// Detailseite immer frisch aus der DB.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Offen",
  ANSWERED: "Beantwortet",
  RESOLVED: "Gelöst",
};

const dateFormatter = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const caseItem = await prisma.case.findUnique({
    where: { id },
    include: {
      author: true,
      answers: {
        orderBy: { createdAt: "asc" },
        include: { author: true },
      },
    },
  });

  if (!caseItem) {
    notFound();
  }

  return (
    <div>
      <Link href="/" className="text-sm text-teal-700 hover:underline">
        ← Zurück zur Liste
      </Link>

      <article className="mt-2 rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-xl font-semibold">{caseItem.title}</h1>
          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
            {STATUS_LABEL[caseItem.status] ?? caseItem.status}
          </span>
        </div>
        {caseItem.setting && (
          <p className="mt-1 text-sm text-gray-500">{caseItem.setting}</p>
        )}
        <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed">
          {caseItem.body}
        </p>
        <p className="mt-4 text-xs text-gray-400">
          {caseItem.isPseudonym ? "pseudonym" : caseItem.author.name} ·{" "}
          {dateFormatter.format(caseItem.createdAt)}
        </p>
      </article>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          Antworten ({caseItem.answers.length})
        </h2>

        {caseItem.answers.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">
            Noch keine Antworten. Sei die erste namentliche Antwort.
          </p>
        ) : (
          <ul className="space-y-3">
            {caseItem.answers.map((answer) => (
              <li
                key={answer.id}
                className="rounded-lg border border-gray-200 bg-white p-4"
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {answer.body}
                </p>
                <p className="mt-3 text-xs text-gray-400">
                  {answer.author.name} ·{" "}
                  {dateFormatter.format(answer.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-base font-semibold">Antwort hinzufügen</h2>
        <AnswerForm caseId={caseItem.id} />
      </section>
    </div>
  );
}
