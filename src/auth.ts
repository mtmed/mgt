import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const PENDING_NAME_COOKIE = "pending_name";

// Prisma-Adapter mit überschriebenem createUser: übernimmt den bei der
// Registrierung eingegebenen Namen (Cookie), sonst provisorisch aus der E-Mail.
// approved/role kommen aus den Schema-Defaults (approved=false → Freigabe nötig).
const base = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...base,
  createUser: async (data) => {
    let name = data.name ?? data.email.split("@")[0];
    try {
      const pending = (await cookies()).get(PENDING_NAME_COOKIE)?.value?.trim();
      if (pending) name = pending;
    } catch {
      // cookies() evtl. nicht verfügbar — Fallback bleibt
    }
    return prisma.user.create({ data: { ...data, name } }) as ReturnType<
      NonNullable<Adapter["createUser"]>
    >;
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [
    Resend({
      from: process.env.EMAIL_FROM ?? "bada bup <onboarding@resend.dev>",
    }),
  ],
  pages: {
    signIn: "/anmelden",
    verifyRequest: "/anmelden/pruefen",
  },
});
