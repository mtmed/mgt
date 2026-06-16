import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Seed: 2–3 freigeschaltete Nutzer:innen für die Kernschleife.
// (Bleibt synchron zu SEED_USERS in src/lib/users.ts.)
const SEED_USERS = [
  { id: "u-mira", name: "Dr. Mira Falk", role: "Arbeitsmedizinerin" },
  { id: "u-jonas", name: "Dr. Jonas Berger", role: "Arbeitsmediziner" },
  { id: "u-amelie", name: "Dr. Amelie Stark", role: "Arbeitsmedizinerin" },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL ist nicht gesetzt.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    for (const u of SEED_USERS) {
      await prisma.user.upsert({
        where: { id: u.id },
        update: { name: u.name, role: u.role, approved: true },
        create: { ...u, approved: true },
      });
    }
    console.log(`Seed: ${SEED_USERS.length} Nutzer:innen freigeschaltet.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
