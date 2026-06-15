import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "@prisma/config";

// Prisma 7: Verbindungs-URL und Migrations-/Seed-Konfiguration leben hier,
// nicht mehr im Schema. Die Migrations-Engine nutzt datasource.url; der
// Laufzeit-Client (src/lib/prisma.ts) verbindet über den pg-Driver-Adapter.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
});
