import { getCurrentUser } from "@/lib/users";

// Admin = eingeloggte:r Nutzer:in mit Admin-Flag (dedizierter Account).
// Kein separates Passwort-Gate mehr.
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.admin === true;
}
