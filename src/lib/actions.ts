"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, SEED_USERS, USER_COOKIE } from "@/lib/users";
import { createAnswerSchema, createPostSchema } from "@/lib/validation";

export type FormState = { error?: string };

export async function createPost(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createPostSchema.safeParse({
    intent: formData.get("intent"),
    text: formData.get("text"),
    isPseudonym: formData.get("isPseudonym") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const author = await getCurrentUser();
  const post = await prisma.post.create({
    data: {
      intent: parsed.data.intent,
      text: parsed.data.text,
      isPseudonym: parsed.data.isPseudonym,
      authorId: author.id,
    },
  });

  revalidatePath("/");
  redirect(`/posts/${post.id}`);
}

export async function createAnswer(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createAnswerSchema.safeParse({
    postId: formData.get("postId"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const author = await getCurrentUser(); // Antworten immer namentlich
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
