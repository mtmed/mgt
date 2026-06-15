import Link from "next/link";
import { prisma } from "@/lib/prisma";

// Keine Cache-Persistenz: Die Liste soll immer den aktuellen DB-Stand zeigen.
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Offen",
  ANSWERED: "Beantwortet",
  RESOLVED: "Gelöst",
};

export default async function HomePage() {
  const cases = await prisma.case.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      author: true,
      _count: { select: { answers: true } },
    },
  });

  return (
    <div>
      <div className="mb-4 flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Fälle</h1>
        <span className="text-sm text-gray-500">{cases.length} insgesamt</span>
      </div>

      {cases.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center">
          <p className="text-gray-600">Noch keine Fälle vorhanden.</p>
          <Link
            href="/cases/new"
            className="mt-3 inline-block rounded-md bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Ersten Fall einbringen
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {cases.map((c) => (
            <li key={c.id}>
              <Link
                href={`/cases/${c.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 hover:border-teal-300 hover:shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-medium">{c.title}</h2>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {STATUS_LABEL[c.status] ?? c.status}
                  </span>
                </div>
                {c.setting && (
                  <p className="mt-1 text-sm text-gray-500">{c.setting}</p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                  {c.isPseudonym ? "pseudonym" : c.author.name} ·{" "}
                  {c._count.answers}{" "}
                  {c._count.answers === 1 ? "Antwort" : "Antworten"}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
