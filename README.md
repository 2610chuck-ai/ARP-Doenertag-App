# Kebab-Bestellung – Netlify stabiler Fix

Wichtig für den Deploy:

- Im Repository darf **nur** diese Function-Datei liegen:
  - `netlify/functions/orders.js`
- Diese Datei darf **nicht** vorhanden sein:
  - `netlify/functions/orders.mjs`
  - `netlify/functions/orders.cjs`
  - `orders.js` im Projekt-Root
- `package.json` enthält **kein** `"type": "module"`

Netlify Umgebungsvariable:
- `ADMIN_PIN=2610`

Test:
- `/.netlify/functions/orders?health=1`
- `/.netlify/functions/orders?health=1&pin=2610`
