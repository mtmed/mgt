import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "bada bup",
  description:
    "Berufszentrierte Wissensplattform für Arbeitsmediziner:innen — Fälle einbringen und namentlich beantworten.",
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
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <ServiceWorkerRegister />
        <header className="border-b border-gray-200 bg-white">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              bada bup
            </Link>
            <Link
              href="/cases/new"
              className="rounded-md bg-teal-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-800"
            >
              Fall einbringen
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-2xl px-4 py-3 text-xs text-gray-500">
            bada bup · Walking Skeleton (T2) · Antworten sind immer namentlich.
          </div>
        </footer>
      </body>
    </html>
  );
}
