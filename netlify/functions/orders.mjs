import { getStore } from '@netlify/blobs';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

function getAdminPin(req) {
  const url = new URL(req.url);
  return req.headers.get('x-admin-pin') || url.searchParams.get('pin') || '';
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function cleanText(value, maxLength = 200) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function cleanAmount(value) {
  const numeric = Number(String(value).replace(',', '.'));
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

function requireAdmin(req) {
  const expectedPin = String(process.env.ADMIN_PIN || '').trim();
  if (!expectedPin) {
    throw new Error('ADMIN_PIN fehlt in den Netlify-Umgebungsvariablen.');
  }

  return String(getAdminPin(req)).trim() === expectedPin;
}

function getStoreInstance() {
  return getStore({
    name: 'kebab-orders'
  });
}

async function readOrder(store, key) {
  const raw = await store.get(key);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function normalizeItems(body) {
  if (Array.isArray(body.items) && body.items.length) {
    return body.items.map((item, index) => ({
      cart_item_id: cleanText(item.cart_item_id, 80) || `item-${index + 1}`,
      category: cleanText(item.category, 80),
      menu_item_id: cleanText(item.menu_item_id, 40),
      menu_item_name: cleanText(item.menu_item_name, 180),
      price: cleanAmount(item.price),
      notes: cleanText(item.notes, 600)
    }));
  }

  const category = cleanText(body.category, 80);
  const menu_item_id = cleanText(body.menu_item_id, 40);
  const menu_item_name = cleanText(body.menu_item_name, 180);

  if (!category || !menu_item_id || !menu_item_name) {
    return [];
  }

  return [
    {
      cart_item_id: cleanText(body.cart_item_id, 80) || 'item-1',
      category,
      menu_item_id,
      menu_item_name,
      price: cleanAmount(body.price),
      notes: cleanText(body.notes, 600)
    }
  ];
}

async function handleHealth(req) {
  let adminOk = false;
  try {
    adminOk = requireAdmin(req);
  } catch {
    adminOk = false;
  }

  return json(200, {
    ok: true,
    function: 'orders',
    adminPinConfigured: Boolean(String(process.env.ADMIN_PIN || '').trim()),
    adminAuthorized: adminOk,
    method: req.method
  });
}

async function handleCreate(req) {
  const store = getStoreInstance();
  const body = await req.json().catch(() => ({}));

  const employee_name = cleanText(body.employee_name, 120);
  const target_order_date = cleanText(body.target_order_date, 10);
  const items = normalizeItems(body);

  if (!employee_name || !items.length) {
    return json(400, { error: 'Pflichtfelder fehlen.' });
  }

  if (!isValidDate(target_order_date)) {
    return json(400, { error: 'Ungültiges Bestelldatum.' });
  }

  const customer_phone = cleanText(body.customer_phone, 40).replace(/[^\d+]/g, '');
  const amount_paid = cleanAmount(body.amount_paid);
  const total_price = Number(items.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2));
  const id = buildOrderKey(employee_name, target_order_date);
  const existing = await readOrder(store, id);

  const payload = {
    id,
    employee_name,
    customer_phone,
    items,
    total_price,
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

async function handleList(req) {
  if (!requireAdmin(req)) {
    return json(401, { error: 'PIN ungültig.' });
  }

  const store = getStoreInstance();
  const url = new URL(req.url);
  const targetDate = cleanText(url.searchParams.get('targetDate'), 10);
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

async function handleDelete(req) {
  if (!requireAdmin(req)) {
    return json(401, { error: 'PIN ungültig.' });
  }

  const store = getStoreInstance();
  const body = await req.json().catch(() => ({}));
  const id = cleanText(body.id, 160);

  if (!id) {
    return json(400, { error: 'ID fehlt.' });
  }

  await store.delete(id);
  return json(200, { ok: true });
}

export default async (req, context) => {
  try {
    const url = new URL(req.url);

    if (req.method === 'OPTIONS') {
      return new Response('', { status: 204, headers: JSON_HEADERS });
    }

    if (req.method === 'GET' && url.searchParams.get('health') === '1') {
      return await handleHealth(req);
    }

    if (req.method === 'POST') return await handleCreate(req);
    if (req.method === 'GET') return await handleList(req);
    if (req.method === 'DELETE') return await handleDelete(req);
    return json(405, { error: 'Methode nicht erlaubt.' });
  } catch (error) {
    return json(500, {
      error: error?.message || 'Unbekannter Serverfehler.',
      detail: String(error?.stack || '').split('\n').slice(0, 2).join(' | ')
    });
  }
};
