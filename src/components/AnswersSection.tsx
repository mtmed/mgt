"use client";

import Link from "next/link";
import { useOptimistic, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { createAnswer } from "@/lib/actions";
import { Avatar } from "@/components/Avatar";
import { EndorseButton } from "@/components/EndorseButton";

export type AnswerView = {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  dateLabel: string;
  endorsementCount: number;
  mineEndorsed: boolean;
  pending?: boolean;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Wird gesendet …" : "Antwort abschicken"}
    </button>
  );
}

export function AnswersSection({
  postId,
  answers,
  currentUser,
}: {
  postId: string;
  answers: AnswerView[];
  currentUser: { id: string; name: string } | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [optimistic, addOptimistic] = useOptimistic(
    answers,
    (state, text: string): AnswerView[] => [
      ...state,
      {
        id: `optim-${state.length}`,
        text,
        authorId: currentUser?.id ?? "",
        authorName: currentUser?.name ?? "Du",
        dateLabel: "",
        endorsementCount: 0,
        mineEndorsed: false,
        pending: true,
      },
    ],
  );

  async function submit(formData: FormData) {
    const text = String(formData.get("text") ?? "").trim();
    if (!text) return;
    setError(null);
    addOptimistic(text);
    formRef.current?.reset();
    const res = await createAnswer({}, formData);
    if (res?.error) setError(res.error);
  }

  return (
    <>
      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">
          Antworten ({optimistic.length})
        </h2>
        {optimistic.length === 0 ? (
          <p className="rounded-[12px] border border-dashed border-border-soft bg-white p-4 text-sm text-muted">
            Noch keine Antworten. Sei die erste namentliche Antwort.
          </p>
        ) : (
          <ul className="space-y-3">
            {optimistic.map((a) => (
              <li
                key={a.id}
                className={`rounded-[12px] border border-border-soft bg-white p-4 ${
                  a.pending ? "opacity-60" : ""
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {a.text}
                </p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                  <Avatar id={a.authorId} name={a.authorName} size={20} />
                  {a.authorName} · {a.pending ? "wird gesendet …" : a.dateLabel}
                </p>
                {!a.pending && (
                  <div className="mt-3">
                    <EndorseButton
                      target={{ answerId: a.id }}
                      redirectPostId={postId}
                      active={a.mineEndorsed}
                      count={a.endorsementCount}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-[12px] border border-border-soft bg-white p-5">
        <h2 className="mb-3 text-base font-semibold">Antwort hinzufügen</h2>
        {currentUser ? (
          <form ref={formRef} action={submit} className="space-y-3">
            <input type="hidden" name="postId" value={postId} />
            <textarea
              name="text"
              rows={4}
              required
              placeholder="Teile deine fachliche Einschätzung."
              className="w-full rounded-md border border-border-soft bg-white px-3 py-2 text-sm focus:border-kobalt focus:outline-none focus:ring-1 focus:ring-kobalt"
            />
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <SubmitButton />
          </form>
        ) : (
          <p className="text-sm text-muted">
            Zum Antworten bitte{" "}
            <Link href="/anmelden" className="text-kobalt hover:underline">
              anmelden
            </Link>
            .
          </p>
        )}
      </section>
    </>
  );
}
