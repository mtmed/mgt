import { z } from "zod";

// Validierungsschemata für die Schleifen-Eingaben.
// Fehlermeldungen auf Deutsch (UI-Sprache).

export const createCaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Bitte gib einen aussagekräftigen Titel ein (mind. 5 Zeichen).")
    .max(160, "Der Titel ist zu lang (max. 160 Zeichen)."),
  setting: z
    .string()
    .trim()
    .max(120, "Das Setting ist zu lang (max. 120 Zeichen).")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  body: z
    .string()
    .trim()
    .min(10, "Bitte beschreibe den Fall etwas ausführlicher (mind. 10 Zeichen)."),
});

export const createAnswerSchema = z.object({
  caseId: z.string().min(1, "Fehlende Fall-Referenz."),
  body: z
    .string()
    .trim()
    .min(2, "Die Antwort ist zu kurz."),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type CreateAnswerInput = z.infer<typeof createAnswerSchema>;
