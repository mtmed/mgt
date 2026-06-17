import { z } from "zod";

// Validierung der Schleifen-Eingaben. Fehlermeldungen deutsch (UI-Sprache).

export const createPostSchema = z
  .object({
    intent: z.enum(["SEEK", "GIVE", "PAUSE"]),
    text: z
      .string()
      .trim()
      .min(10, "Bitte schreibe etwas mehr (mind. 10 Zeichen).")
      .max(4000, "Das ist zu lang (max. 4000 Zeichen)."),
    isPseudonym: z.boolean().default(false),
  })
  // Pseudonym ist nur beim „Input holen" (SEEK) erlaubt.
  .transform((v) => ({
    ...v,
    isPseudonym: v.intent === "SEEK" ? v.isPseudonym : false,
  }));

export const createAnswerSchema = z.object({
  postId: z.string().min(1, "Fehlende Beitrags-Referenz."),
  text: z.string().trim().min(2, "Die Antwort ist zu kurz."),
});

export const SOURCE_RELATIONS = ["MATCHES", "EXCEEDS", "DIVERGES"] as const;

// Quelle (§7): Titel + optionaler Link + Beziehung zur Leitlinie.
// Bei „weicht bewusst ab" (DIVERGES) ist der Grund Pflicht.
export const createSourceSchema = z
  .object({
    title: z.string().trim().min(2, "Bitte einen Quellentitel angeben."),
    url: z
      .union([z.string().trim().url("Bitte eine gültige URL angeben."), z.literal("")])
      .optional()
      .transform((v) => (v ? v : undefined)),
    relation: z.enum(SOURCE_RELATIONS),
    reason: z
      .string()
      .trim()
      .optional()
      .transform((v) => (v ? v : undefined)),
  })
  .refine((d) => d.relation !== "DIVERGES" || (d.reason?.length ?? 0) >= 3, {
    message: "Bei bewusster Abweichung bitte kurz den Grund angeben.",
    path: ["reason"],
  });

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
export type CreateSourceInput = z.infer<typeof createSourceSchema>;
