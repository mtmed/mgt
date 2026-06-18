"use client";

import { useTransition } from "react";
import { acceptKodex } from "@/lib/actions";

// Einmaliger Erst-Screen mit dem Kodex (Grundprinzipien). Wird nach Bestätigung
// per Cookie nicht mehr gezeigt.
export function Onboarding() {
  const [pending, startTransition] = useTransition();

  const points: { title: string; body: string }[] = [
    {
      title: "Identität trägt",
      body: "Antworten sind immer namentlich. Fragen dürfen pseudonym sein — das System kennt intern die echte Person.",
    },
    {
      title: "Anonymisierungs-Pflicht",
      body: "Keine Namen, kein namentlicher Betrieb, keine re-identifizierenden Patientendaten. Der Fall handelt von der Sache.",
    },
    {
      title: "Zwei Achsen",
      body: "Leitlinien-Konformität (Quelle & offen gezeigte Divergenz) und Praxis-Validität („würde ich genauso machen“) — getrennt.",
    },
    {
      title: "Keine Gamification",
      body: "Anerkennung erscheint als qualitatives Band, nie als Score, Like oder Rangliste. Belohnt wird Hilfe, nicht Applaus.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div className="anim-in w-full max-w-md rounded-[16px] border border-border-soft bg-kreme p-5 shadow-lg">
        <h2 className="text-lg font-semibold">Willkommen bei bada bup</h2>
        <p className="mt-1 text-sm text-muted">
          Ein berufszentrierter Ort für Arbeitsmedizin. Kurz, worauf wir uns
          gemeinsam verlassen:
        </p>

        <ul className="mt-4 space-y-3">
          {points.map((p) => (
            <li key={p.title} className="text-sm">
              <span className="font-semibold">{p.title}.</span>{" "}
              <span className="text-muted">{p.body}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => acceptKodex())}
          className="mt-5 w-full rounded-md bg-kobalt px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Einen Moment …" : "Verstanden — los geht’s"}
        </button>
      </div>
    </div>
  );
}
