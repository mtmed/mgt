# bada bup — Design- & Wording-Entscheidungen

> Spezifikation zum Einpflegen in Claude Code (walking skeleton).
> Kanonische Quelle für Farb-Tokens, Komponenten, Copy-Strings und Verhaltensregeln.
> Stand: 16. Juni 2026.

---

## 1. Grundprinzipien (steuern alles Weitere)

1. **Eine Schleife, gesehen.** Anerkennung fließt durch dieselbe Handlung, die das Wissen schafft. Belohne Hilfe, nicht Applaus. Keine generischen Likes, keine Engagement-Köder, keine Vanity-Metriken.
2. **Farbsemantik — jede Farbe trägt genau eine Bedeutung:**
   - **Gelb** = *verdiente menschliche Anerkennung* (`würde ich genauso machen`, `gelöst`). Reserviert. Nie dekorativ, nie im Pause-Register.
   - **Kobalt / neutral** = *Fakt & Struktur* (Quelle, Typ-Labels, Navigation, Divergenz-Hinweis).
   - **Terrakotta** = *Pause-Register* (das Leichte, Menschliche).
3. **Anerkennung wird aggregiert** und als qualitatives **Band** gezeigt (§5a), nie als individueller Score und nie namentlich — „viele Kolleg:innen“, **nicht wer** und **nicht wie viele genau**.
4. **Fragen pseudonym möglich, Antworten immer namentlich.**
5. **Im Pause-Register: kein Gelb, keine Zahl.** Nur Gesichter.
6. **Avatare ziehen aus einer vielfältigen Hauttonpalette** — nie ein einzelner „Flesh“-Ton.

---

## 2. Design-Tokens

```css
:root {
  /* Marke */
  --kobalt:      #1E46E0;  /* Held: Text, Struktur, Navigation, Fach-Akzent */
  --eisblau:     #C7D6FF;  /* Fläche, Avatar-Tints, Fach-Support */
  --kreme:       #FBF6EC;  /* Standard-Hintergrund (warm, nicht Weiß) */
  --gelb:        #FFC21F;  /* Funke: verdiente Anerkennung. Fill mit Ink-Text */
  --ink:         #15233B;  /* Primärtext */
  --muted:       #6B7280;  /* Sekundärtext */

  /* Pause-Register (Terrakotta) */
  --terra:       #BE6B4A;  /* Akzent */
  --terra-deep:  #8A4326;  /* Text auf hellem Grund */
  --sand:        #FDF5EE;  /* Pause-Kartenfläche */
  --sand-warm:   #F6E7D8;  /* erwärmter Hintergrund bei aktivem Pause-Tab */

  /* Flächen & Karten */
  --bg-fach:     #FBF8F1;  /* Hintergrund bei aktivem Fach-Tab */
  --card-fach:   #FFFFFF;  /* Fach-Kartenfläche */
  --border-soft: #E7E2D6;  /* Kartenrand */
  --border-pause:#E4C3B2;  /* gestrichelter Rand Pause-Karte */

  /* Chips & Hinweise */
  --chip-neutral-bg:   #EDF0F5;  --chip-neutral-fg: #44506A;  /* Typ-Label */
  --chip-quelle-bg:    #E8EEFC;  --chip-quelle-bd:  #C9D8F7;  /* Quelle (Kobalt) */
  --chip-pause-bg:     #F2DDD1;  /* Pause-Tag */
  --diverg-bg:         #F3F6FE;  --diverg-bd: #C9D8F7;  --diverg-fg: #2C3E63;

  /* Radien */
  --r-card: 12px;   /* Fach-Karte */
  --r-pause: 18px;  /* Pause-Karte (runder = weicher) */
  --r-pill: 999px;
  --r-chip: 6px;
}
```

**Avatar-Hauttonpalette** (Initialen-Kreise, rotierend einsetzen):

| Fläche | Initialen-Farbe |
|---|---|
| `#F2C9A0` | `#7A5230` |
| `#E0A878` | `#6A3F1E` |
| `#C98D5E` | `#FFFFFF` |
| `#8A5A38` | `#FFFFFF` |
| `#5E3A22` | `#FFFFFF` |

**Typografie:** System-Stack (`-apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`), zwei Gewichte (400/600). Keine dritte Schrift.

---

## 3. Navigation — drei Reiter als Filter

Ein Feed, drei Linsen. Default = **Tag** (das „Wir“ zuerst; bei Bedarf später konfigurierbar).

| Tab | Filter | Aktiv-Farbe | Hintergrund | Stimmungszeile |
|---|---|---|---|---|
| **Tag** | alle | `--ink` | `--kreme` | „Dein Berufstag — alles in einem Strom.“ |
| **Fach** | nur Fach | `--kobalt` | `--bg-fach` | „Gelöste Fälle und geteiltes Wissen.“ |
| **Pause** | nur leicht | `--terra-deep` | `--sand-warm` | „Kurz durchatmen. Hier zählt nichts.“ |

- Aktiver Tab: Farbe + Unterstrich in der jeweiligen Register-Farbe.
- Tab-Punkte als Vorschau der Farbsprache: Fach = Kobalt-Punkt, Pause = Terrakotta-Punkt, Tag = kein Punkt.
- Wechsel auf Pause **erwärmt die ganze Fläche** weich (Transition ~0.5s). Register-Regeln reisen mit dem Beitrag, nicht mit dem Tab.

---

## 4. Register & Beitragstypen

**Fach** (strukturiert, zählend):
- **Frage/Fall** = *Input holen*. Kann als `gelöst` markiert werden.
- **Info** = *Input geben*. Sammelt `würde ich genauso machen`, kann `Quelle` tragen.
- Karte: `--card-fach`, linke Kante 3px `--kobalt`, Radius `--r-card`.

**Pause** (weich, un-vermessen):
- Karte: `--sand`, **gestrichelter** Rand `--border-pause` (Signal „off the record“), Radius `--r-pause`.
- Reaktion: Gesichter + „haben geschmunzelt“. **Keine Zahl, kein Gelb.** Zählt nicht zur Reputation.

---

## 5. Aktionen & Wording (Kern)

| Aktion / Element | Label (kanonisch) | Darstellung | Regel |
|---|---|---|---|
| Praxis-Zustimmung | **würde ich genauso machen** | gelbe Pill + Konsens-Band (§5a) | **aggregiertes Band**, nie laufende Zahl, nie namentlich |
| Fall-Status | **gelöst** | gelbes Badge + Check | setzt **nur der Fragende**; gelöste Antwort wird kanonischer Korpus-Eintrag |
| Quellenangabe | **Quelle · {Titel}** | Kobalt-Chip (`--chip-quelle-*`) | Fakt-Anker, kein Anerkennungssignal |
| Divergenz | **Divergenz: weicht von {Leitlinie} ab** | Kobalt-Hinweis (`--diverg-*`) | immer **gegen** die Leitlinie sichtbar, mit Grund |
| Divergenz bestätigen | **Abweichung bestätigt · {N}** / **sehe ich anders** | Kobalt-Text / Link | aggregiert; durch Peers bestreitbar |
| Pause-Reaktion | **haben geschmunzelt** | Gesichter (Avatare) | keine Zahl, kein Gelb |
| Typ-Label | **Fall** / **Info** | neutrales Chip (`--chip-neutral-*`) | — |
| Pause-Tag | **Pause** | Terrakotta-Tag (`--chip-pause-bg`) | — |

### 5a. Konsens-Bänder (Praxis-Zustimmung)

Statt einer laufenden Zahl zeigt „würde ich genauso machen“ ein **qualitatives Band** mit **festen Schwellen** (Prototyp-Platzhalter, mit echten Daten kalibrierbar). Immer aggregiert, nie namentlich — einheitlich für konforme **und** divergente Beiträge (kein Modus-Wechsel je Kontext).

| Zustimmungen | Anzeige |
|---|---|
| 0 | keine Angabe (nur die Aktion „würde ich genauso machen“) |
| 1–2 | „Einzelne würden es genauso machen“ |
| 3–9 | „Einige Kolleg:innen würden es genauso machen“ |
| ab 10 | „Viele Kolleg:innen würden es genauso machen“ |

- **Kein** dynamischer, View-/Reichweiten-bezogener Cutoff — das würde die Engagement-Telemetrie einführen, die die Plattform ablehnt.
- Schwellen als zentrale Konstanten halten (eine Stelle zum Kalibrieren).

---

## 6. Beitrag erstellen — Intent-Fork

Erste Frage beim Schreiben: **„Was möchtest du tun?“**

| Intent | Bedeutung | Akzent | Folge |
|---|---|---|---|
| **Frage** | Frage oder Fall | `--kobalt` | später als `gelöst` markierbar; **Pseudonym-Schalter** verfügbar |
| **Info** | Wissen teilen | `--kobalt` | **Quelle anhängen** + Beziehung wählen (s. §7) |
| **Pause** | leicht & menschlich | `--terra` | Fläche erwärmt; kein Gelb, keine Zahl |

- **Pseudonym-Schalter** (nur „Input holen“): Label „Pseudonym fragen“. Hinweis: „Fragen dürfen anonym sein — Antworten sind immer namentlich.“
- Placeholder je Intent: holen „Schildere deine Frage oder deinen Fall…“ · geben „Teile dein Vorgehen oder Wissen…“ · pause „Was geht dir gerade durch den Kopf?“.
- **Anonymisierungs-Pflicht (Fall):** Beim „Input holen“-Fall erscheint ein Leitfaden — **keine Namen, kein namentlicher Betrieb, keine re-identifizierenden Eckdaten** (Kleinbetrieb, exakte Region, Datum). Vor dem Teilen optional eine Bestätigungs-Abfrage. Anonymisierung ist **Pflicht-Mechanismus, keine bloße Zusicherung** (DSGVO Art. 9 — Details in der DSGVO-Roadmap). Dient zugleich der Vision „Loslösung vom Unternehmen“: der Fall handelt von der Sache, nicht von Firma X.
- **Zwei getrennte Schutzschichten — nicht verwechseln:** Der Pseudonym-Schalter schützt die Identität der *fragenden Person*; die Anonymisierung schützt den *Fall-Inhalt* (Patient + Betrieb). Unabhängig voneinander.

### 6a. Anonymisierungs-Nudge (Fall) — wie die Pflicht durchgesetzt wird

Echtzeit-Hinweis beim Schreiben eines Falls. **Muster-Detektor statt Wörterbuch** — *keine* Liste aller Firmen/Nachnamen (zu viele Fehlalarme: Bauer, Koch, Wagner … sind Alltagswörter; Alert-Fatigue tötet den Schutz).

Erkannt werden **Formen, nicht Wörterbuch-Treffer:**
- Rechtsform-Kürzel (GmbH, AG, KG, OG, e.U., „Fa.“) + Eigenname → mögliche Firma
- „Herr/Frau/Hr./Fr.“ + Großgeschriebenes → möglicher Personenname
- E-Mail-, Telefon-, Geburtsdatums-, SV-Nummer-, PLZ+Ort-Muster

**Immer sichtbar (auch ohne Treffer):** kurze Mosaik-Checkliste — keine Kombination aus exakter Betriebsgröße + Region + seltenem Detail. Das ist das eigentliche Re-Identifikations-Risiko, das kein Detektor fängt.

**Nicht verhandelbar:**
- **Hinweis, kein Block.** Sanft nudgen, dann den Autor entscheiden lassen („Überarbeiten“ / „Trotzdem teilen“).
- **Client-seitig**, *bevor* der Text das Gerät verlässt. Treffer **niemals loggen** (Profiling-rote-Linie, §9).

---

## 7. Divergenz-Mechanik

Divergenz wird **nicht erkannt, sondern erklärt** — keine zentrale Instanz urteilt.

**Schritt 1 — Autor erklärt beim Quelle-Anhängen das Verhältnis seiner Praxis zur Leitlinie:**
- `deckt sich` — folgt der Leitlinie
- `geht darüber hinaus` — Leitlinie schweigt zu diesem Fall
- `weicht bewusst ab` — anders als empfohlen → Pflicht-Feld **„Warum? (kurz)“**

**Schritt 2 — Peers bestätigen/bestreiten** (`Abweichung bestätigt · N` / `sehe ich anders`), aggregiert.

**Ausbaustufen:**
- **MVP:** nur Selbstauskunft aus Schritt 1. Keine KI, keine Moderation.
- **Später:** Peer-Markierung als Korrektiv (Schritt 2).
- **Optional/später:** KI *schlägt* mögliche Divergenzen vor → Mensch bestätigt. Nie automatische Behauptung.

**Rechtlich:** „weicht bewusst ab, mit Grund“ ist zugleich die Haftungs-Brandmauer — explizit kollegialer Erfahrungsaustausch, keine Leitlinie/Weisung.

---

## 8. Wording-Glossar — kanonisch vs. verworfen

| Verwenden ✅ | Nicht verwenden ❌ |
|---|---|
| würde ich genauso machen | mache ich auch so · fachlich bestätigt |
| Quelle | belegt |
| Tag / Fach / Pause | Gemischt |
| gelöst | erledigt · beantwortet |
| Frage / Info (Compose-Intents) | (technische Typennamen im UI) |
| haben geschmunzelt | gefällt mir · 👍 |

---

## 9. Internes Messen / Mess-Charta

Messen ist erlaubt — aber nur als Werkzeug der Bauenden und des Commons, nie als Produkt-Oberfläche oder Profiling-Apparat. Zwei strikt getrennte Eimer:

- **A · Produkt-Oberfläche (verboten):** Views, Like-/Reichweiten-Zähler, die Nutzer:innen *sehen*, die den *Feed ranken* oder *Status erzeugen*. Bleibt draußen.
- **B · Interne Instrumentierung (erforderlich):** anonymisierte/aggregierte Telemetrie zum Verstehen und Verbessern der Plattform.

**Die Mauer (nicht verhandelbar):**
- Interne Zahlen informieren *Menschen*, nie den Algorithmus, der Inhalte ausspielt, und nie eine Anzeige zwischen Nutzer:innen.
- Views/Reichweite fließen **nicht** in den Konsens-Band-Cutoff (§5a bleibt fest) und in **kein** user-facing Signal.

**Vision-orientierte Metriken** (Optimierung = Mission, nicht Sucht):
- Anteil Fragen, die „gelöst“ erreichen; Zeit bis zur ersten namentlichen Antwort.
- Retention der Antwortenden — **nicht** DAU / Verweildauer.
- Häufigkeit erklärter & bestätigter Divergenz.
- Impuls-Frequenz je Fachzelle (Cold-Start-Gesundheit).

**Datenschutz by design (Art. 9):**
- Aggregiert, datensparsam, zweckgebunden, retention-begrenzt; in der DPIA dokumentiert.
- **Rote Linie:** kein Verhaltensprofil einer namentlichen Person. „Wer weicht gewohnheitsmäßig ab“ wird **nie** gebaut. Aggregat ja, Personenprofil nein.

**Transparenz als Mitbesitz:**
- Offene Mess-Charta: *was, wozu, wie lange* gemessen wird — für Mitglieder einsehbar, idealerweise mitbestimmt. So wird internes Messen vom Vertrauens-Risiko zum Vertrauens-Beweis.

→ **In die DSGVO-Roadmap übernehmen** (DPIA-Kapitel: Analytics-Zwecke, Rechtsgrundlage, Anonymisierung, Aufbewahrungsfristen).

---

## 10. Offene Punkte — NICHT eigenmächtig festlegen

Diese sind bewusst noch nicht entschieden; im Skeleton offen lassen oder als TODO markieren:

- **Quelle:** Freitext (Titel/Link) vs. kuratierte Leitlinien-Bibliothek zum Auswählen (Letzteres sauberer fürs Zitieren/Divergenz, aber später).
- **Default-Tab:** Empfehlung „Tag“, noch nicht final.
- **Pause-Erstellung:** im selben Compose-Sheet (aktuell) vs. eigener leichter Einstieg.
- **Band-Text auf schmalen Screens:** ggf. Kurzform der Band-Texte (z. B. „einige Kolleg:innen“ ohne den vollen Satz) — Detailfrage, nicht blockierend. Die Pro-Beitrag-Zustimmung selbst ist mit den Konsens-Bändern (§5a) **entschieden**.
- **Kollektive Utility-Kennzahl (Zunft-Ebene):** ob die Zunft *insgesamt* einen kollektiven „proof of work“ ausweist — weiter offen (siehe Projektplan). Betrifft **nicht** die Pro-Beitrag-Zustimmung, die mit §5a entschieden ist.
- **Intensität der Pause-Erwärmung:** Feinjustierung des Sand-Tons.

---

## 11. Beschlossene Erweiterungen (nach der Kernschleife, Juni 2026)

Konkretisierungen einiger §10-Punkte und neue Festlegungen aus der Roadmap:

- **Titel:** **Pflicht im Fach-Register** (Frage/Fall & Info), **keiner im Pause-Register**
  (Titel widerspräche dem Leichten/Off-the-record).
- **Tags:** **kuratiert/hybrid, Markt Österreich** (verankert in ASchG, VGÜ, Verordnungen, AUVA —
  NICHT die deutschen G-Grundsätze). Zwei Achsen:
  - *Untersuchung & Recht:* Gesundheitsüberwachung (VGÜ), Bildschirmarbeit (BS-V),
    Nacht-/Schichtarbeit (NSchG), Lärm & Vibrationen (VOLV), Mutterschutz (MSchG),
    Arbeitsplatzevaluierung (ASchG), Eignung & Tauglichkeit, Berufskrankheit (AUVA).
  - *Themenfelder:* Impfen & Infektionsschutz, Biologische Arbeitsstoffe (VbA),
    Gefahrstoffe & Haut (GKV), Ergonomie & Muskel-Skelett, Psychische Belastung & BGF,
    Sucht & Prävention, Reisemedizin, Wiedereingliederung (fit2work), Recht & Datenschutz.
  - Mehrfach-Tagging. „Neuen Tag vorschlagen“ → `approved=false`, Admin gibt frei.
    Tags sind **Fakt/Struktur → Kobalt** (kein Anerkennungssignal).
- **Fachlicher Korpus:** **eigener Reiter** neben Tag/Fach/Pause, tag-basiert, zeigt die
  gelösten Fälle/Infos (der durchsuchbare Korpus).
- **Bild-Anhänge:** nur **nicht-personenbezogen** (Arbeitsplatz, Gefahrenstelle, Gerät) —
  **keine Patienten-/Personenbilder.** Schutzplanken: EXIF-Strip, Nudge „keine Personen/
  Schilder/Kennzeichen“, Typ-/Größenlimit, EU-Speicher.
- **Kollektive Errungenschaften (Startseite):** zulässig als **rein kollektiver** „Korpus-
  Stand“ (gelöste Fälle / geteilte Erkenntnisse / aktive Themen) — **nie individuell**, kein
  Ranking, keine Reichweite (konkretisiert §10 + bleibt innerhalb §1/§9).
- **„Teilen“:** vorerst **verworfen.**
- **Internes Messen:** als geschützte **Admin-Seite** (§9), nicht als E-Mail/Push.
