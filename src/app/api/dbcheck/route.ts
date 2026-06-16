import { NextResponse } from "next/server";
import { Client } from "pg";

// TEMPORÄRE Diagnose-Route (wird nach der Fehlersuche wieder entfernt).
// Gibt KEIN Passwort aus — nur Metadaten und das Ergebnis eines direkten
// Verbindungstests, um die DATABASE_URL auf Vercel mit lokal zu vergleichen.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL;

  const meta: Record<string, unknown> = {
    hasUrl: Boolean(url),
    length: url?.length ?? 0,
  };

  if (url) {
    try {
      const u = new URL(url);
      meta.host = u.hostname;
      meta.port = u.port || "(default)";
      meta.user = u.username;
      meta.passwordLength = decodeURIComponent(u.password).length;
      meta.database = u.pathname.replace(/^\//, "");
      meta.sslmode = u.searchParams.get("sslmode");
      meta.channelBinding = u.searchParams.get("channel_binding");
      // Sichtbar machen, ob unsichtbare Zeichen am Rand kleben:
      meta.trimmedDiffers = url !== url.trim();
    } catch (e) {
      meta.parseError = String(e);
    }
  }

  // Direkter Verbindungstest mit pg (umgeht Prisma, zeigt den rohen Fehler).
  let connectResult: Record<string, unknown> = { attempted: false };
  if (url) {
    const client = new Client({ connectionString: url });
    try {
      await client.connect();
      const r = await client.query("select current_user, version()");
      connectResult = {
        attempted: true,
        ok: true,
        currentUser: r.rows[0]?.current_user,
      };
    } catch (e: unknown) {
      const err = e as { message?: string; code?: string };
      connectResult = {
        attempted: true,
        ok: false,
        code: err.code,
        message: err.message,
      };
    } finally {
      await client.end().catch(() => {});
    }
  }

  return NextResponse.json({ meta, connectResult });
}
