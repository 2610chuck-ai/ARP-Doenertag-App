const { getStore } = require('@netlify/blobs');

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8'
};

function json(statusCode, payload) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

function getStoreInstance() {
  return getStore({
    name: 'kebab-orders',
    consistency: 'strong'
  });
}

function getAdminPin(headers = {}) {
  return headers['x-admin-pin'] || headers['X-Admin-Pin'] || '';
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function cleanText(value, maxLength = 200) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function cleanAmount(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric < 0) {
    throw new Error('Ungültiger Betrag.');
  }
  return Number(numeric.toFixed(2));
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function buildOrderKey(employeeName, targetDate) {
  return `${targetDate}/${slugify(employeeName) || 'mitarbeiter'}`;
}

function requireAdmin(event) {
  const expectedPin = process.env.ADMIN_PIN;
  if (!expectedPin) {
    throw new Error('ADMIN_PIN fehlt in den Netlify-Umgebungsvariablen.');
  }

  return getAdminPin(event.headers) === expectedPin;
}

async function readOrder(store, key) {
  const raw = await store.get(key, { consistency: 'strong' });
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function handleCreate(event) {
  const store = getStoreInstance();
  const body = JSON.parse(event.body || '{}');

  const employee_name = cleanText(body.employee_name, 120);
  const category = cleanText(body.category, 80);
  const menu_item_id = cleanText(body.menu_item_id, 40);
  const menu_item_name = cleanText(body.menu_item_name, 180);
  const notes = cleanText(body.notes, 600);
  const target_order_date = cleanText(body.target_order_date, 10);

  if (!employee_name || !category || !menu_item_id || !menu_item_name) {
    return json(400, { error: 'Pflichtfelder fehlen.' });
  }

  if (!isValidDate(target_order_date)) {
    return json(400, { error: 'Ungültiges Bestelldatum.' });
  }

  const price = cleanAmount(body.price);
  const amount_paid = cleanAmount(body.amount_paid);
  const id = buildOrderKey(employee_name, target_order_date);
  const existing = await readOrder(store, id);

  const payload = {
    id,
    employee_name,
    category,
    menu_item_id,
    menu_item_name,
    price,
    notes,
    amount_paid,
    target_order_date,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await store.setJSON(id, payload);

  return json(200, {
    ok: true,
    mode: existing ? 'updated' : 'created',
    order: payload
  });
}

async function handleList(event) {
  if (!requireAdmin(event)) {
    return json(401, { error: 'PIN ungültig.' });
  }

  const store = getStoreInstance();
  const targetDate = cleanText(event.queryStringParameters?.targetDate, 10);
  const prefix = targetDate && isValidDate(targetDate) ? `${targetDate}/` : undefined;

  const { blobs } = await store.list(prefix ? { prefix } : {});
  const orders = (
    await Promise.all(
      (blobs || []).map(async (blob) => {
        const entry = await readOrder(store, blob.key);
        return entry;
      })
    )
  )
    .filter(Boolean)
    .sort((a, b) => {
      const byName = String(a.employee_name).localeCompare(String(b.employee_name), 'de');
      if (byName !== 0) return byName;
      return String(b.updated_at || '').localeCompare(String(a.updated_at || ''));
    });

  return json(200, { ok: true, orders });
}

async function handleDelete(event) {
  if (!requireAdmin(event)) {
    return json(401, { error: 'PIN ungültig.' });
  }

  const store = getStoreInstance();
  const body = JSON.parse(event.body || '{}');
  const id = cleanText(body.id, 160);

  if (!id) {
    return json(400, { error: 'ID fehlt.' });
  }

  await store.delete(id);
  return json(200, { ok: true });
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === 'POST') return await handleCreate(event);
    if (event.httpMethod === 'GET') return await handleList(event);
    if (event.httpMethod === 'DELETE') return await handleDelete(event);
    return json(405, { error: 'Methode nicht erlaubt.' });
  } catch (error) {
    return json(500, { error: error.message || 'Unbekannter Serverfehler.' });
  }
};
