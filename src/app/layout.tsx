import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import Link from "next/link";
import { cookies } from "next/headers";

// Self-hosted (Next lädt die Schrift zur Build-Zeit, kein Client-Request an Google).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { UserSwitcher } from "@/components/UserSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { InfoMenu } from "@/components/InfoMenu";
import { Onboarding } from "@/components/Onboarding";
import { ComposeBar } from "@/components/ComposeBar";
import {
  getCurrentUser,
  getSessionUser,
  SEED_USERS,
  TEST_USER_ID,
} from "@/lib/users";
import { getLabels } from "@/lib/labels";
import { prisma } from "@/lib/prisma";
import { testSignOut } from "@/lib/actions";
import { signOut } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "bada bup",
  description:
    "Berufszentrierte Wissensplattform — Menschen und ihr Können im Mittelpunkt.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "bada bup" },
  icons: { icon: "/logo.png", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#1E46E0" };

// Prototyp: feste Berufsangabe. Später aus dem Nutzerprofil.
const PROFESSION = "Arbeitsmedizin";

async function signOutAction() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [current, sessionUser, labels, cookieStore] = await Promise.all([
    getCurrentUser(),
    getSessionUser(),
    getLabels(),
    cookies(),
  ]);
  const loggedOut = !current;
  const unread = current
    ? await prisma.message.count({
        where: {
          senderId: { not: current.id },
          readAt: null,
          conversation: {
            OR: [{ userAId: current.id }, { userBId: current.id }],
          },
        },
      })
    : 0;
  const kodexAccepted = cookieStore.get("kodex_ack")?.value === "1";

  return (
    <html lang="de" className={`h-full antialiased ${spaceGrotesk.variable}`}>
      <body className="flex min-h-full flex-col">
        <ServiceWorkerRegister />

        {loggedOut ? (
          <main className="flex-1">{children}</main>
        ) : (
          <>
            {!kodexAccepted && <Onboarding />}
            <header className="border-b border-border-soft bg-white">
              <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
                <Link
                  href="/"
                  className="flex items-center gap-2 text-lg font-semibold tracking-tight"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo.png"
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-[7px]"
                  />
                  bada bup
                </Link>

                {sessionUser ? (
                  <div className="flex items-center gap-2 text-sm">
                    {!sessionUser.approved && (
                      <span className="rounded-full bg-diverg-bg px-2 py-0.5 text-xs text-diverg-fg">
                        in Prüfung
                      </span>
                    )}
                    <span className="rounded-md border border-border-soft px-2 py-1 text-xs text-muted">
                      {PROFESSION}
                    </span>
                    <InfoMenu />
                    <UserMenu
                      user={{ id: sessionUser.id, name: sessionUser.name }}
                      admin={sessionUser.admin}
                      unread={unread}
                      onSignOut={signOutAction}
                    />
                  </div>
                ) : current && current.id === TEST_USER_ID ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="rounded-full bg-diverg-bg px-2 py-0.5 text-xs text-diverg-fg">
                      Testzugang
                    </span>
                    <InfoMenu />
                    <UserMenu
                      user={{ id: current.id, name: current.name }}
                      admin={current.admin}
                      unread={unread}
                      onSignOut={testSignOut}
                    />
                  </div>
                ) : current ? (
                  <div className="flex items-center gap-2">
                    <span className="rounded-md border border-border-soft px-2 py-1 text-xs text-muted">
                      {PROFESSION}
                    </span>
                    <UserSwitcher
                      users={SEED_USERS.map((u) => ({ id: u.id, name: u.name }))}
                      currentId={current.id}
                    />
                    <InfoMenu />
                    <UserMenu
                      user={{ id: current.id, name: current.name }}
                      admin={current.admin}
                      unread={unread}
                    />
                  </div>
                ) : null}
              </div>
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6">
              {children}
            </main>

            <footer className="border-t border-border-soft">
              <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-xs text-muted">
                <span>bada bup · {labels.footer}</span>
                <span className="text-border-soft">·</span>
                <Link href="/datenschutz" className="hover:text-ink">
                  Datenschutz
                </Link>
                <Link href="/impressum" className="hover:text-ink">
                  Impressum
                </Link>
                <Link href="/entwicklung" className="hover:text-ink">
                  Entwicklung
                </Link>
              </div>
            </footer>

            {current && <ComposeBar />}
          </>
        )}
      </body>
    </html>
  );
}
