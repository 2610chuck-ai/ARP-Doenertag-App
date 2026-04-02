import { categoryMedia, employees, menuItems } from './data.js';
import { buildCustomerWhatsAppText, config, createOrder, formatDate, formatEuro, getOrderWindow, hasLiveApi, normalizePhoneNumber } from './shared.js';

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
const customerPhoneInput = document.querySelector('#customer-phone');
const paymentHint = document.querySelector('#payment-hint');

const DEFAULT_NOTE_PLACEHOLDER = 'z. B. ohne Zwiebeln, extra Soße, scharf';
const windowInfo = getOrderWindow();
let filteredEmployees = [...employees];
let activeCategoryFilter = menuItems[0]?.category || '';
let selectedItemCategory = '';
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
    image: 'images/menu/doener.png',
    tagline: 'Frisch zubereitet und direkt auswählbar'
  };
}

function getItemImage(categoryName, item) {
  return item?.image || getCategoryMeta(categoryName).image;
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


function openWhatsAppConfirmation(phone, order, dateLabel, popup = null) {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone) return false;

  const text = buildCustomerWhatsAppText(order, dateLabel);
  const targetUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`;
  const targetWindow = popup || window.open('', '_blank', 'noopener,noreferrer');

  if (!targetWindow) {
    window.location.href = targetUrl;
    return true;
  }

  targetWindow.location.href = targetUrl;
  return true;
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

function getCategoryByName(name) {
  return menuItems.find((entry) => entry.category === name) || null;
}

function findSelectedItem() {
  const category = getCategoryByName(selectedItemCategory);
  const item = category?.items?.find((entry) => entry.id === selectedItemId);
  return category && item ? { category, item } : null;
}

function setSelection(categoryName, itemId, keepFilter = true) {
  selectedItemCategory = categoryName;
  selectedItemId = itemId;

  if (!keepFilter) {
    activeCategoryFilter = categoryName;
  }

  renderCategoryTabs();
  renderMenuGrid();
  renderComposerCard();
}

function resetComposer(options = {}) {
  const { clearSelection = false } = options;
  editingCartItemId = '';
  notesInput.value = '';
  notesInput.placeholder = DEFAULT_NOTE_PLACEHOLDER;
  cancelEditBtn.classList.add('hidden-inline');
  addToCartBtn.textContent = 'In den Warenkorb';

  if (clearSelection) {
    selectedItemCategory = '';
    selectedItemId = '';
  }

  renderComposerCard();
  renderMenuGrid();
}

function getFilteredCategories() {
  const term = (menuSearch?.value || '').trim().toLowerCase();
  const source = menuItems.filter((category) => category.category === activeCategoryFilter);

  return source
    .map((category) => ({
      ...category,
      items: category.items.filter((item) => {
        if (!term) return true;
        return [category.category, item.id, item.name, item.subtitle || '']
          .join(' ')
          .toLowerCase()
          .includes(term);
      })
    }))
    .filter((category) => category.items.length);
}

function renderCategoryTabs() {
  const tabs = menuItems.map((category) => ({
    key: category.category,
    label: category.category,
    count: category.items.length
  }));

  categoryTabs.innerHTML = tabs
    .map(
      (tab) => `
        <button
          type="button"
          class="category-tab ${tab.key === activeCategoryFilter ? 'is-active' : ''}"
          data-category="${tab.key}"
        >
          <span>${tab.label}</span>
          <span class="tab-count">${tab.count}</span>
        </button>
      `
    )
    .join('');

  categoryTabs.querySelectorAll('[data-category]').forEach((button) => {
    button.addEventListener('click', () => {
      activeCategoryFilter = button.dataset.category;
      renderCategoryTabs();
      renderMenuGrid();
    });
  });
}

function attachImageFallbacks(scope = document) {
  scope.querySelectorAll('img[data-fallback]').forEach((img) => {
    img.addEventListener(
      'error',
      () => {
        const fallback = img.dataset.fallback;
        if (fallback && img.src !== fallback) {
          img.src = fallback;
        }
      },
      { once: true }
    );
  });
}

function buildMenuCardMarkup(category, item) {
  const categoryMeta = getCategoryMeta(category.category);
  const image = getItemImage(category.category, item);
  const isSelected = selectedItemId === item.id && selectedItemCategory === category.category;

  return `
    <button
      class="menu-item-card ${isSelected ? 'is-selected' : ''}"
      type="button"
      data-item-id="${item.id}"
      data-category="${category.category}"
    >
      <div class="food-thumb menu-card-thumb">
        <img
          class="food-thumb-img"
          src="${image}"
          alt="${item.name}"
          loading="lazy"
          referrerpolicy="no-referrer"
          data-fallback="${categoryMeta.image}"
        />
      </div>
      <div class="menu-card-copy">
        <div class="menu-card-top">
          <span class="menu-card-code">Nr. ${item.id}</span>
          <span class="menu-card-price">${formatEuro(item.price)}</span>
        </div>
        <strong>${item.name}</strong>
        ${item.subtitle ? `<div class="menu-card-subtitle">${item.subtitle}</div>` : ''}
        <span class="menu-card-tag">${category.category}</span>
      </div>
    </button>
  `;
}

function renderMenuGrid() {
  const categories = getFilteredCategories();

  if (!categories.length) {
    menuGrid.innerHTML = '<div class="empty-state">Keine Treffer in der Speisekarte.</div>';
    return;
  }

  menuGrid.innerHTML = categories
    .map((category) => {
      const media = getCategoryMeta(category.category);
      const cards = category.items.map((item) => buildMenuCardMarkup(category, item)).join('');

      return `
        <section class="menu-group">
          <div class="menu-group-head">
            <div>
              <h3>${category.category}</h3>
              <p>${media.tagline}</p>
            </div>
            <span class="soft-pill">${category.items.length} Artikel</span>
          </div>
          <div class="menu-group-grid">${cards}</div>
        </section>
      `;
    })
    .join('');

  menuGrid.querySelectorAll('[data-item-id]').forEach((button) => {
    button.addEventListener('click', () => {
      setSelection(button.dataset.category, button.dataset.itemId, true);
    });
  });

  attachImageFallbacks(menuGrid);
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
  const image = getItemImage(category.category, item);
  notesInput.placeholder = item.notePlaceholder || DEFAULT_NOTE_PLACEHOLDER;

  composerCard.innerHTML = `
    <div class="composer-preview">
      <div class="food-thumb composer-thumb">
        <img
          class="food-thumb-img"
          src="${image}"
          alt="${item.name}"
          loading="lazy"
          referrerpolicy="no-referrer"
          data-fallback="${media.image}"
        />
      </div>
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

  attachImageFallbacks(composerCard);
}

function updatePaymentHint() {
  const total = cartItems.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const paidState = parsePaidValue(amountPaidInput.value);
  const difference = (paidState.valid ? paidState.value : 0) - total;

  cartTotal.textContent = formatEuro(total);
  cartCountPill.textContent = `${cartItems.length} Artikel`;

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
          <div class="cart-item-main">
            <div class="food-thumb cart-item-thumb">
              <img
                class="food-thumb-img"
                src="${item.image || getCategoryMeta(item.category).image}"
                alt="${item.menu_item_name}"
                loading="lazy"
                referrerpolicy="no-referrer"
                data-fallback="${getCategoryMeta(item.category).image}"
              />
            </div>
            <div class="cart-item-copy">
              <div class="cart-item-top">
                <strong>${index + 1}. ${item.menu_item_name}</strong>
                <span class="menu-card-price">${formatEuro(item.price)}</span>
              </div>
              <div class="cart-item-meta">${item.category} · Nr. ${item.menu_item_id}</div>
              ${item.notes ? `<div class="cart-item-notes">Wunsch: ${item.notes}</div>` : '<div class="cart-item-notes muted">Kein Sonderwunsch</div>'}
            </div>
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
      selectedItemCategory = entry.category;
      selectedItemId = entry.menu_item_id;
      activeCategoryFilter = entry.category;
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
        resetComposer({ clearSelection: false });
      }
      renderCart();
    });
  });

  attachImageFallbacks(cartList);
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
    notes: notesInput.value.trim(),
    image: getItemImage(category.category, item)
  };

  if (editingCartItemId) {
    cartItems = cartItems.map((entry) => (entry.cart_item_id === editingCartItemId ? payload : entry));
    submitMessage.textContent = 'Warenkorb-Eintrag wurde aktualisiert.';
  } else {
    cartItems = [...cartItems, payload];
    submitMessage.textContent = 'Gericht wurde in den Warenkorb gelegt.';
  }

  resetComposer({ clearSelection: false });
  renderCart();
}

employeeSearch?.addEventListener('input', () => {
  const term = employeeSearch.value.trim().toLowerCase();
  filteredEmployees = employees.filter((employee) => employee.toLowerCase().includes(term));
  renderEmployees(filteredEmployees);
});

menuSearch?.addEventListener('input', renderMenuGrid);
amountPaidInput.addEventListener('input', updatePaymentHint);
addToCartBtn.addEventListener('click', addOrUpdateCartItem);
cancelEditBtn.addEventListener('click', () => {
  submitMessage.textContent = 'Bearbeitung abgebrochen.';
  resetComposer({ clearSelection: false });
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

  const rawCustomerPhone = customerPhoneInput.value.trim();
  const customerPhone = normalizePhoneNumber(rawCustomerPhone);

  if (rawCustomerPhone && !customerPhone) {
    submitMessage.textContent = 'Bitte eine gültige Handynummer eingeben.';
    return;
  }

  const whatsappPopup = customerPhone ? window.open('', '_blank', 'noopener,noreferrer') : null;

  const order = {
    employee_name: employeeName,
    customer_phone: customerPhone,
    items: cartItems.map(({ image, ...rest }) => rest),
    amount_paid: paidState.value,
    target_order_date: windowInfo.targetThursdayDate
  };

  try {
    const result = await createOrder(order);
    const savedOrder = result?.order || order;
    const savedDateLabel = formatDate(savedOrder.target_order_date || windowInfo.targetThursdayDate);
    const whatsappOpened = customerPhone
      ? openWhatsAppConfirmation(customerPhone, savedOrder, savedDateLabel, whatsappPopup)
      : false;

    if (result.fallback === 'local') {
      submitMessage.textContent = result.mode === 'updated'
        ? 'Warenkorb lokal aktualisiert.'
        : 'Warenkorb lokal gespeichert.';
    } else {
      submitMessage.textContent = result.mode === 'updated'
        ? 'Vorhandener Warenkorb wurde aktualisiert.'
        : 'Warenkorb gespeichert.';
    }

    if (customerPhone) {
      submitMessage.textContent += whatsappOpened
        ? ' WhatsApp-Bestätigung wurde geöffnet.'
        : ' Bestellung gespeichert, aber WhatsApp konnte nicht geöffnet werden.';
    }

    cartItems = [];
    amountPaidInput.value = '';
    customerPhoneInput.value = '';
    activeCategoryFilter = menuItems[0]?.category || '';
    resetComposer({ clearSelection: true });
    renderCategoryTabs();
    renderMenuGrid();
    renderCart();
  } catch (error) {
    if (whatsappPopup && !whatsappPopup.closed) {
      whatsappPopup.close();
    }
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
