import { prisma } from "@/lib/prisma";

// Kollektive Errungenschaften (§10) — ruhiger „Korpus-Stand". STRENG kollektiv:
// nie individuell, kein Ranking, keine Views/Reichweite. Nur das gemeinsame Werk.
export async function KorpusStats() {
  const [solvedCases, sharedInfos, activeTopics] = await Promise.all([
    prisma.post.count({ where: { intent: "SEEK", status: "SOLVED" } }),
    prisma.post.count({ where: { intent: "GIVE" } }),
    prisma.tag.count({ where: { approved: true, posts: { some: {} } } }),
  ]);

  return (
    <div className="rounded-[12px] border border-border-soft bg-white/60 px-4 py-2.5 text-sm">
      <span className="font-medium">gemeinsam</span>
      <span className="text-muted">
        {" · "}
        {solvedCases} {solvedCases === 1 ? "gelöster Fall" : "gelöste Fälle"}
        {" · "}
        {sharedInfos} geteilte {sharedInfos === 1 ? "Erkenntnis" : "Erkenntnisse"}
        {" · "}
        {activeTopics} aktive {activeTopics === 1 ? "Thema" : "Themen"}
      </span>
    </div>
  );
}
