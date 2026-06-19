"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/users";

export type MsgState = { error?: string };

// Paar kanonisch sortieren → genau eine Konversation pro Personenpaar.
function pair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function sendMessage(
  _prev: MsgState,
  formData: FormData,
): Promise<MsgState> {
  const me = await getCurrentUser();
  if (!me?.approved)
    return { error: "Dein Zugang ist noch nicht freigeschaltet." };

  const recipientId = String(formData.get("recipientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  if (!recipientId || recipientId === me.id)
    return { error: "Ungültige:r Empfänger:in." };
  if (body.length < 1) return { error: "Bitte schreibe eine Nachricht." };
  if (body.length > 4000)
    return { error: "Die Nachricht ist zu lang (max. 4000 Zeichen)." };

  const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
  if (!recipient || !recipient.approved || recipient.deleted)
    return { error: "Diese:n Empfänger:in gibt es nicht (mehr)." };

  const iBlocked = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: me.id, blockedId: recipientId } },
  });
  if (iBlocked)
    return {
      error:
        "Du hast diese Person blockiert. Hebe die Blockierung auf, um zu schreiben.",
    };
  const blockedMe = await prisma.block.findUnique({
    where: { blockerId_blockedId: { blockerId: recipientId, blockedId: me.id } },
  });
  if (blockedMe) return { error: "Nachricht konnte nicht zugestellt werden." };

  const [aId, bId] = pair(me.id, recipientId);
  const convo = await prisma.conversation.upsert({
    where: { userAId_userBId: { userAId: aId, userBId: bId } },
    update: {}, // bump updatedAt
    create: { userAId: aId, userBId: bId },
  });
  await prisma.message.create({
    data: { conversationId: convo.id, senderId: me.id, body },
  });

  revalidatePath("/postfach");
  revalidatePath(`/postfach/${convo.id}`);
  redirect(`/postfach/${convo.id}`);
}

export async function blockUser(formData: FormData): Promise<void> {
  const me = await getCurrentUser();
  if (!me) return;
  const id = String(formData.get("userId") ?? "");
  if (!id || id === me.id) return;
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: me.id, blockedId: id } },
    update: {},
    create: { blockerId: me.id, blockedId: id },
  });
  revalidatePath(`/mitglied/${id}`);
}

export async function unblockUser(formData: FormData): Promise<void> {
  const me = await getCurrentUser();
  if (!me) return;
  const id = String(formData.get("userId") ?? "");
  await prisma.block.deleteMany({ where: { blockerId: me.id, blockedId: id } });
  revalidatePath(`/mitglied/${id}`);
}
