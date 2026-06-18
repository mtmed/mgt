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

## Aktueller Stand
- Datenmodell: `Post` (Intent SEEK/GIVE/PAUSE, Status OPEN/SOLVED), `Answer`,
  `Endorsement` (aggregiert), `Source` (url+relation), `PauseReaction` — `prisma/schema.prisma`.
  Register (Fach/Pause) und Typ (Fall/Info) werden aus `intent` abgeleitet.
- 3 freigeschaltete Seed-Nutzer:innen (`src/lib/users.ts`) + Cookie-Umschalter im Header.
  Echtes Login (Magic-Link + manuelle Freischaltung) = nächster Schritt.
- Kernschleife live: Feed (Tag/Fach/Pause) → Intent-Fork → posten → namentlich
  antworten → „gelöst" (nur Fragende) → Konsens-Bänder. Pause: „haben geschmunzelt".
- PWA: Manifest + Service Worker (installierbar, noch kein Push).
- **Noch offen (Schicht 2):** Quelle/Divergenz-UI (§7), Anonymisierungs-Nudge (§6a),
  echtes Login. §10-Punkte als TODO offen (Quelle=Freitext, Default-Tab=Tag).
- Hinweis: Neon-DB enthält aktuell Testbeiträge aus der Verifikation (löschbar).

## Technik-Notizen (verbindlich)
- **Prisma 7**: Verbindungs-URL NICHT im Schema, sondern in `prisma.config.ts`.
  Laufzeit-Client verbindet über Driver-Adapter `@prisma/adapter-pg` (node-postgres);
  kein eingebauter Rust-Query-Engine mehr. `src/lib/prisma.ts` liest `DATABASE_URL`.
- **Migrationen**: lokal `npm run db:migrate` (legt SQL an + wendet an Neon an).
  Schema lebt in derselben Neon-DB, die auch Vercel nutzt → kein Migrate im Build nötig.
- **Build**: `postinstall` ruft `prisma generate` (auch auf Vercel). `DATABASE_URL`
  muss in Vercel gesetzt sein, sonst schlägt schon `prisma generate` fehl (env() in config).
- **Vercel-Env-Var setzen**: NICHT editieren (speichert die Maskierungs-`****` als Wert) —
  immer löschen + neu anlegen. Sonst `28P01 password authentication failed`.
- **EU-Region (Art. 9)**: Vercel-Funktionen auf `fra1` (Frankfurt) festnageln — Default ist USA.
- **Schrift**: System-Font-Stack statt `next/font/google` (offline-/build-robust, datensparsam).
- **Repo**: GitHub `mtmed/mgt` (Branch `main`). Hosting: Vercel.
- `.env` (mit `DATABASE_URL`) ist gitignored; in Vercel als Env-Var pflegen.

---

## Verbindliche Design-Spec
`DESIGN_DECISIONS.md` ist die **einzige Quelle der Wahrheit** für Design, Wording und
Verhalten; `CLAUDE_CODE_BRIEF.md` ist der Arbeitsauftrag. Vor Code IMMER lesen. Lücken =
§10 (offene Punkte): **nachfragen statt entscheiden**. Identität/Zugang im MVP:
**manuelle Freischaltung durch einen Menschen** — kein automatisches Verifizierungssystem.

### §1 Grundprinzipien (steuern alles)
1. **Eine Schleife, gesehen.** Anerkennung fließt durch dieselbe Handlung, die Wissen
   schafft. Belohne Hilfe, nicht Applaus. Keine Likes, keine Engagement-Köder, keine Vanity-Metriken.
2. **Farbsemantik — jede Farbe genau eine Bedeutung:**
   - **Gelb** = *verdiente menschliche Anerkennung* (`würde ich genauso machen`, `gelöst`).
     Reserviert. Nie dekorativ, nie im Pause-Register.
   - **Kobalt / neutral** = *Fakt & Struktur* (Quelle, Typ-Labels, Navigation, Divergenz-Hinweis).
   - **Terrakotta** = *Pause-Register* (das Leichte, Menschliche).
3. **Anerkennung wird aggregiert** und als qualitatives **Band** gezeigt (§5a), nie als
   individueller Score und nie namentlich — „viele Kolleg:innen“, **nicht wer**, **nicht wie viele genau**.
4. **Fragen pseudonym möglich, Antworten immer namentlich.**
5. **Im Pause-Register: kein Gelb, keine Zahl.** Nur Gesichter.
6. **Avatare aus vielfältiger Hauttonpalette** — nie ein einzelner „Flesh“-Ton.

### §8 Wording-Glossar (kanonisch ✅ / verworfen ❌)
- `würde ich genauso machen` ✅ — ❌ „mache ich auch so“, „fachlich bestätigt“
- `Quelle` ✅ — ❌ „belegt“
- `Tag / Fach / Pause` ✅ — ❌ „Gemischt“
- `gelöst` ✅ — ❌ „erledigt“, „beantwortet“
- `Frage / Info` ✅ (Compose-Intents; früher „Input holen/geben") — ❌ technische Typennamen im UI
- `haben geschmunzelt` ✅ — ❌ „gefällt mir“, „👍“

---

@AGENTS.md
