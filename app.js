import { categoryMedia, employees, menuItems } from './data.js';
import { config, createOrder, formatDate, formatEuro, getOrderWindow, hasLiveApi } from './shared.js';

const employeeSearch = document.querySelector('#employee-search');
const employeeSelect = document.querySelector('#employee');
const targetDateLabel = document.querySelector('#target-date-label');
const deadlineInline = document.querySelector('#deadline-inline');
const submitMessage = document.querySelector('#submit-message');
const form = document.querySelector('#order-form');
const modeBadge = document.querySelector('#mode-badge');
const menuSearch = document.querySelector('#menu-search');
const categoryTabs = document.querySelector('#category-tabs');
const menuGrid = document.querySelector('#menu-grid');
const composerCard = document.querySelector('#composer-card');
const notesInput = document.querySelector('#notes');
const addToCartBtn = document.querySelector('#add-to-cart-btn');
const cancelEditBtn = document.querySelector('#cancel-edit-btn');
const cartList = document.querySelector('#cart-list');
const cartCountPill = document.querySelector('#cart-count-pill');
const cartTotal = document.querySelector('#cart-total');
const amountPaidInput = document.querySelector('#amount-paid');
const paymentHint = document.querySelector('#payment-hint');

const DEFAULT_NOTE_PLACEHOLDER = 'z. B. ohne Zwiebeln, extra Soße, scharf';

const windowInfo = getOrderWindow();
let filteredEmployees = [...employees];
let selectedCategory = menuItems[0]?.category || '';
let selectedItemId = '';
let editingCartItemId = '';
let cartItems = [];

document.title = config.companyName;

function setModeBadge() {
  modeBadge.textContent = hasLiveApi() ? 'Live' : 'Demo';
  modeBadge.classList.toggle('mode-live', hasLiveApi());
  modeBadge.classList.toggle('mode-demo', !hasLiveApi());
}

function getCategoryMeta(categoryName) {
  return categoryMedia[categoryName] || {
    image: 'https://images.unsplash.com/photo-1699728088614-7d1d4277414b?auto=format&fit=crop&w=1200&q=80',
    tagline: 'Frisch zubereitet und direkt auswählbar'
  };
}

function parsePaidValue(rawValue) {
  const normalized = String(rawValue ?? '').trim().replace(',', '.');

  if (!normalized) {
    return { empty: true, valid: false, value: null };
  }

  const value = Number(normalized);

  if (!Number.isFinite(value) || value < 0) {
    return { empty: false, valid: false, value: null };
  }

  return { empty: false, valid: true, value };
}

function getDisplayName(item) {
  return item.subtitle ? `${item.name} – ${item.subtitle}` : item.name;
}

function dateInfoMarkup() {
  if (windowInfo.nextWeekWarning) {
    return `<span class="warning-badge">Achtung: Bestellung für nächste Woche</span><span class="inline-status-text">Bestellschluss: ${windowInfo.cutoffLabel}</span>`;
  }

  return `<span class="success-badge">Bestellung läuft noch für diese Woche</span><span class="inline-status-text">Bestellschluss: ${windowInfo.cutoffLabel}</span>`;
}

function renderDeadlineInfo() {
  deadlineInline.innerHTML = dateInfoMarkup();
  targetDateLabel.textContent = formatDate(windowInfo.targetThursday);
}

function renderEmployees(list) {
  const previous = employeeSelect.value;
  employeeSelect.innerHTML = '<option value="">Bitte Mitarbeiter wählen</option>';

  list.forEach((employee) => {
    const option = document.createElement('option');
    option.value = employee;
    option.textContent = employee;
    employeeSelect.appendChild(option);
  });

  if (previous && list.includes(previous)) {
    employeeSelect.value = previous;
  }
}

function getSelectedCategoryObject() {
  return menuItems.find((entry) => entry.category === selectedCategory) || menuItems[0] || null;
}

function findSelectedItem() {
  const category = getSelectedCategoryObject();
  const item = category?.items?.find((entry) => entry.id === selectedItemId);
  return category && item ? { category, item } : null;
}

function setSelection(categoryName, itemId) {
  selectedCategory = categoryName;
  selectedItemId = itemId;
  renderCategoryTabs();
  renderMenuGrid();
  renderComposerCard();
}

function resetComposer(clearSelection = false) {
  editingCartItemId = '';
  notesInput.value = '';
  notesInput.placeholder = DEFAULT_NOTE_PLACEHOLDER;
  cancelEditBtn.classList.add('hidden-inline');
  addToCartBtn.textContent = 'In den Warenkorb';

  if (clearSelection) {
    selectedItemId = '';
  }

  renderComposerCard();
  renderMenuGrid();
}

function renderCategoryTabs() {
  categoryTabs.innerHTML = menuItems
    .map(
      (category) => `
        <button
          type="button"
          class="category-tab ${category.category === selectedCategory ? 'is-active' : ''}"
          data-category="${category.category}"
        >
          ${category.category}
        </button>
      `
    )
    .join('');

  categoryTabs.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedCategory = button.dataset.category;
      renderCategoryTabs();
      renderMenuGrid();
      renderComposerCard();
    });
  });
}

function renderMenuGrid() {
  const currentCategory = getSelectedCategoryObject();
  if (!currentCategory) {
    menuGrid.innerHTML = '<div class="empty-state">Keine Kategorien gefunden.</div>';
    return;
  }

  const media = getCategoryMeta(currentCategory.category);
  const term = menuSearch.value.trim().toLowerCase();
  const items = currentCategory.items.filter((item) => {
    if (!term) return true;
    return [item.id, item.name, item.subtitle || ''].join(' ').toLowerCase().includes(term);
  });

  if (!items.length) {
    menuGrid.innerHTML = '<div class="empty-state">Keine Treffer in dieser Kategorie.</div>';
    return;
  }

  menuGrid.innerHTML = items
    .map(
      (item) => `
        <button
          class="menu-item-card ${selectedItemId === item.id ? 'is-selected' : ''}"
          type="button"
          data-item-id="${item.id}"
          data-category="${currentCategory.category}"
        >
          <div class="menu-card-thumb" style="background-image:url('${media.image}')"></div>
          <div class="menu-card-copy">
            <div class="menu-card-top">
              <span class="menu-card-code">Nr. ${item.id}</span>
              <span class="menu-card-price">${formatEuro(item.price)}</span>
            </div>
            <strong>${item.name}</strong>
            ${item.subtitle ? `<div class="menu-card-subtitle">${item.subtitle}</div>` : ''}
            <span class="menu-card-tag">${currentCategory.category}</span>
          </div>
        </button>
      `
    )
    .join('');

  menuGrid.querySelectorAll('[data-item-id]').forEach((button) => {
    button.addEventListener('click', () => setSelection(button.dataset.category, button.dataset.itemId));
  });
}

function renderComposerCard() {
  const selected = findSelectedItem();

  if (!selected) {
    composerCard.innerHTML = `
      <div class="composer-empty">
        <strong>Noch kein Gericht ausgewählt</strong>
        <p>Tippe links auf eine Speisekarten-Kachel. Danach kannst du den Wunschtext direkt diesem Gericht zuordnen.</p>
      </div>
    `;
    notesInput.placeholder = DEFAULT_NOTE_PLACEHOLDER;
    return;
  }

  const { category, item } = selected;
  const media = getCategoryMeta(category.category);
  notesInput.placeholder = item.notePlaceholder || DEFAULT_NOTE_PLACEHOLDER;

  composerCard.innerHTML = `
    <div class="composer-preview">
      <div class="composer-thumb" style="background-image:url('${media.image}')"></div>
      <div class="composer-copy">
        <div class="menu-card-top">
          <span class="menu-card-code">Nr. ${item.id}</span>
          <span class="menu-card-price">${formatEuro(item.price)}</span>
        </div>
        <strong>${item.name}</strong>
        ${item.subtitle ? `<div class="menu-card-subtitle">${item.subtitle}</div>` : ''}
        <span class="menu-card-tag">${category.category}</span>
        ${editingCartItemId ? '<div class="edit-chip">Bearbeitung aktiv</div>' : ''}
      </div>
    </div>
  `;
}

function updatePaymentHint() {
  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const paidState = parsePaidValue(amountPaidInput.value);
  const difference = (paidState.valid ? paidState.value : 0) - total;

  cartTotal.textContent = formatEuro(total);
  cartCountPill.textContent = `${cartItems.length} ${cartItems.length === 1 ? 'Artikel' : 'Artikel'}`;

  if (!cartItems.length) {
    paymentHint.textContent = 'Lege zuerst mindestens ein Gericht in den Warenkorb.';
    return;
  }

  if (paidState.empty) {
    paymentHint.textContent = 'Jetzt nur noch den bezahlten Betrag eintragen.';
    return;
  }

  if (!paidState.valid) {
    paymentHint.textContent = 'Bitte einen gültigen Zahlbetrag eingeben.';
    return;
  }

  if (difference >= 0) {
    paymentHint.textContent = `Voraussichtliches Rückgeld: ${formatEuro(difference)}`;
  } else {
    paymentHint.textContent = `Es fehlen noch ${formatEuro(Math.abs(difference))}`;
  }
}

function renderCart() {
  if (!cartItems.length) {
    cartList.innerHTML = '<div class="empty-state">Noch kein Gericht im Warenkorb.</div>';
    updatePaymentHint();
    return;
  }

  cartList.innerHTML = cartItems
    .map(
      (item, index) => `
        <article class="cart-item ${editingCartItemId === item.cart_item_id ? 'is-editing' : ''}">
          <div class="cart-item-copy">
            <div class="cart-item-top">
              <strong>${index + 1}. ${item.menu_item_name}</strong>
              <span class="menu-card-price">${formatEuro(item.price)}</span>
            </div>
            <div class="cart-item-meta">${item.category} · Nr. ${item.menu_item_id}</div>
            ${item.notes ? `<div class="cart-item-notes">Wunsch: ${item.notes}</div>` : '<div class="cart-item-notes muted">Kein Sonderwunsch</div>'}
          </div>
          <div class="cart-item-actions">
            <button type="button" class="mini-btn" data-edit-cart="${item.cart_item_id}">Bearbeiten</button>
            <button type="button" class="mini-btn danger" data-delete-cart="${item.cart_item_id}">Löschen</button>
          </div>
        </article>
      `
    )
    .join('');

  cartList.querySelectorAll('[data-edit-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const entry = cartItems.find((item) => item.cart_item_id === button.dataset.editCart);
      if (!entry) return;
      selectedCategory = entry.category;
      selectedItemId = entry.menu_item_id;
      editingCartItemId = entry.cart_item_id;
      notesInput.value = entry.notes || '';
      addToCartBtn.textContent = 'Änderung speichern';
      cancelEditBtn.classList.remove('hidden-inline');
      renderCategoryTabs();
      renderMenuGrid();
      renderComposerCard();
      notesInput.focus();
    });
  });

  cartList.querySelectorAll('[data-delete-cart]').forEach((button) => {
    button.addEventListener('click', () => {
      const cartId = button.dataset.deleteCart;
      cartItems = cartItems.filter((item) => item.cart_item_id !== cartId);
      if (editingCartItemId === cartId) {
        resetComposer();
      }
      renderCart();
    });
  });

  updatePaymentHint();
}

function addOrUpdateCartItem() {
  const selected = findSelectedItem();
  if (!selected) {
    submitMessage.textContent = 'Bitte zuerst ein Gericht auswählen.';
    return;
  }

  const { category, item } = selected;
  const payload = {
    cart_item_id: editingCartItemId || crypto.randomUUID(),
    category: category.category,
    menu_item_id: item.id,
    menu_item_name: getDisplayName(item),
    price: Number(item.price),
    notes: notesInput.value.trim()
  };

  if (editingCartItemId) {
    cartItems = cartItems.map((entry) => (entry.cart_item_id === editingCartItemId ? payload : entry));
    submitMessage.textContent = 'Warenkorb-Eintrag wurde aktualisiert.';
  } else {
    cartItems = [...cartItems, payload];
    submitMessage.textContent = 'Gericht wurde in den Warenkorb gelegt.';
  }

  resetComposer();
  renderCart();
}

employeeSearch.addEventListener('input', () => {
  const term = employeeSearch.value.trim().toLowerCase();
  filteredEmployees = employees.filter((employee) => employee.toLowerCase().includes(term));
  renderEmployees(filteredEmployees);
});

menuSearch.addEventListener('input', renderMenuGrid);
amountPaidInput.addEventListener('input', updatePaymentHint);
addToCartBtn.addEventListener('click', addOrUpdateCartItem);
cancelEditBtn.addEventListener('click', () => {
  submitMessage.textContent = 'Bearbeitung abgebrochen.';
  resetComposer();
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitMessage.textContent = 'Speichere Warenkorb...';

  const employeeName = employeeSelect.value.trim();
  if (!employeeName) {
    submitMessage.textContent = 'Bitte einen Mitarbeiter auswählen.';
    return;
  }

  if (!cartItems.length) {
    submitMessage.textContent = 'Bitte mindestens ein Gericht in den Warenkorb legen.';
    return;
  }

  const paidState = parsePaidValue(amountPaidInput.value);

  if (paidState.empty) {
    submitMessage.textContent = 'Bitte den bezahlten Betrag eintragen.';
    return;
  }

  if (!paidState.valid) {
    submitMessage.textContent = 'Bitte einen gültigen Zahlbetrag eintragen.';
    return;
  }

  const order = {
    employee_name: employeeName,
    items: cartItems,
    amount_paid: paidState.value,
    target_order_date: windowInfo.targetThursdayDate
  };

  try {
    const result = await createOrder(order);
    submitMessage.textContent =
      result.mode === 'updated'
        ? 'Vorhandener Warenkorb wurde aktualisiert.'
        : 'Warenkorb gespeichert. Auf der Azubi-Seite ist er jetzt sichtbar.';

    cartItems = [];
    amountPaidInput.value = '';
    resetComposer(true);
    renderCart();
  } catch (error) {
    console.error(error);
    submitMessage.textContent = `Fehler beim Speichern: ${error.message}`;
  }
});

setModeBadge();
renderDeadlineInfo();
renderEmployees(filteredEmployees);
renderCategoryTabs();
renderMenuGrid();
renderComposerCard();
renderCart();
