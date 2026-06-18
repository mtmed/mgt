import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { UserSwitcher } from "@/components/UserSwitcher";
import { Onboarding } from "@/components/Onboarding";
import { getCurrentUser, getSessionUser, SEED_USERS } from "@/lib/users";
import { getLabels } from "@/lib/labels";
import { signOut } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "bada bup",
  description:
    "Berufszentrierte Wissensplattform für Arbeitsmediziner:innen — Input holen und namentlich geben.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "bada bup",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1E46E0",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [current, sessionUser, labels, cookieStore] = await Promise.all([
    getCurrentUser(),
    getSessionUser(),
    getLabels(),
    cookies(),
  ]);
  const kodexAccepted = cookieStore.get("kodex_ack")?.value === "1";

  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ServiceWorkerRegister />
        {!kodexAccepted && <Onboarding />}
        <header className="border-b border-border-soft bg-white">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" width={28} height={28} className="rounded-[7px]" />
              bada bup
            </Link>
            {sessionUser ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="hidden max-w-[10rem] truncate sm:inline">
                  {sessionUser.name}
                </span>
                {!sessionUser.approved && (
                  <span className="rounded-full bg-diverg-bg px-2 py-0.5 text-xs text-diverg-fg">
                    in Prüfung
                  </span>
                )}
                <form
                  action={async () => {
                    "use server";
                    await signOut({ redirectTo: "/" });
                  }}
                >
                  <button className="rounded-md border border-border-soft px-2 py-1 text-xs hover:border-kobalt/40">
                    Abmelden
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {current && (
                  <UserSwitcher
                    users={SEED_USERS.map((u) => ({ id: u.id, name: u.name }))}
                    currentId={current.id}
                  />
                )}
                <Link
                  href="/anmelden"
                  className="rounded-md bg-kobalt px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90"
                >
                  Anmelden
                </Link>
              </div>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-border-soft">
          <div className="mx-auto w-full max-w-2xl px-4 py-3 text-xs text-muted">
            bada bup · {labels.footer}
          </div>
        </footer>
      </body>
    </html>
  );
}
