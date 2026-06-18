import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { UserSwitcher } from "@/components/UserSwitcher";
import { UserMenu } from "@/components/UserMenu";
import { Onboarding } from "@/components/Onboarding";
import { ComposeBar } from "@/components/ComposeBar";
import { getCurrentUser, getSessionUser, SEED_USERS } from "@/lib/users";
import { getLabels } from "@/lib/labels";
import { signOut } from "@/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "bada bup",
  description:
    "Berufszentrierte Wissensplattform — Menschen und ihr Können im Mittelpunkt.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "bada bup" },
  icons: { icon: "/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = { themeColor: "#1E46E0" };

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
  const kodexAccepted = cookieStore.get("kodex_ack")?.value === "1";

  return (
    <html lang="de" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
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
                    src="/icon.svg"
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
                    <UserMenu user={{ id: sessionUser.id, name: sessionUser.name }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserSwitcher
                      users={SEED_USERS.map((u) => ({ id: u.id, name: u.name }))}
                      currentId={current.id}
                    />
                    <UserMenu user={{ id: current.id, name: current.name }} />
                  </div>
                )}
              </div>
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-24 pt-6">
              {children}
            </main>

            <footer className="border-t border-border-soft">
              <div className="mx-auto w-full max-w-2xl px-4 py-3 text-xs text-muted">
                bada bup · {labels.footer}
              </div>
            </footer>

            <ComposeBar />
          </>
        )}
      </body>
    </html>
  );
}
