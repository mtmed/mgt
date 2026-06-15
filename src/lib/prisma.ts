import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 verbindet über einen Driver-Adapter (kein eingebauter Rust-Engine mehr).
// Wir nutzen node-postgres gegen Neons gepoolten Connection-String.
// Singleton: Im Dev-Modus würde Hot-Reload sonst bei jedem Reload eine neue
// PrismaClient-Instanz erzeugen und die DB-Verbindungen erschöpfen.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL ist nicht gesetzt.");
  }
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
