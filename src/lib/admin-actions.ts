"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin";
import { LABEL_DEFS } from "@/lib/labels";

export type AdminLoginState = { error?: string };

export async function adminLogin(
  _prev: AdminLoginState,
  formData: FormData,
): Promise<AdminLoginState> {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) {
    return { error: "Admin ist nicht konfiguriert (ADMIN_PASSWORD fehlt)." };
  }
  const input = String(formData.get("password") ?? "");
  if (input !== pw) {
    return { error: "Falsches Passwort." };
  }
  (await cookies()).set(ADMIN_COOKIE, pw, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/");
}

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
