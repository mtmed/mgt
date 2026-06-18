import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { prisma } from "@/lib/prisma";

// Prisma-Adapter mit überschriebenem createUser: setzt einen provisorischen
// Namen aus der E-Mail (Name ist Pflicht; echten Namen setzt man später).
// approved/role kommen aus den Schema-Defaults (approved=false → Freigabe nötig).
const base = PrismaAdapter(prisma);
const adapter: Adapter = {
  ...base,
  createUser: (data) =>
    prisma.user.create({
      data: {
        ...data,
        name: data.name ?? data.email.split("@")[0],
      },
    }) as ReturnType<NonNullable<Adapter["createUser"]>>,
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
