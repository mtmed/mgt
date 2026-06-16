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

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
