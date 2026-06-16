import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { Client } from "pg";

async function tryConnect(connectionString: string) {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    const r = await client.query("select current_user");
    return { ok: true, currentUser: r.rows[0]?.current_user };
  } catch (e: unknown) {
    const err = e as { message?: string; code?: string };
    return { ok: false, code: err.code, message: err.message };
  } finally {
    await client.end().catch(() => {});
  }
}

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

  let endpointId: string | undefined;
  let password: string | undefined;
  if (url) {
    try {
      const u = new URL(url);
      meta.host = u.hostname;
      meta.port = u.port || "(default)";
      meta.user = u.username;
      password = decodeURIComponent(u.password);
      meta.passwordLength = password.length;
      // Fingerprint zum Abgleich mit lokal — KEIN Klartext.
      meta.passwordFirst = password.slice(0, 1);
      meta.passwordLast = password.slice(-1);
      meta.passwordSha = createHash("sha256")
        .update(password)
        .digest("hex")
        .slice(0, 12);
      meta.database = u.pathname.replace(/^\//, "");
      meta.sslmode = u.searchParams.get("sslmode");
      meta.channelBinding = u.searchParams.get("channel_binding");
      meta.trimmedDiffers = url !== url.trim();
      // Neon-Endpoint-ID aus dem Host ableiten (ohne "-pooler").
      endpointId = u.hostname.split(".")[0].replace(/-pooler$/, "");
      meta.endpointId = endpointId;
    } catch (e) {
      meta.parseError = String(e);
    }
  }

  // Versuch 1: direkt mit der DATABASE_URL (wie Prisma es tut).
  const connectPlain = url
    ? await tryConnect(url)
    : { ok: false, message: "no url" };

  // Versuch 2: mit Neons SNI-Workaround (Endpoint als startup option).
  let connectWithEndpoint: unknown = { skipped: true };
  if (url && endpointId) {
    const u = new URL(url);
    u.searchParams.set("options", `endpoint=${endpointId}`);
    connectWithEndpoint = await tryConnect(u.toString());
  }

  return NextResponse.json({ meta, connectPlain, connectWithEndpoint });
}
