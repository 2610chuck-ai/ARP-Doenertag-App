# Kebab-Bestellung – Netlify Only

Diese Version braucht **kein Supabase**.

## Architektur
- `index.html` = Mitarbeiter-Bestellung
- `azubi.html` = Azubi-Verwaltung
- `netlify/functions/orders.js` = API für Speichern / Laden / Löschen
- `Netlify Blobs` = Datenspeicher für die Bestellungen

## Was du in Netlify brauchst
Nur **eine** Umgebungsvariable ist Pflicht:
- `ADMIN_PIN`

Optional:
- eigene Domain
- WhatsApp-Nummer in `config.js`

## Schnellstart
1. Projekt nach GitHub hochladen
2. In Netlify importieren
3. In Netlify unter **Project configuration > Environment variables** setzen:
   - `ADMIN_PIN=2610`
4. Neu deployen
5. In `config.js` `whatsappNumber` eintragen

## Wichtige Seiten
- Mitarbeiter: `/index.html`
- Azubi: `/azubi.html`

## Hinweise
- Pro Mitarbeiter und Bestelltermin gibt es genau **eine** Bestellung.
- Neue Eingabe überschreibt die alte Bestellung für denselben Donnerstag.
- Nach Donnerstag 10:00 Uhr geht die Bestellung automatisch auf den nächsten Donnerstag.
- Der WhatsApp-Button erzeugt aus der Azubi-Seite eine fertige Sammel-Nachricht.

## Lokal testen
Du kannst lokal im Browser auch mit `demoMode: true` testen.
Dann werden Daten nur im Browser gespeichert.
