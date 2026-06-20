import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const PENDING_NAME_COOKIE = "pending_name";
export const LOGIN_EMAIL_COOKIE = "login_email";

// 6-stelliger Anmelde-Code (statt nur Magic-Link) — funktioniert in der
// installierten PWA, weil der Code IN der App eingegeben wird.
function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendCodeEmail(params: {
  identifier: string;
  url: string;
  token: string;
}) {
  const { identifier: email, url, token } = params;
  const from = process.env.EMAIL_FROM ?? "bada bup <onboarding@resend.dev>";

  // Dev-Fallback: ohne Resend-Key den Code ins Server-Log schreiben, statt zu
  // scheitern — so ist Login/Registrierung lokal ohne E-Mail-Versand testbar.
  if (!process.env.AUTH_RESEND_KEY) {
    console.log(`\n[DEV] Anmelde-Code für ${email}: ${token}\n(Link: ${url})\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: `bada bup — dein Anmelde-Code: ${token}`,
      text:
        `Dein Anmelde-Code für bada bup:\n\n   ${token}\n\n` +
        `Gib ihn in der App/im Browser ein. Gültig für 10 Minuten.\n\n` +
        `Oder am Desktop direkt anmelden: ${url}\n`,
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend-Versand fehlgeschlagen (${res.status}).`);
  }
}

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
      maxAge: 60 * 10, // Code 10 Minuten gültig
      generateVerificationToken: generateCode,
      sendVerificationRequest: sendCodeEmail,
    }),
  ],
  pages: {
    signIn: "/anmelden",
    verifyRequest: "/anmelden/code",
  },
});
