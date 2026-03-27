# Kebap-Bestellung – Netlify only

Diese Version ist fertig für Netlify:
- Mitarbeiter wählen
- komplette Speisekarte antippen
- Sonderwünsche eintragen
- bezahlten Betrag erfassen
- Donnerstag 10:00 Uhr Logik
- Azubi-Seite mit PIN
- WhatsApp-Export
- Datenspeicherung über Netlify Functions + Netlify Blobs

## Start

1. Projekt nach GitHub hochladen
2. In Netlify importieren
3. Umgebungsvariable setzen:
   - `ADMIN_PIN=2610`
4. In `config.js` die WhatsApp-Nummer eintragen
5. Deploy auslösen

## Wichtige Dateien

- `index.html` – Bestellseite
- `azubi.html` – Verwaltungsseite
- `data.js` – Mitarbeiter und Speisekarte
- `app.js` – Logik der Bestellseite
- `admin.js` – Azubi-Verwaltung
- `netlify/functions/orders.js` – Speicherung / Laden / Löschen

## Hinweis

Wenn `demoMode` in `config.js` auf `true` steht, wird lokal im Browser gespeichert.
Für den Live-Betrieb auf Netlify sollte `demoMode: false` aktiv bleiben.
