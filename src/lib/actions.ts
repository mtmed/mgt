"use server";

import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { getCurrentUser, SEED_USERS, USER_COOKIE } from "@/lib/users";
import {
  createAnswerSchema,
  createPostSchema,
  createSourceSchema,
} from "@/lib/validation";

export type FormState = { error?: string };

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const me = await getCurrentUser();
  if (!me?.approved) {
    return { error: "Dein Zugang ist noch nicht freigeschaltet." };
  }

  const parsed = createPostSchema.safeParse({
    intent: formData.get("intent"),
    title: formData.get("title"),
    text: formData.get("text"),
    isPseudonym: formData.get("isPseudonym") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  // Optionale Quelle (§7) — nur beim „Input geben" (GIVE).
  const rawSourceTitle = formData.get("sourceTitle");
  let source: ReturnType<typeof createSourceSchema.parse> | undefined;
  if (
    parsed.data.intent === "GIVE" &&
    typeof rawSourceTitle === "string" &&
    rawSourceTitle.trim() !== ""
  ) {
    const s = createSourceSchema.safeParse({
      title: rawSourceTitle,
      url: formData.get("sourceUrl"),
      relation: formData.get("sourceRelation"),
      reason: formData.get("sourceReason"),
    });
    if (!s.success) {
      return { error: s.error.issues[0]?.message ?? "Ungültige Quelle." };
    }
    source = s.data;
  }

  // Tags (nur Fach): freigegebene per slug + optionale Vorschläge (approved=false).
  let tagIds: string[] = [];
  if (parsed.data.intent !== "PAUSE") {
    const selectedSlugs = formData
      .getAll("tags")
      .filter((v): v is string => typeof v === "string");
    if (selectedSlugs.length > 0) {
      const existing = await prisma.tag.findMany({
        where: { slug: { in: selectedSlugs }, approved: true },
        select: { id: true },
      });
      tagIds = existing.map((t) => t.id);
    }

    const rawNew = formData.get("newTags");
    if (typeof rawNew === "string" && rawNew.trim() !== "") {
      const labels = rawNew
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 5);
      for (const label of labels) {
        const slug = slugify(label);
        if (!slug) continue;
        const tag = await prisma.tag.upsert({
          where: { slug },
          update: {},
          create: { slug, label: label.slice(0, 40), approved: false },
        });
        tagIds.push(tag.id);
      }
    }
    tagIds = [...new Set(tagIds)];
  }

  // Bild-Anhänge (nur Fach): verkleinern + EXIF entfernen, dann zu Vercel Blob.
  const attachmentData: { url: string; width: number; height: number }[] = [];
  if (parsed.data.intent !== "PAUSE") {
    const files = formData
      .getAll("images")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, 3);

    if (files.length > 0) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return {
          error:
            "Bild-Upload ist noch nicht konfiguriert (BLOB_READ_WRITE_TOKEN fehlt).",
        };
      }
      for (const file of files) {
        if (!file.type.startsWith("image/")) {
          return { error: "Nur Bilddateien sind erlaubt." };
        }
        if (file.size > 8 * 1024 * 1024) {
          return { error: "Ein Bild ist zu groß (max. 8 MB)." };
        }
        const input = Buffer.from(await file.arrayBuffer());
        // .rotate() wendet die EXIF-Orientierung an; sharp verwirft Metadaten
        // (GPS/Zeit/Gerät) standardmäßig beim Re-Encode.
        const { data, info } = await sharp(input)
          .rotate()
          .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer({ resolveWithObject: true });
        const blob = await put(`posts/${randomUUID()}.jpg`, data, {
          access: "public",
          contentType: "image/jpeg",
          addRandomSuffix: false,
        });
        attachmentData.push({ url: blob.url, width: info.width, height: info.height });
      }
    }
  }

  const author = me;
  const post = await prisma.post.create({
    data: {
      intent: parsed.data.intent,
      title: parsed.data.title ?? null,
      text: parsed.data.text,
      isPseudonym: parsed.data.isPseudonym,
      authorId: author.id,
      sources: source
        ? {
            create: {
              title: source.title,
              url: source.url,
              relation: source.relation,
              reason: source.reason,
            },
          }
        : undefined,
      tags: tagIds.length
        ? { create: tagIds.map((tagId) => ({ tagId })) }
        : undefined,
      attachments: attachmentData.length
        ? { create: attachmentData }
        : undefined,
    },
  });

  revalidatePath("/");
  redirect(`/posts/${post.id}`);
}

export async function createAnswer(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const author = await getCurrentUser(); // Antworten immer namentlich
  if (!author?.approved) {
    return { error: "Dein Zugang ist noch nicht freigeschaltet." };
  }

  const parsed = createAnswerSchema.safeParse({
    postId: formData.get("postId"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }
  await prisma.answer.create({
    data: {
      text: parsed.data.text,
      postId: parsed.data.postId,
      authorId: author.id,
    },
  });

  revalidatePath(`/posts/${parsed.data.postId}`);
  revalidatePath("/");
  return {};
}

// „würde ich genauso machen" — Toggle auf einen Info-Post ODER eine Answer.
export async function toggleEndorsement(
  target: { postId?: string; answerId?: string },
  redirectPostId: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user?.approved) return;
  const where = target.postId
    ? { userId_postId: { userId: user.id, postId: target.postId } }
    : { userId_answerId: { userId: user.id, answerId: target.answerId! } };

  const existing = await prisma.endorsement.findUnique({ where });
  if (existing) {
    await prisma.endorsement.delete({ where: { id: existing.id } });
  } else {
    await prisma.endorsement.create({
      data: { userId: user.id, ...target },
    });
  }

  revalidatePath(`/posts/${redirectPostId}`);
}

// „gelöst" — darf NUR der/die Fragende setzen (§5).
export async function markSolved(postId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== user.id || post.intent !== "SEEK") {
    return; // still ignorieren, kein Recht
  }
  await prisma.post.update({
    where: { id: postId },
    data: { status: "SOLVED" },
  });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}

// „haben geschmunzelt" — Toggle, nur für Pause-Beiträge. Keine Zahl, kein Gelb.
export async function togglePauseReaction(postId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user?.approved) return;
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.intent !== "PAUSE") return;

  const existing = await prisma.pauseReaction.findUnique({
    where: { userId_postId: { userId: user.id, postId } },
  });
  if (existing) {
    await prisma.pauseReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.pauseReaction.create({ data: { userId: user.id, postId } });
  }
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}

// Profil: angezeigten Namen ändern.
export async function updateName(
  _prev: FormState & { ok?: boolean },
  formData: FormData,
): Promise<FormState & { ok?: boolean }> {
  const me = await getCurrentUser();
  if (!me) return { error: "Nicht angemeldet." };
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Bitte gib einen Namen ein (mind. 2 Zeichen)." };
  if (name.length > 80) return { error: "Der Name ist zu lang (max. 80 Zeichen)." };
  await prisma.user.update({ where: { id: me.id }, data: { name } });
  revalidatePath("/", "layout");
  return { ok: true };
}

// Onboarding/Kodex einmalig bestätigt (Cookie). Bis dahin zeigt das Layout
// den Erst-Screen.
export async function acceptKodex(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("kodex_ack", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}

// Privates Lesezeichen — Toggle (kein öffentliches Signal).
export async function toggleBookmark(postId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const where = { userId_postId: { userId: user.id, postId } };
  const existing = await prisma.bookmark.findUnique({ where });
  if (existing) {
    await prisma.bookmark.delete({ where });
  } else {
    await prisma.bookmark.create({ data: { userId: user.id, postId } });
  }
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/meine");
}

// Konto löschen (Recht auf Vergessenwerden): Identität wird anonymisiert,
// die fachlichen Beiträge bleiben als Teil des Korpus erhalten — aber als
// „Nutzer gelöscht". Persönliche Signale (Lesezeichen, Pause-Reaktionen,
// Nachrichten, Login) werden entfernt.
export async function deleteAccount(formData: FormData): Promise<void> {
  const me = await getCurrentUser();
  if (!me) return;

  // Verifikation: der eingegebene Name muss exakt dem eigenen entsprechen.
  const confirmName = String(formData.get("confirmName") ?? "").trim();
  if (confirmName !== me.name) return;

  await prisma.$transaction([
    prisma.bookmark.deleteMany({ where: { userId: me.id } }),
    prisma.pauseReaction.deleteMany({ where: { userId: me.id } }),
    prisma.adminMessage.deleteMany({ where: { senderId: me.id } }),
    // Private Konversationen (inkl. Nachrichten per Cascade) und Blockierungen.
    prisma.conversation.deleteMany({
      where: { OR: [{ userAId: me.id }, { userBId: me.id }] },
    }),
    prisma.block.deleteMany({
      where: { OR: [{ blockerId: me.id }, { blockedId: me.id }] },
    }),
    prisma.session.deleteMany({ where: { userId: me.id } }),
    prisma.account.deleteMany({ where: { userId: me.id } }),
    prisma.user.update({
      where: { id: me.id },
      data: {
        name: "Nutzer gelöscht",
        email: null,
        image: null,
        role: "—",
        approved: false,
        admin: false,
        deleted: true,
        deletedAt: new Date(),
      },
    }),
  ]);

  // Dev-Umschalter-Cookie leeren und abmelden (signOut leitet auf „/" um).
  (await cookies()).delete(USER_COOKIE);
  await signOut({ redirectTo: "/" });
}

// Nachricht an den Admin (aus dem ⓘ-Menü). Absender ist die angemeldete Person.
export async function sendAdminMessage(
  _prev: FormState & { ok?: boolean },
  formData: FormData,
): Promise<FormState & { ok?: boolean }> {
  const me = await getCurrentUser();
  if (!me) return { error: "Nicht angemeldet." };
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 3) return { error: "Bitte schreibe eine Nachricht." };
  if (body.length > 2000)
    return { error: "Die Nachricht ist zu lang (max. 2000 Zeichen)." };

  await prisma.adminMessage.create({ data: { body, senderId: me.id } });
  return { ok: true };
}

// Nutzer-Umschalter (nur bis zum echten Login).
export async function switchUser(userId: string): Promise<void> {
  if (!SEED_USERS.some((u) => u.id === userId)) return;
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  // Nutzerwechsel betrifft die ganze App (Header + Rechte) → alles neu rendern.
  revalidatePath("/", "layout");
}
