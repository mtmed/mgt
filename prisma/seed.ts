import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Seed für Phase 1: legt nur den fest verdrahteten Demo-Nutzer an.
// (getDemoUser() upsertet denselben Nutzer auch zur Laufzeit — der Seed
//  stellt ihn nach einer frischen Migration sofort bereit.)
const DEMO_USER_ID = "demo-user";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL ist nicht gesetzt.");
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    const user = await prisma.user.upsert({
      where: { id: DEMO_USER_ID },
      update: {},
      create: {
        id: DEMO_USER_ID,
        name: "Du",
        role: "Arbeitsmediziner:in",
      },
    });
    console.log(`Demo-Nutzer bereit: ${user.name} (${user.role})`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
