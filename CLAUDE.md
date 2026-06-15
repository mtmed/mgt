# bada bup — Projekt-Spec (lebendes Dokument)

## Was wir bauen
Eine berufszentrierte Wissensplattform für Arbeitsmediziner:innen (Start: ÖGA-Zelle,
20–100 verifizierte Kolleg:innen). Zweck dieses Baus (T2): ein dünner, echter
Mehrbenutzer-Bau, der misst, ob Kolleg:innen wiederkommen und beitragen.

## Die Kern-Schleife (das Herz)
Fall einbringen → namentlich antworten → zwei Gültigkeitsachsen + Anerkennung →
gelöster Fall wird durchsuchbarer Teil des gemeinsamen Korpus.

## Nicht verhandelbare Prinzipien
- **Identität trägt:** Mitglieder sind verifiziert. Antworten sind IMMER namentlich.
  Fragen dürfen pseudonym sein — das System kennt intern immer die echte Person.
- **Zwei Achsen getrennt:** Leitlinien-Konformität (Commodity, Haftungs-Brandmauer)
  und Praxis-Validität (das eigentliche Asset). Divergenz wird offen gezeigt.
- **Keine Gamification:** keine Likes, Streaks, Leaderboards, Vanity-Metriken.
  Anerkennung = „hat geholfen" / „sauber gelöst" + ein verdientes Praxis-Siegel.
- **Keine Werbung.** Der Korpus gehört der Kohorte, nicht der Plattform.
- **DSGVO/Art. 9 von Anfang an:** EU-Hosting, kein identifizierbarer Patientenbezug,
  Realidentität geschützt. Auth nie selbst bauen.

## Stack
Next.js (App Router, TypeScript) · Neon Postgres (EU/Frankfurt) · Prisma · Vercel (Hosting) ·
Auth.js (Magic-Link, ab Phase 3) · zod · installierbare PWA · E-Mail + Web-Push (ab Phase 5).
Hosting-Residenz vor dem Pilot (Phase 6) neu prüfen — Vercel/Neon sind US-Firmen mit EU-Region.

## Phasen
0 Fundament · 1 Walking Skeleton · 2 PWA-Hülle · 3 Identität & Zugang ·
4 Volle Schleifen-Tiefe · 5 Retention & Messung · 6 Recht/Härtung · 7 Pilot.
Regel: vertikale Schnitte, nicht alle Module parallel. Jede Phase endet lauffähig.

## Arbeitsweise
Kleine Commits. Vor jedem Schritt kurz erklären. UI deutsch, Code englisch.
Tests für Schleifenlogik und Berechtigungen, sobald die da sind.

## Aktueller Stand (T2)
- Datenmodell minimal (User, Case, Answer) — siehe `prisma/schema.prisma`.
- Demo-Nutzer fest verdrahtet (kein echtes Login bis Phase 3).
- Schleife: Fälle-Liste → Fall anlegen → Fall-Detail mit Antworten.
- PWA: Manifest + Service Worker (installierbar, noch kein Push).

## Technik-Notizen (verbindlich)
- **Prisma 7**: Verbindungs-URL NICHT im Schema, sondern in `prisma.config.ts`.
  Laufzeit-Client verbindet über Driver-Adapter `@prisma/adapter-pg` (node-postgres);
  kein eingebauter Rust-Query-Engine mehr. `src/lib/prisma.ts` liest `DATABASE_URL`.
- **Migrationen**: lokal `npm run db:migrate` (legt SQL an + wendet an Neon an).
  Schema lebt in derselben Neon-DB, die auch Vercel nutzt → kein Migrate im Build nötig.
- **Build**: `postinstall` ruft `prisma generate` (auch auf Vercel). `DATABASE_URL`
  muss in Vercel gesetzt sein, sonst schlägt schon `prisma generate` fehl (env() in config).
- **Schrift**: System-Font-Stack statt `next/font/google` (offline-/build-robust, datensparsam).
- **Repo**: GitHub `mtmed/mgt` (Branch `main`). Hosting: Vercel.
- `.env` (mit `DATABASE_URL`) ist gitignored; in Vercel als Env-Var pflegen.

---

@AGENTS.md
