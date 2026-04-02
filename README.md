# Kebab-Bestellung – Netlify + echte WhatsApp-Zustellung

Diese Version speichert Bestellungen wie bisher in Netlify Blobs und stößt zusätzlich **serverseitig** eine WhatsApp-Bestellbestätigung an.

## Wichtig

Im Repository soll für Netlify **nur diese Function-Datei** liegen:
- `netlify/functions/orders.js`

Diese Datei darf **nicht** vorhanden sein:
- `netlify/functions/orders.mjs`
- `netlify/functions/orders.cjs`
- `orders.js` im Projekt-Root

`package.json` enthält weiterhin **kein** `"type": "module"`.

## Netlify-Umgebungsvariablen

Pflicht:
- `ADMIN_PIN=2610`
- `WHATSAPP_PHONE_NUMBER_ID=...`
- `WHATSAPP_ACCESS_TOKEN=...`
- `WHATSAPP_TEMPLATE_NAME=order_confirmation`
- `WHATSAPP_TEMPLATE_LANGUAGE=de` oder z. B. `de_DE` (muss exakt zum Template passen)

Optional:
- `WHATSAPP_API_VERSION=v25.0`
- `WHATSAPP_DEFAULT_COUNTRY_CODE=49`
- `WHATSAPP_BUSINESS_NAME=ARP Döner`

## Empfohlene WhatsApp-Template-Struktur

Kategorie: **Utility**

Name-Beispiel: `order_confirmation`

Body-Beispiel:

```text
Hallo {{1}},

deine Bestellung wurde aufgenommen.
Bestelltermin: {{2}}

Deine Bestellung:
{{3}}

Gesamt: {{4}}
Bezahlt: {{5}}
{{6}}

Vielen Dank für deine Bestellung!
```

Die App füllt diese Platzhalter automatisch:
1. Mitarbeitername
2. Bestelltermin
3. Artikelliste inklusive Wünsche
4. Gesamtsumme
5. Bezahlt-Betrag
6. Rückgeld / Offen / passend bezahlt

## Meta / WhatsApp vorbereiten

1. WhatsApp Business Platform in Meta einrichten
2. Business-Telefonnummer registrieren
3. Template in WhatsApp Manager anlegen und freigeben lassen
4. Dauerhaften **System User Access Token** erzeugen
5. `PHONE_NUMBER_ID` und Token in Netlify eintragen

## Health-Check

Öffnen:
- `/.netlify/functions/orders?health=1`
- `/.netlify/functions/orders?health=1&pin=2610`

Die Antwort zeigt jetzt zusätzlich:
- ob `ADMIN_PIN` gesetzt ist
- ob die WhatsApp-Konfiguration vollständig ist
- welche WhatsApp-Variablen noch fehlen
- welche API-Version genutzt wird

## Verhalten in der App

- Gibt der Nutzer eine Handynummer ein, wird die Bestellung gespeichert und danach serverseitig per WhatsApp verschickt.
- Im Adminbereich wird der Versandstatus mit angezeigt.
- Falls die WhatsApp-Konfiguration fehlt, bleibt die Bestellung trotzdem gespeichert.

## Hinweis für echte Produktion

Außerhalb des 24-Stunden-Servicefensters sollte für Erstkontakt oder Re-Engagement ein freigegebenes Template genutzt werden. Genau dafür ist diese Version gebaut.
