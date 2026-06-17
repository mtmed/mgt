import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { UserSwitcher } from "@/components/UserSwitcher";
import { getCurrentUser, SEED_USERS } from "@/lib/users";
import { getLabels } from "@/lib/labels";
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
  const [current, labels] = await Promise.all([getCurrentUser(), getLabels()]);

  return (
    <html lang="de" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ServiceWorkerRegister />
        <header className="border-b border-border-soft bg-white">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between gap-3 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-tight">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="" width={28} height={28} className="rounded-[7px]" />
              bada bup
            </Link>
            <UserSwitcher
              users={SEED_USERS.map((u) => ({ id: u.id, name: u.name }))}
              currentId={current.id}
            />
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
