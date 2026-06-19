// Anonymisierungs-Nudge (§6a) — Muster-Detektor, KEIN Wörterbuch.
// Erkennt strukturelle Identifikatoren (Rechtsform, Anrede+Name, E-Mail, PLZ+Ort,
// Datum, SVNR) statt Namenslisten — das vermeidet Alarm-Müdigkeit durch Fehlalarme
// bei Alltagswörtern (Bauer, Koch, Wagner …).
//
// WICHTIG: Diese Funktion läuft ausschließlich clientseitig und ihre Treffer
// werden NIEMALS geloggt oder versendet (§9, Profiling-rote-Linie). Reine,
// nebenwirkungsfreie Funktion — leicht testbar.

export type AnonHit = { sig: string; hint?: string };

export function detectIdentifiers(text: string): AnonHit[] {
  const hits: AnonHit[] = [];

  if (
    /\b(GmbH|GesmbH|AG|KG|OG)\b/.test(text) ||
    /\be\.U\./.test(text) ||
    /\bFa\.\s/.test(text)
  ) {
    hits.push({ sig: "Rechtsform (GmbH/AG/…)", hint: "möglicher Firmenname" });
  }

  if (/\b(Herr|Frau|Hr\.|Fr\.)\s+[A-ZÄÖÜ][a-zäöüß]+/.test(text)) {
    hits.push({ sig: "Anrede + Name", hint: "möglicher Personenname" });
  }

  if (/[\w.\-]+@[\w.\-]+\.\w{2,}/.test(text)) {
    hits.push({ sig: "E-Mail-Adresse" });
  }

  // Österr. PLZ = 4 Ziffern, gefolgt von einem Ortsnamen (Großbuchstabe).
  if (/\b\d{4}\s+[A-ZÄÖÜ][a-zäöüß]+/.test(text)) {
    hits.push({ sig: "PLZ + Ort" });
  }

  if (/\b\d{1,2}\.\d{1,2}\.\d{2,4}\b/.test(text)) {
    hits.push({ sig: "Datum", hint: "evtl. Geburtsdatum" });
  }

  // Österr. Sozialversicherungsnummer: 10 Ziffern (4 lfd. + Geburtsdatum).
  if (/\b\d{10}\b/.test(text)) {
    hits.push({ sig: "Versicherungsnummer", hint: "10-stellig (SVNR)" });
  }

  return hits;
}
