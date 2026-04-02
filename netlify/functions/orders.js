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
    name: 'kebab-orders'
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

function normalizePhoneNumber(value, defaultCountryCode = '49') {
  const raw = String(value ?? '').trim();
  if (!raw) return '';

  const keepPlus = raw.startsWith('+');
  let normalized = raw.replace(/[^\d+]/g, '');

  if (keepPlus) {
    normalized = `+${normalized.replace(/\+/g, '')}`;
  } else {
    normalized = normalized.replace(/\+/g, '');
  }

  if (normalized.startsWith('+')) {
    normalized = normalized.slice(1);
  }

  if (normalized.startsWith('00')) {
    normalized = normalized.slice(2);
  } else if (normalized.startsWith('0')) {
    const countryCode = String(defaultCountryCode || '49').replace(/\D+/g, '') || '49';
    normalized = `${countryCode}${normalized.slice(1)}`;
  }

  normalized = normalized.replace(/\D+/g, '');

  if (normalized.length < 10 || normalized.length > 15) {
    return '';
  }

  return normalized;
}

function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
}

function formatDate(dateLike) {
  const value = String(dateLike || '').trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(year, month - 1, day, 12, 0, 0, 0));
  }

  return value;
}

function getOrderTotal(order) {
  if (Number.isFinite(Number(order?.total_price))) {
    return Number(order.total_price);
  }

  return (order.items || []).reduce((sum, item) => sum + Number(item.price || 0), 0);
}

function buildItemsSummary(order, maxLength = 700) {
  const lines = [];

  (order.items || []).forEach((item, index) => {
    const label = item.menu_item_id ? `${item.menu_item_id}. ${item.menu_item_name}` : item.menu_item_name;
    lines.push(`${index + 1}. ${label} (${formatEuro(item.price)})`);
    if (item.notes) {
      lines.push(`- Wunsch: ${item.notes}`);
    }
  });

  let summary = lines.join('\n');
  if (summary.length > maxLength) {
    summary = `${summary.slice(0, Math.max(0, maxLength - 2)).trim()}…`;
  }

  return summary || 'Keine Artikel übermittelt';
}

function buildBalanceText(order) {
  const difference = Number(order.amount_paid || 0) - getOrderTotal(order);

  if (difference > 0) return `Rückgeld: ${formatEuro(difference)}`;
  if (difference < 0) return `Offen: ${formatEuro(Math.abs(difference))}`;
  return 'Bezahlt: passend';
}

function sanitizeMetaError(errorPayload) {
  const message = errorPayload?.error?.message || errorPayload?.message || 'Unbekannter WhatsApp-Fehler.';
  const code = errorPayload?.error?.code ? ` (Code ${errorPayload.error.code})` : '';
  return cleanText(`${message}${code}`, 220);
}

function getWhatsAppConfig() {
  const apiVersion = cleanText(process.env.WHATSAPP_API_VERSION || 'v25.0', 20);
  const phoneNumberId = cleanText(process.env.WHATSAPP_PHONE_NUMBER_ID, 80);
  const accessToken = String(process.env.WHATSAPP_ACCESS_TOKEN || '').trim();
  const templateName = cleanText(process.env.WHATSAPP_TEMPLATE_NAME, 120);
  const templateLanguage = cleanText(process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'de', 20);
  const defaultCountryCode = cleanText(process.env.WHATSAPP_DEFAULT_COUNTRY_CODE || '49', 6).replace(/\D+/g, '') || '49';

  const missing = [];
  if (!phoneNumberId) missing.push('WHATSAPP_PHONE_NUMBER_ID');
  if (!accessToken) missing.push('WHATSAPP_ACCESS_TOKEN');
  if (!templateName) missing.push('WHATSAPP_TEMPLATE_NAME');
  if (!templateLanguage) missing.push('WHATSAPP_TEMPLATE_LANGUAGE');

  return {
    apiVersion,
    phoneNumberId,
    accessToken,
    templateName,
    templateLanguage,
    defaultCountryCode,
    configured: missing.length === 0,
    missing
  };
}

function buildWhatsAppTemplatePayload(order, whatsappConfig) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: order.customer_phone,
    type: 'template',
    template: {
      name: whatsappConfig.templateName,
      language: {
        code: whatsappConfig.templateLanguage
      },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: cleanText(order.employee_name || 'Kunde', 60) },
            { type: 'text', text: cleanText(formatDate(order.target_order_date), 60) },
            { type: 'text', text: buildItemsSummary(order, 700) },
            { type: 'text', text: formatEuro(getOrderTotal(order)) },
            { type: 'text', text: formatEuro(order.amount_paid) },
            { type: 'text', text: cleanText(buildBalanceText(order), 120) }
          ]
        }
      ]
    }
  };
}

async function sendWhatsAppMessage(order) {
  if (!order.customer_phone) {
    return {
      attempted: false,
      sent: false,
      status: 'skipped_no_phone',
      reason: 'Keine Handynummer vorhanden.'
    };
  }

  const whatsappConfig = getWhatsAppConfig();
  if (!whatsappConfig.configured) {
    return {
      attempted: false,
      sent: false,
      status: 'skipped_not_configured',
      reason: `Fehlende Umgebungsvariablen: ${whatsappConfig.missing.join(', ')}`
    };
  }

  const url = `https://graph.facebook.com/${whatsappConfig.apiVersion}/${whatsappConfig.phoneNumberId}/messages`;
  const payload = buildWhatsAppTemplatePayload(order, whatsappConfig);

  let response;
  let responsePayload = {};

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${whatsappConfig.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const raw = await response.text();
    try {
      responsePayload = raw ? JSON.parse(raw) : {};
    } catch {
      responsePayload = { raw };
    }
  } catch (error) {
    return {
      attempted: true,
      sent: false,
      status: 'failed',
      reason: cleanText(error?.message || 'Netzwerkfehler beim WhatsApp-Versand.', 220)
    };
  }

  if (!response.ok) {
    return {
      attempted: true,
      sent: false,
      status: 'failed',
      http_status: response.status,
      reason: sanitizeMetaError(responsePayload)
    };
  }

  return {
    attempted: true,
    sent: true,
    status: responsePayload?.messages?.[0]?.message_status || 'accepted',
    to: order.customer_phone,
    message_id: cleanText(responsePayload?.messages?.[0]?.id, 120),
    meta_contacts_wa_id: cleanText(responsePayload?.contacts?.[0]?.wa_id, 40)
  };
}

async function handleHealth(event) {
  let adminOk = false;
  try {
    adminOk = requireAdmin(event);
  } catch {
    adminOk = false;
  }

  const whatsappConfig = getWhatsAppConfig();

  return json(200, {
    ok: true,
    function: 'orders',
    adminPinConfigured: Boolean(String(process.env.ADMIN_PIN || '').trim()),
    adminAuthorized: adminOk,
    whatsappConfigured: whatsappConfig.configured,
    whatsappMissing: whatsappConfig.missing,
    whatsappApiVersion: whatsappConfig.apiVersion,
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
  const customerPhone = normalizePhoneNumber(body.customer_phone, getWhatsAppConfig().defaultCountryCode);

  if (String(body.customer_phone || '').trim() && !customerPhone) {
    return json(400, { error: 'Ungültige Handynummer.' });
  }

  const totalPrice = Number(items.reduce((sum, item) => sum + Number(item.price || 0), 0).toFixed(2));
  const id = buildOrderKey(employeeName, targetOrderDate);
  const existing = await readOrder(store, id);

  const payload = {
    id,
    employee_name: employeeName,
    customer_phone: customerPhone,
    items,
    total_price: totalPrice,
    amount_paid: amountPaid,
    target_order_date: targetOrderDate,
    created_at: existing?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await store.setJSON(id, payload);

  const whatsapp = await sendWhatsAppMessage(payload);
  payload.whatsapp_delivery = {
    ...whatsapp,
    last_attempt_at: new Date().toISOString()
  };

  await store.setJSON(id, payload);

  return json(200, {
    ok: true,
    mode: existing ? 'updated' : 'created',
    order: payload,
    whatsapp
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
