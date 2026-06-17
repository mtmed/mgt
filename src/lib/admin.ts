import { cookies } from "next/headers";

// Einfaches Admin-Gate per Passwort (Env). Cookie hält den Passwortwert
// (httpOnly) und wird gegen ADMIN_PASSWORD geprüft — nur mit Kenntnis des
// Passworts ist der Cookie gültig.
export const ADMIN_COOKIE = "admin_token";

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin(): Promise<boolean> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const value = (await cookies()).get(ADMIN_COOKIE)?.value;
  return Boolean(value) && value === pw;
}
