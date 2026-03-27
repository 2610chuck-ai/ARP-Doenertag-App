const DEFAULT_CONFIG = {
  companyName: 'Kebap-Bestellung Donnerstag',
  whatsappNumber: '',
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

export function buildWhatsAppText(orders, dateLabel) {
  const lines = [];
  lines.push(`Bestellung ${config.companyName}`);
  lines.push(`Termin: ${dateLabel}`);
  lines.push('');

  orders.forEach((order, index) => {
    lines.push(`${index + 1}. ${order.employee_name} - ${order.menu_item_name} (${formatEuro(order.price)})`);
    if (order.notes) lines.push(`   Wunsch: ${order.notes}`);
    lines.push(`   Bezahlt: ${formatEuro(order.amount_paid)}`);
  });

  const total = orders.reduce((sum, order) => sum + Number(order.price || 0), 0);
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
    return requestJson('/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  const orders = getLocalOrders();
  const existingIndex = orders.findIndex(
    (entry) => entry.employee_name === payload.employee_name && entry.target_order_date === payload.target_order_date
  );

  const saved = {
    id: existingIndex >= 0 ? orders[existingIndex].id : crypto.randomUUID(),
    updated_at: new Date().toISOString(),
    ...payload
  };

  if (existingIndex >= 0) {
    saved.created_at = orders[existingIndex].created_at || payload.created_at;
    orders[existingIndex] = saved;
  } else {
    orders.unshift(saved);
  }

  setLocalOrders(orders);

  return {
    ok: true,
    mode: existingIndex >= 0 ? 'updated' : 'created',
    order: saved
  };
}

export async function fetchOrders(targetDate = '', pin = '') {
  if (hasLiveApi()) {
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
  }

  const orders = getLocalOrders();
  return (targetDate ? orders.filter((entry) => entry.target_order_date === targetDate) : orders).sort((a, b) =>
    a.employee_name.localeCompare(b.employee_name, 'de')
  );
}

export async function deleteOrder(id, pin = '') {
  if (hasLiveApi()) {
    return requestJson('/orders', {
      method: 'DELETE',
      headers: {
        'x-admin-pin': pin
      },
      body: JSON.stringify({ id })
    });
  }

  const next = getLocalOrders().filter((entry) => entry.id !== id);
  setLocalOrders(next);
  return { ok: true };
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
