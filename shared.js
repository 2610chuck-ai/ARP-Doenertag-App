const DEFAULT_CONFIG = {
  companyName: 'Kebap-Bestellung Donnerstag',
  whatsappNumber: '',
  whatsappDefaultCountryCode: '49',
  apiBase: '/.netlify/functions',
  autoRefreshMs: 15000,
  demoMode: false
};

export const config = {
  ...DEFAULT_CONFIG,
  ...(window.APP_CONFIG || {})
};

const ORDER_STORAGE_KEY = 'kebab-orders-demo';
const ADMIN_SESSION_KEY = 'kebab-admin-ok';
const ADMIN_PIN_SESSION_KEY = 'kebab-admin-pin';

export function getAdminSessionKey() {
  return ADMIN_SESSION_KEY;
}

export function getAdminPinSessionKey() {
  return ADMIN_PIN_SESSION_KEY;
}

export function hasLiveApi() {
  return !config.demoMode;
}

export function parseDate(dateLike) {
  if (dateLike instanceof Date) return new Date(dateLike.getTime());
  if (typeof dateLike === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateLike)) {
    const [year, month, day] = dateLike.split('-').map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }
  return new Date(dateLike);
}

export function formatEuro(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value || 0));
}

export function formatDate(dateLike) {
  return new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parseDate(dateLike));
}

export function formatDateTime(dateLike) {
  return new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(parseDate(dateLike));
}


export function normalizePhoneNumber(value) {
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
    const countryCode = String(config.whatsappDefaultCountryCode || '49').replace(/\D+/g, '') || '49';
    normalized = `${countryCode}${normalized.slice(1)}`;
  }

  return normalized.replace(/\D+/g, '');
}

export function toLocalDateInputValue(date) {
  const d = parseDate(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOrderWindow(now = new Date()) {
  const current = new Date(now);
  const weekday = current.getDay();
  const thursdayIndex = 4;
  const daysUntilThursday = (thursdayIndex - weekday + 7) % 7;

  const targetThursday = new Date(current);
  targetThursday.setDate(current.getDate() + daysUntilThursday);
  targetThursday.setHours(10, 0, 0, 0);

  const isThursday = weekday === thursdayIndex;
  const isAfterCutoff = isThursday && current > targetThursday;
  const isPastThisWeek = weekday > thursdayIndex;

  if (isAfterCutoff || isPastThisWeek) {
    targetThursday.setDate(targetThursday.getDate() + 7);
  }

  const thisWeekThursday = new Date(current);
  const daysToThisThursday = thursdayIndex - weekday;
  thisWeekThursday.setDate(current.getDate() + daysToThisThursday);
  thisWeekThursday.setHours(10, 0, 0, 0);

  return {
    now: current,
    targetThursday,
    targetThursdayDate: toLocalDateInputValue(targetThursday),
    nextWeekWarning: current > thisWeekThursday,
    cutoffLabel: 'Donnerstag 10:00 Uhr'
  };
}

function normalizeLegacyOrderItem(order) {
  if (!order) return [];
  if (Array.isArray(order.items) && order.items.length) {
    return order.items.map((item, index) => ({
      cart_item_id: item.cart_item_id || item.id || `${order.id || 'order'}-${index + 1}`,
      category: item.category || order.category || '',
      menu_item_id: item.menu_item_id || order.menu_item_id || '',
      menu_item_name: item.menu_item_name || order.menu_item_name || '',
      price: Number(item.price || 0),
      notes: item.notes || ''
    }));
  }

  if (order.menu_item_name || order.menu_item_id) {
    return [
      {
        cart_item_id: order.id || crypto.randomUUID(),
        category: order.category || '',
        menu_item_id: order.menu_item_id || '',
        menu_item_name: order.menu_item_name || '',
        price: Number(order.price || 0),
        notes: order.notes || ''
      }
    ];
  }

  return [];
}

export function getOrderItems(order) {
  return normalizeLegacyOrderItem(order);
}

export function getOrderTotal(order) {
  if (Number.isFinite(Number(order?.total_price))) {
    return Number(order.total_price);
  }
  return getOrderItems(order).reduce((sum, item) => sum + Number(item.price || 0), 0);
}

export function getOrderItemCount(order) {
  return getOrderItems(order).length;
}

export function buildWhatsAppText(orders, dateLabel) {
  const lines = [];
  lines.push(`Bestellung ${config.companyName}`);
  lines.push(`Termin: ${dateLabel}`);
  lines.push('');

  orders.forEach((order, index) => {
    const items = getOrderItems(order);
    lines.push(`${index + 1}. ${order.employee_name}`);
    items.forEach((item, itemIndex) => {
      const label = item.menu_item_id ? `${item.menu_item_id}. ${item.menu_item_name}` : item.menu_item_name;
      lines.push(`   ${itemIndex + 1}) ${label} (${formatEuro(item.price)})`);
      if (item.notes) lines.push(`      Wunsch: ${item.notes}`);
    });
    lines.push(`   Gesamt: ${formatEuro(getOrderTotal(order))}`);
    lines.push(`   Bezahlt: ${formatEuro(order.amount_paid)}`);
  });

  const total = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const paid = orders.reduce((sum, order) => sum + Number(order.amount_paid || 0), 0);
  const change = paid - total;

  lines.push('');
  lines.push(`Gesamt Essen: ${formatEuro(total)}`);
  lines.push(`Gesamt bezahlt: ${formatEuro(paid)}`);
  lines.push(`Differenz / Rückgeld: ${formatEuro(change)}`);

  return lines.join('\n');
}

function getLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocalOrders(orders) {
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

function saveOrderLocally(payload) {
  const orders = getLocalOrders();
  const existingIndex = orders.findIndex(
    (entry) => entry.employee_name === payload.employee_name && entry.target_order_date === payload.target_order_date
  );

  const normalizedItems = (payload.items || []).map((item, index) => ({
    cart_item_id: item.cart_item_id || `${payload.employee_name}-${index + 1}`,
    category: item.category,
    menu_item_id: item.menu_item_id,
    menu_item_name: item.menu_item_name,
    price: Number(item.price || 0),
    notes: item.notes || ''
  }));

  const saved = {
    id: existingIndex >= 0 ? orders[existingIndex].id : crypto.randomUUID(),
    employee_name: payload.employee_name,
    customer_phone: normalizePhoneNumber(payload.customer_phone),
    items: normalizedItems,
    total_price: normalizedItems.reduce((sum, item) => sum + Number(item.price || 0), 0),
    amount_paid: Number(payload.amount_paid || 0),
    target_order_date: payload.target_order_date,
    updated_at: new Date().toISOString(),
    created_at: existingIndex >= 0 ? orders[existingIndex].created_at || payload.created_at : payload.created_at
  };

  if (existingIndex >= 0) {
    orders[existingIndex] = saved;
  } else {
    orders.unshift(saved);
  }

  setLocalOrders(orders);

  return {
    ok: true,
    mode: existingIndex >= 0 ? 'updated' : 'created',
    order: saved,
    fallback: 'local'
  };
}

function isRecoverableApiError(error) {
  const message = String(error?.message || '').toLowerCase();
  return [
    'failed to fetch',
    'load failed',
    'networkerror',
    'network error',
    'serverfehler',
    'not found',
    '404',
    'unexpected token <'
  ].some((pattern) => message.includes(pattern));
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${config.apiBase}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const raw = await response.text();
  let payload = {};

  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { error: raw || 'Unbekannter Fehler' };
  }

  if (!response.ok) {
    throw new Error(payload.error || 'Serverfehler');
  }

  return payload;
}

export async function createOrder(order) {
  const payload = {
    ...order,
    created_at: new Date().toISOString()
  };

  if (hasLiveApi()) {
    try {
      const result = await requestJson('/orders', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      saveOrderLocally(payload);
      return result;
    } catch (error) {
      if (!isRecoverableApiError(error)) {
        throw error;
      }
      return saveOrderLocally(payload);
    }
  }

  return saveOrderLocally(payload);
}

export async function fetchOrders(targetDate = '', pin = '') {
  if (hasLiveApi()) {
    try {
      const searchParams = new URLSearchParams();
      if (targetDate) searchParams.set('targetDate', targetDate);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      const data = await requestJson(`/orders${query}`, {
        method: 'GET',
        headers: {
          'x-admin-pin': pin
        }
      });
      return data.orders || [];
    } catch (error) {
      if (!isRecoverableApiError(error)) {
        throw error;
      }
    }
  }

  const orders = getLocalOrders();
  return (targetDate ? orders.filter((entry) => entry.target_order_date === targetDate) : orders).sort((a, b) =>
    a.employee_name.localeCompare(b.employee_name, 'de')
  );
}

export async function deleteOrder(id, pin = '') {
  if (hasLiveApi()) {
    try {
      return await requestJson('/orders', {
        method: 'DELETE',
        headers: {
          'x-admin-pin': pin
        },
        body: JSON.stringify({ id })
      });
    } catch (error) {
      if (!isRecoverableApiError(error)) {
        throw error;
      }
    }
  }

  const next = getLocalOrders().filter((entry) => entry.id !== id);
  setLocalOrders(next);
  return { ok: true, fallback: 'local' };
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}


export function buildCustomerWhatsAppText(order, dateLabel = '') {
  const items = getOrderItems(order);
  const lines = [];

  lines.push(`Bestellbestätigung ${config.companyName}`);
  if (order.employee_name) lines.push(`Name: ${order.employee_name}`);
  if (dateLabel) lines.push(`Termin: ${dateLabel}`);
  lines.push('');
  lines.push('Deine Bestellung:');

  items.forEach((item, index) => {
    const label = item.menu_item_id ? `${item.menu_item_id}. ${item.menu_item_name}` : item.menu_item_name;
    lines.push(`${index + 1}. ${label} (${formatEuro(item.price)})`);
    if (item.notes) {
      lines.push(`   Wunsch: ${item.notes}`);
    }
  });

  lines.push('');
  lines.push(`Gesamt: ${formatEuro(getOrderTotal(order))}`);
  lines.push(`Bezahlt: ${formatEuro(order.amount_paid)}`);

  const difference = Number(order.amount_paid || 0) - getOrderTotal(order);
  if (difference > 0) {
    lines.push(`Rückgeld: ${formatEuro(difference)}`);
  } else if (difference < 0) {
    lines.push(`Offen: ${formatEuro(Math.abs(difference))}`);
  }

  lines.push('');
  lines.push('Vielen Dank für deine Bestellung!');

  return lines.join('\n');
}
