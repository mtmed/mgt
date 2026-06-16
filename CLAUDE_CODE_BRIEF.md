# Claude Code — Arbeitsauftrag: bada bup (Walking Skeleton)

## Kontext
bada bup ist ein berufszentriertes Peer-Netzwerk für Arbeitsmedizin & Workplace Health (DACH, Seed: Österreich / ÖGA). Wir bauen das bestehende Walking Skeleton weiter. Stack: **GitHub → Vercel → Neon (Postgres)**. Respektiere die vorhandene Projektstruktur und den Stack.

**Identität & Zugang (MVP):** vorerst **manuelle Account-Freischaltung** durch einen Menschen — **kein** automatisches Verifizierungssystem bauen.

## Kanonische Referenz — zuerst lesen
- `DESIGN_DECISIONS.md` ist die **einzige Quelle der Wahrheit** für Design, Wording und Verhalten. Vollständig lesen, bevor du Code schreibst.
- Übernimm **§1 (Grundprinzipien)** und **§8 (Wording-Glossar)** in `CLAUDE.md`, damit sie in jedem Lauf im Kontext sind.
- Erfinde nichts, was die Spec nicht abdeckt. Bei Lücken gilt §10 (offene Punkte): **nachfragen statt entscheiden.**

## Aufgabe — in dieser Reihenfolge
**Erst die Kernschleife, dann die zweite Schicht.**

1. **Kernschleife (Priorität):**
   - Drei Reiter als Filter: **Tag / Fach / Pause** (Default Tag); Pause erwärmt die Fläche (Terrakotta).
   - Beitrag erstellen mit Intent-Fork: **Input holen** (Frage/Fall) · **Input geben** (Info) · **Pause**.
   - Loop: posten → **namentlich** antworten → **„gelöst"** (setzt nur der/die Fragende).
   - Feed mit **Konsens-Bändern** (§5a, feste Schwellen) — **kein** Zahl-Zähler.
   - Persistenz in Neon; end-to-end lauffähig auf Vercel.
2. **Zweite Schicht (erst danach):**
   - **Quelle** anhängen + Beziehung (deckt sich / geht darüber hinaus / weicht bewusst ab) → **Divergenz-Anzeige** (§7).
   - **Anonymisierungs-Nudge** beim Fall (§6a): client-seitiger Muster-Detektor + Mosaik-Checkliste.

## Harte Regeln — NICHT verletzen
- **Farbsemantik (§1/§2):** Gelb nur *verdiente Anerkennung*; Kobalt *Fakt/System*; Terrakotta *Pause*; Grün nur „ok"-Check. Jede Farbe genau eine Bedeutung.
- **Anerkennung = aggregiertes Band**, nie laufende Zahl, nie namentlich.
- **Kein View-/Reichweiten-Zähler im UI.** Interne Metriken nie user-facing, nie in den Band-Cutoff (§9).
- **Anonymisierungs-Nudge: Muster-Detektor (Regex), KEINE Nachnamen-/Firmen-Wörterbuchliste.** Client-seitig, **Hinweis statt Block**, Treffer **nie loggen**.
- **Kein Verhaltensprofil einer namentlichen Person** (§9, rote Linie).
- **Fragen pseudonym möglich, Antworten immer namentlich.**
- **Wording exakt nach §8** („würde ich genauso machen", „gelöst", „Quelle", „Tag/Fach/Pause", „Input holen/geben"). Verworfene Begriffe vermeiden (z. B. „mache ich auch so", „belegt", „fachlich bestätigt", „Gemischt").
- **EU-Region** bei Vercel & Neon (Art.-9-Gesundheitsdaten) — keine Daten in Nicht-EU-Regionen.
- **§10 (offene Punkte) nicht eigenmächtig entscheiden** — als TODO markieren oder fragen.

## Datenmodell (aus der Spec ableiten, minimal halten)
- `Beitrag`: register (fach/pause), intent (holen/geben/pause), typ (frage_fall/info), status (offen/geloest), author, pseudonym (bool, nur bei „holen"), text, created_at.
- `Antwort`: beitrag_id, author (**immer namentlich**), text.
- `Zustimmung` („würde ich genauso machen"): ziel_id, user_id — **nur aggregiert auslesen** (Band), Einzelpersonen nie anzeigen.
- `Quelle`: beitrag_id, titel/ref, beziehung (deckt_sich / hinaus / weicht_ab), grund?.
- **Konsens-Band** aus Anzahl Zustimmungen, feste Schwellen als **eine zentrale Konstante** (0 / 1–2 / 3–9 / ab 10 → s. §5a).

## Arbeitsweise
- Kleine Commits, nach GitHub pushen (Vercel deployt automatisch).
- Einfach halten — lieber die Schleife sauber als Features breit.
- Bei Unklarheit oder offenem Punkt: kurz fragen, nicht raten.

## Definition of Done (erste Aufgabe)
Ein:e freigeschaltete:r Nutzer:in kann im Tag-Feed einen Fall posten (mit Pseudonym-Option), jemand antwortet namentlich, der/die Fragende markiert „gelöst", und Antworten sammeln Zustimmung, die als **Band** (nicht als Zahl) erscheint — alles persistent in Neon und live auf Vercel.
