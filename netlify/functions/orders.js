const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

let blobsModulePromise;

function json(statusCode, payload) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

async function getBlobsModule() {
  if (!blobsModulePromise) {
    blobsModulePromise = import('@netlify/blobs');
  }
  return blobsModulePromise;
}

async function getStoreInstance(event) {
  const blobs = await getBlobsModule();

  if (typeof blobs.connectLambda === 'function') {
    blobs.connectLambda(event);
  }

  return blobs.getStore({
    name: 'kebab-orders',
    consistency: 'strong'
  });
}

function getAdminPin(event) {
  const headers = event.headers || {};
  return headers['x-admin-pin'] || headers['X-Admin-Pin'] || event.queryStringParameters?.pin || '';
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ''));
}

function cleanText(value, maxLength = 200) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

function cleanAmount(value) {
  const normalized = String(value ?? '').trim().replace(',', '.');
  const numeric = Number(normalized);
  if (!normalized || Number.isNaN(numeric) || numeric < 0) {
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
  const expectedPin = String(process.env.ADMIN_PIN || '').trim();
  if (!expectedPin) {
    throw new Error('ADMIN_PIN fehlt in den Netlify-Umgebungsvariablen.');
  }

  return String(getAdminPin(event)).trim() === expectedPin;
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
  const menuItemId = cleanText(body.menu_item_id, 40);
  const menuItemName = cleanText(body.menu_item_name, 180);

  if (!category || !menuItemId || !menuItemName) {
    return [];
  }

  return [
    {
      cart_item_id: cleanText(body.cart_item_id, 80) || 'item-1',
      category,
      menu_item_id: menuItemId,
      menu_item_name: menuItemName,
      price: cleanAmount(body.price),
      notes: cleanText(body.notes, 600)
    }
  ];
}

async function handleHealth(event) {
  let adminOk = false;
  try {
    adminOk = requireAdmin(event);
  } catch {
    adminOk = false;
  }

  return json(200, {
    ok: true,
    function: 'orders',
    adminPinConfigured: Boolean(String(process.env.ADMIN_PIN || '').trim()),
    adminAuthorized: adminOk,
    method: event.httpMethod
  });
}

async function handleCreate(event) {
  const store = await getStoreInstance(event);
  const body = JSON.parse(event.body || '{}');

  const employeeName = cleanText(body.employee_name, 120);
  const targetOrderDate = cleanText(body.target_order_date, 10);
  const items = normalizeItems(body);

  if (!employeeName || !items.length) {
    return json(400, { error: 'Pflichtfelder fehlen.' });
  }

  if (!isValidDate(targetOrderDate)) {
    return json(400, { error: 'Ungültiges Bestelldatum.' });
  }

  const amountPaid = cleanAmount(body.amount_paid);
  const totalPrice = Number(items.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2));
  const id = buildOrderKey(employeeName, targetOrderDate);
  const existing = await readOrder(store, id);

  const payload = {
    id,
    employee_name: employeeName,
    items,
    total_price: totalPrice,
    amount_paid: amountPaid,
    target_order_date: targetOrderDate,
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

  const store = await getStoreInstance(event);
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

  const store = await getStoreInstance(event);
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
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: JSON_HEADERS, body: '' };
    }

    if (event.httpMethod === 'GET' && event.queryStringParameters?.health === '1') {
      return await handleHealth(event);
    }

    if (event.httpMethod === 'POST') return await handleCreate(event);
    if (event.httpMethod === 'GET') return await handleList(event);
    if (event.httpMethod === 'DELETE') return await handleDelete(event);

    return json(405, { error: 'Methode nicht erlaubt.' });
  } catch (error) {
    return json(500, {
      error: error?.message || 'Unbekannter Serverfehler.',
      detail: String(error?.stack || '').split('\n').slice(0, 3).join(' | ')
    });
  }
};
