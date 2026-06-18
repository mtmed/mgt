import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";
import { auth } from "@/auth";

// Phase „Kernschleife": 2–3 fest verdrahtete, freigeschaltete Seed-Nutzer.
// Über einen Cookie umschaltbar, damit „namentlich" und „nur Fragende lösen"
// testbar sind. Echtes Login (Magic-Link + manuelle Freischaltung) folgt.
export const SEED_USERS = [
  { id: "u-mira", name: "Dr. Mira Falk", role: "Arbeitsmedizinerin" },
  { id: "u-jonas", name: "Dr. Jonas Berger", role: "Arbeitsmediziner" },
  { id: "u-amelie", name: "Dr. Amelie Stark", role: "Arbeitsmedizinerin" },
] as const;

const COOKIE_NAME = "uid";
const DEFAULT_USER_ID = SEED_USERS[0].id;

/**
 * Echte:r angemeldete:r Nutzer:in (Auth.js-Session) oder null.
 * Solange ADMIN_PASSWORD… nein: solange AUTH_SECRET nicht gesetzt ist, gibt es
 * keine Session — dann greift der Dev-Fallback in getCurrentUser.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!process.env.AUTH_SECRET) return null;
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return null;
    return await prisma.user.findUnique({ where: { email } });
  } catch {
    return null;
  }
}

/**
 * Aktive:r Nutzer:in: echte Session, sonst (NUR in der Entwicklung) der
 * Cookie-Umschalter. In Production gibt es ohne Anmeldung keine Identität
 * (verhindert „als Mira posten" ohne Login).
 */
export async function getCurrentUser(): Promise<User | null> {
  const sessionUser = await getSessionUser();
  if (sessionUser) return sessionUser;

  // Dev-Umschalter-Fallback nur, solange Login NICHT aktiv ist (lokal immer; in
  // Production nur bis AUTH_SECRET gesetzt ist). Verhindert „als Mira posten"
  // ohne Anmeldung, sobald echtes Login scharf ist.
  const fallbackAllowed =
    process.env.NODE_ENV !== "production" || !process.env.AUTH_SECRET;
  if (!fallbackAllowed) return null;

  const cookieStore = await cookies();
  const uid = cookieStore.get(COOKIE_NAME)?.value;
  const wanted = SEED_USERS.some((u) => u.id === uid) ? uid! : DEFAULT_USER_ID;

  const user = await prisma.user.findUnique({ where: { id: wanted } });
  if (user) return user;

  // Falls noch nicht geseedet (z. B. frische DB): den/die Default-Nutzer:in anlegen.
  const fallback = SEED_USERS.find((u) => u.id === wanted) ?? SEED_USERS[0];
  return prisma.user.upsert({
    where: { id: fallback.id },
    update: {},
    create: { ...fallback, approved: true },
  });
}

export { COOKIE_NAME as USER_COOKIE };
