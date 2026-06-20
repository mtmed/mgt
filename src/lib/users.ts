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
  { id: "u-admin", name: "Admin", role: "Moderation", admin: true },
] as const;

const COOKIE_NAME = "uid";
const DEFAULT_USER_ID = SEED_USERS[0].id;

// Zwischenlösung bis E-Mail-Versand (Resend-Domain) steht: Wer im Anmeldefeld
// das Test-Passwort (TEST_ACCESS_PASSWORD) eingibt, bekommt diesen Cookie und
// landet als fester Test-User. VOR dem Pilot wieder entfernen.
const TEST_COOKIE_NAME = "test_access";
const TEST_USER = { id: "u-test", name: "Testzugang", role: "Test" } as const;

/**
 * Echte:r angemeldete:r Nutzer:in (Auth.js-Session) oder null.
 * Solange AUTH_SECRET nicht gesetzt ist, gibt es keine Session — dann greift
 * der Dev-Fallback (Cookie-Umschalter) in getCurrentUser.
 */
export async function getSessionUser(): Promise<User | null> {
  if (!process.env.AUTH_SECRET) return null;
  try {
    const session = await auth();
    const email = session?.user?.email;
    if (!email) return null;
    const user = await prisma.user.findUnique({ where: { email } });
    // Designierte Admin-Adresse (ENV) wird beim Login zum Admin promotet.
    if (
      user &&
      process.env.ADMIN_EMAIL &&
      email === process.env.ADMIN_EMAIL &&
      (!user.admin || !user.approved)
    ) {
      return prisma.user.update({
        where: { id: user.id },
        data: { admin: true, approved: true },
      });
    }
    return user;
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

  const cookieStore = await cookies();

  // Test-Zugang (Zwischenlösung): gültiger Geheim-Cookie → fester Test-User.
  // Gilt auch in Production. Gate ist die Kenntnis von TEST_ACCESS_PASSWORD.
  const testCookie = cookieStore.get(TEST_COOKIE_NAME)?.value;
  if (
    process.env.TEST_ACCESS_PASSWORD &&
    testCookie &&
    testCookie === process.env.TEST_ACCESS_PASSWORD
  ) {
    // Erst suchen, dann ggf. anlegen — race-fest (Layout + Seite rufen parallel
    // auf; ein paralleler upsert/create würde sonst P2002 auf id werfen).
    const existing = await prisma.user.findUnique({ where: { id: TEST_USER.id } });
    if (existing) return existing;
    try {
      return await prisma.user.create({
        data: { ...TEST_USER, approved: true },
      });
    } catch {
      return prisma.user.findUnique({ where: { id: TEST_USER.id } });
    }
  }

  // Dev-Umschalter-Fallback nur, solange Login NICHT aktiv ist (lokal immer; in
  // Production nur bis AUTH_SECRET gesetzt ist). Verhindert „als Mira posten"
  // ohne Anmeldung, sobald echtes Login scharf ist.
  const fallbackAllowed =
    process.env.NODE_ENV !== "production" || !process.env.AUTH_SECRET;
  if (!fallbackAllowed) return null;

  const uid = cookieStore.get(COOKIE_NAME)?.value;
  const wanted = SEED_USERS.some((u) => u.id === uid) ? uid! : DEFAULT_USER_ID;

  const user = await prisma.user.findUnique({ where: { id: wanted } });
  if (user) return user;

  // Falls noch nicht geseedet (z. B. frische DB): den/die Default-Nutzer:in anlegen.
  const fallback = SEED_USERS.find((u) => u.id === wanted) ?? SEED_USERS[0];
  const admin = "admin" in fallback ? fallback.admin : false;
  return prisma.user.upsert({
    where: { id: fallback.id },
    update: { admin },
    create: { ...fallback, approved: true, admin },
  });
}

export { COOKIE_NAME as USER_COOKIE, TEST_COOKIE_NAME as TEST_ACCESS_COOKIE };
export const TEST_USER_ID = TEST_USER.id;
