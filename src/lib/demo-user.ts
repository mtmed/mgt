import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

// Fest verdrahteter Demo-Nutzer für Phase 1 (kein echtes Login bis Phase 3).
// Unter diesem Namen entstehen alle Fälle und Antworten.
const DEMO_USER_ID = "demo-user";

export async function getDemoUser(): Promise<User> {
  return prisma.user.upsert({
    where: { id: DEMO_USER_ID },
    update: {},
    create: {
      id: DEMO_USER_ID,
      name: "Du",
      role: "Arbeitsmediziner:in",
    },
  });
}
