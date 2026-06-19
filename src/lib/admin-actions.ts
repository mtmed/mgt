"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import { LABEL_DEFS } from "@/lib/labels";

// Beschriftungen speichern: leer oder == Default → Override löschen.
export async function saveLabels(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  for (const def of LABEL_DEFS) {
    const raw = String(formData.get(`label_${def.key}`) ?? "").trim();
    if (!raw || raw === def.def) {
      await prisma.label.deleteMany({ where: { key: def.key } });
    } else {
      await prisma.label.upsert({
        where: { key: def.key },
        update: { value: raw },
        create: { key: def.key, value: raw },
      });
    }
  }
  revalidatePath("/", "layout");
  redirect("/admin?saved=1");
}

export async function approveTag(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("tagId") ?? "");
  if (id) await prisma.tag.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin");
}

export async function rejectTag(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("tagId") ?? "");
  if (id) await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin");
}

// Moderation: Beitrag ausblenden / wiederherstellen / endgültig löschen.
export async function hidePost(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("postId") ?? "");
  if (id) await prisma.post.update({ where: { id }, data: { hidden: true } });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function unhidePost(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("postId") ?? "");
  if (id) await prisma.post.update({ where: { id }, data: { hidden: false } });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

export async function deletePost(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("postId") ?? "");
  if (id) await prisma.post.delete({ where: { id } });
  revalidatePath("/", "layout");
  revalidatePath("/admin");
}

// Nutzer:in freischalten (manuelle Freigabe — Kern des Identitäts-Modells).
export async function approveUser(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("userId") ?? "");
  if (id) await prisma.user.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}

// Freigabe zurücknehmen.
export async function revokeUser(formData: FormData): Promise<void> {
  if (!(await isAdmin())) return;
  const id = String(formData.get("userId") ?? "");
  if (id) await prisma.user.update({ where: { id }, data: { approved: false } });
  revalidatePath("/admin");
  revalidatePath("/", "layout");
}
