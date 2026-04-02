import {
  buildWhatsAppText,
  config,
  deleteOrder,
  escapeHtml,
  fetchOrders,
  formatDate,
  formatDateTime,
  formatEuro,
  getAdminPinSessionKey,
  getAdminSessionKey,
  getOrderItemCount,
  getOrderItems,
  getOrderTotal,
  getOrderWindow,
  hasLiveApi
} from './shared.js';

const pinForm = document.querySelector('#pin-form');
const pinInput = document.querySelector('#pin-input');
const pinMessage = document.querySelector('#pin-message');
const pinCard = document.querySelector('#pin-card');
const adminContent = document.querySelector('#admin-content');
const dateFilter = document.querySelector('#date-filter');
const ordersList = document.querySelector('#orders-list');
const refreshBtn = document.querySelector('#refresh-btn');
const copyBtn = document.querySelector('#copy-btn');
const whatsappBtn = document.querySelector('#whatsapp-btn');
const actionMessage = document.querySelector('#action-message');
const adminDeadlineInfo = document.querySelector('#admin-deadline-info');
const lastSync = document.querySelector('#last-sync');
const modeBadge = document.querySelector('#mode-badge-admin');

const statOrders = document.querySelector('#stat-orders');
const statTotal = document.querySelector('#stat-total');
const statPaid = document.querySelector('#stat-paid');
const statChange = document.querySelector('#stat-change');

const orderWindow = getOrderWindow();
let currentOrders = [];
let refreshTimer = null;

function setModeBadge() {
  modeBadge.textContent = hasLiveApi() ? 'Live' : 'Demo';
  modeBadge.classList.toggle('mode-live', hasLiveApi());
  modeBadge.classList.toggle('mode-demo', !hasLiveApi());
}

function getStoredPin() {
  return sessionStorage.getItem(getAdminPinSessionKey()) || '';
}

function storePin(pin) {
  sessionStorage.setItem(getAdminPinSessionKey(), pin);
  sessionStorage.setItem(getAdminSessionKey(), 'yes');
}

function clearPinSession() {
  sessionStorage.removeItem(getAdminSessionKey());
  sessionStorage.removeItem(getAdminPinSessionKey());
}

function isUnlocked() {
  return sessionStorage.getItem(getAdminSessionKey()) === 'yes' && Boolean(getStoredPin() || !hasLiveApi());
}

function unlock(pin = '') {
  if (pin) storePin(pin);
  pinCard.classList.add('hidden-block');
  adminContent.classList.remove('hidden-block');
  fillDateFilter();
  loadOrders();
  startAutoRefresh();
}

function startAutoRefresh() {
  window.clearInterval(refreshTimer);
  refreshTimer = window.setInterval(() => {
    if (!adminContent.classList.contains('hidden-block')) {
      loadOrders(true);
    }
  }, Number(config.autoRefreshMs || 15000));
}

function fillDateFilter() {
  const currentRound = new Date(orderWindow.targetThursday);
  const nextRound = new Date(orderWindow.targetThursday);
  nextRound.setDate(nextRound.getDate() + 7);

  const options = [
    { value: dateToValue(currentRound), label: formatDate(currentRound) },
    { value: dateToValue(nextRound), label: formatDate(nextRound) }
  ];

  dateFilter.innerHTML = '';
  options.forEach((optionData) => {
    const option = document.createElement('option');
    option.value = optionData.value;
    option.textContent = optionData.label;
    dateFilter.appendChild(option);
  });

  adminDeadlineInfo.innerHTML = orderWindow.nextWeekWarning
    ? '<div class="warning-badge">Neue Eingänge landen bereits in der nächsten Woche.</div>'
    : '<div class="success-badge">Bestellungen laufen noch für diese Woche.</div>';
}

function dateToValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isPinProblem(message) {
  const text = String(message || '').toLowerCase();
  return text.includes('pin') || text.includes('401');
}

function renderOrders() {
  if (!currentOrders.length) {
    ordersList.innerHTML = '<div class="empty-state">Noch keine Bestellungen für diesen Termin vorhanden.</div>';
    statOrders.textContent = '0';
    statTotal.textContent = formatEuro(0);
    statPaid.textContent = formatEuro(0);
    statChange.textContent = formatEuro(0);
    return;
  }

  const total = currentOrders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const paid = currentOrders.reduce((sum, order) => sum + Number(order.amount_paid || 0), 0);
  const change = paid - total;
  const itemCount = currentOrders.reduce((sum, order) => sum + getOrderItemCount(order), 0);

  statOrders.textContent = `${currentOrders.length} / ${itemCount}`;
  statTotal.textContent = formatEuro(total);
  statPaid.textContent = formatEuro(paid);
  statChange.textContent = formatEuro(change);

  ordersList.innerHTML = currentOrders
    .map((order) => {
      const items = getOrderItems(order);
      const itemsMarkup = items
        .map(
          (item) => `
            <div class="order-line-item">
              <div>
                <strong>${escapeHtml(item.menu_item_id ? `${item.menu_item_id}. ${item.menu_item_name}` : item.menu_item_name)}</strong>
                <div class="order-line-meta">${escapeHtml(item.category || '')}</div>
                ${item.notes ? `<div class="order-line-note">Wunsch: ${escapeHtml(item.notes)}</div>` : ''}
              </div>
              <span>${formatEuro(item.price)}</span>
            </div>
          `
        )
        .join('');

      return `
        <article class="order-card">
          <div class="order-main">
            <div>
              <h3>${escapeHtml(order.employee_name)}</h3>
              <p>${items.length} Artikel im Warenkorb${order.customer_phone ? ` · WhatsApp: ${escapeHtml(order.customer_phone)}` : ''}</p>
            </div>
            <div class="order-price">${formatEuro(getOrderTotal(order))}</div>
          </div>
          <div class="order-lines">${itemsMarkup}</div>
          <div class="order-meta">
            <span><strong>Bezahlt:</strong> ${formatEuro(order.amount_paid)}</span>
            <span><strong>Termin:</strong> ${formatDate(order.target_order_date)}</span>
            <span><strong>Stand:</strong> ${formatDateTime(order.updated_at || order.created_at)}</span>
          </div>
          <div class="order-actions"><button class="danger-btn" type="button" data-delete-id="${escapeHtml(order.id)}">Bestellung löschen</button></div>
        </article>
      `;
    })
    .join('');

  ordersList.querySelectorAll('[data-delete-id]').forEach((button) => {
    button.addEventListener('click', async () => {
      const id = button.dataset.deleteId;
      try {
        await deleteOrder(id, getStoredPin());
        actionMessage.textContent = 'Bestellung gelöscht.';
        await loadOrders(true);
      } catch (error) {
        console.error(error);
        actionMessage.textContent = `Löschen fehlgeschlagen: ${error.message}`;
      }
    });
  });
}

async function loadOrders(silent = false) {
  if (!silent) {
    actionMessage.textContent = '';
    ordersList.innerHTML = '<div class="empty-state">Lade Daten...</div>';
  }

  try {
    currentOrders = await fetchOrders(dateFilter.value, getStoredPin());
    renderOrders();
    lastSync.textContent = `Letzte Aktualisierung: ${formatDateTime(new Date())}`;
  } catch (error) {
    console.error(error);
    if (isPinProblem(error.message)) {
      pinMessage.textContent = 'PIN falsch oder Sitzung abgelaufen.';
      clearPinSession();
      pinCard.classList.remove('hidden-block');
      adminContent.classList.add('hidden-block');
      window.clearInterval(refreshTimer);
      return;
    }

    ordersList.innerHTML = `<div class="empty-state">Fehler beim Laden: ${escapeHtml(error.message)}</div>`;
  }
}

function getCurrentWhatsAppText() {
  const selectedLabel = dateFilter.selectedOptions[0]?.textContent || dateFilter.value;
  return buildWhatsAppText(currentOrders, selectedLabel);
}

pinForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const pin = pinInput.value.trim();
  pinMessage.textContent = 'Prüfe PIN...';

  try {
    storePin(pin);
    await fetchOrders(dateToValue(orderWindow.targetThursday), pin);
    pinMessage.textContent = 'PIN korrekt.';
    unlock();
  } catch (error) {
    console.error(error);
    clearPinSession();
    pinMessage.textContent = isPinProblem(error.message)
      ? 'PIN falsch.'
      : `Serverproblem: ${error.message}`;
  }
});

dateFilter.addEventListener('change', () => loadOrders());
refreshBtn.addEventListener('click', () => loadOrders());

copyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(getCurrentWhatsAppText());
    actionMessage.textContent = 'Bestellliste wurde in die Zwischenablage kopiert.';
  } catch (error) {
    console.error(error);
    actionMessage.textContent = 'Kopieren nicht möglich.';
  }
});

whatsappBtn.addEventListener('click', () => {
  const text = getCurrentWhatsAppText();
  const baseNumber = String(config.whatsappNumber || '').replace(/\D+/g, '');
  const baseUrl = baseNumber ? `https://wa.me/${baseNumber}` : 'https://wa.me/';
  window.open(`${baseUrl}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
});

setModeBadge();

if (isUnlocked()) {
  unlock();
}
