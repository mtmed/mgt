"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDemoUser } from "@/lib/demo-user";
import { createAnswerSchema, createCaseSchema } from "@/lib/validation";

// Rückgabeform für Formular-Fehler (wird via useActionState in der UI gezeigt).
export type FormState = {
  error?: string;
};

export async function createCase(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createCaseSchema.safeParse({
    title: formData.get("title"),
    setting: formData.get("setting"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const author = await getDemoUser();

  const created = await prisma.case.create({
    data: {
      title: parsed.data.title,
      setting: parsed.data.setting,
      body: parsed.data.body,
      authorId: author.id,
    },
  });

  revalidatePath("/");
  redirect(`/cases/${created.id}`);
}

export async function createAnswer(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = createAnswerSchema.safeParse({
    caseId: formData.get("caseId"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." };
  }

  const author = await getDemoUser();

  await prisma.$transaction([
    prisma.answer.create({
      data: {
        body: parsed.data.body,
        caseId: parsed.data.caseId,
        authorId: author.id,
      },
    }),
    // Sobald eine Antwort existiert, gilt der Fall als beantwortet.
    prisma.case.updateMany({
      where: { id: parsed.data.caseId, status: "OPEN" },
      data: { status: "ANSWERED" },
    }),
  ]);

  revalidatePath(`/cases/${parsed.data.caseId}`);
  revalidatePath("/");
  return {};
}
