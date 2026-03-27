import { categoryMedia, employees, menuItems } from './data.js';
import { config, createOrder, formatDate, formatEuro, getOrderWindow, hasLiveApi } from './shared.js';

const employeeSearch = document.querySelector('#employee-search');
const employeeSelect = document.querySelector('#employee');
const priceInput = document.querySelector('#price');
const notesInput = document.querySelector('#notes');
const amountPaidInput = document.querySelector('#amount-paid');
const targetDateLabel = document.querySelector('#target-date-label');
const deadlineBox = document.querySelector('#deadline-box');
const submitMessage = document.querySelector('#submit-message');
const form = document.querySelector('#order-form');
const modeBadge = document.querySelector('#mode-badge');
const menuSections = document.querySelector('#menu-sections');
const selectedItemCard = document.querySelector('#selected-item-card');
const paymentHint = document.querySelector('#payment-hint');

const windowInfo = getOrderWindow();
let filteredEmployees = [...employees];
let selectedCategory = '';
let selectedItemId = '';

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

function renderDeadlineBox() {
  const label = formatDate(windowInfo.targetThursday);
  const warning = windowInfo.nextWeekWarning
    ? '<div class="warning-badge">Achtung: Bestellung für nächste Woche</div>'
    : '<div class="success-badge">Bestellung gilt noch für diese Woche</div>';

  deadlineBox.innerHTML = `
    ${warning}
    <div class="status-line"><strong>Bestellschluss:</strong> ${windowInfo.cutoffLabel}</div>
    <div class="status-line"><strong>Aktueller Bestelltermin:</strong> ${label}</div>
  `;

  targetDateLabel.value = label;
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

function findSelectedItem() {
  const category = menuItems.find((entry) => entry.category === selectedCategory);
  const item = category?.items?.find((entry) => entry.id === selectedItemId);
  return category && item ? { category, item } : null;
}

function updateSelectedCard() {
  const selected = findSelectedItem();

  if (!selected) {
    selectedItemCard.className = 'selected-order-card empty';
    selectedItemCard.innerHTML = `
      <div class="selected-order-image selected-order-image-empty"></div>
      <div class="selected-order-copy">
        <span class="selected-order-kicker">Noch keine Auswahl</span>
        <strong>Noch nichts ausgewählt</strong>
        <p>Tippe unten ein Gericht an. Die Kategorie bleibt fest sichtbar.</p>
      </div>
    `;
    priceInput.value = '';
    paymentHint.textContent = 'Preis erscheint nach Auswahl des Gerichts.';
    return;
  }

  const { category, item } = selected;
  const paid = Number(amountPaidInput.value || 0);
  const difference = Number.isFinite(paid) ? paid - Number(item.price) : 0;
  const media = getCategoryMeta(category.category);

  selectedItemCard.className = 'selected-order-card';
  selectedItemCard.innerHTML = `
    <div class="selected-order-image" style="background-image:url('${media.image}')"></div>
    <div class="selected-order-copy">
      <span class="selected-order-kicker">${category.category}</span>
      <strong>${item.name}</strong>
      <p>${media.tagline}</p>
      <div class="selected-order-price-row">
        <span class="price-chip">${formatEuro(item.price)}</span>
        <span class="code-chip">Nr. ${item.id}</span>
      </div>
    </div>
  `;

  priceInput.value = formatEuro(item.price);

  if (!amountPaidInput.value) {
    paymentHint.textContent = 'Jetzt nur noch den bezahlten Betrag eintragen.';
  } else if (difference >= 0) {
    paymentHint.textContent = `Voraussichtliches Rückgeld: ${formatEuro(difference)}`;
  } else {
    paymentHint.textContent = `Es fehlen noch ${formatEuro(Math.abs(difference))}`;
  }
}

function updateSelectionUi() {
  const activeKey = `${selectedCategory}__${selectedItemId}`;
  menuSections.querySelectorAll('.menu-tile').forEach((button) => {
    button.classList.toggle('is-selected', button.dataset.key === activeKey);
  });
}

function chooseItem(categoryName, itemId) {
  selectedCategory = categoryName;
  selectedItemId = itemId;
  updateSelectionUi();
  updateSelectedCard();
}

function renderMenu() {
  menuSections.innerHTML = '';

  menuItems.forEach((category) => {
    const section = document.createElement('section');
    section.className = 'menu-section';
    const media = getCategoryMeta(category.category);

    const cards = category.items
      .map(
        (item) => `
          <button
            class="menu-tile"
            type="button"
            data-key="${category.category}__${item.id}"
            data-category="${category.category}"
            data-item-id="${item.id}"
          >
            <div class="menu-tile-top">
              <span class="menu-tile-code">Nr. ${item.id}</span>
              <span class="menu-tile-price">${formatEuro(item.price)}</span>
            </div>
            <strong>${item.name}</strong>
            <span class="menu-tile-meta">${category.category}</span>
          </button>
        `
      )
      .join('');

    section.innerHTML = `
      <div class="menu-section-cover" style="background-image:url('${media.image}')">
        <div class="menu-section-overlay"></div>
        <div class="menu-section-head">
          <div>
            <span class="section-kicker">Kategorie</span>
            <h3>${category.category}</h3>
            <p>${media.tagline}</p>
          </div>
          <span class="section-count">${category.items.length} Gerichte</span>
        </div>
      </div>
      <div class="menu-tiles">${cards}</div>
    `;

    menuSections.appendChild(section);
  });

  menuSections.querySelectorAll('.menu-tile').forEach((button) => {
    button.addEventListener('click', () => {
      chooseItem(button.dataset.category, button.dataset.itemId);
    });
  });
}

employeeSearch.addEventListener('input', () => {
  const term = employeeSearch.value.trim().toLowerCase();
  filteredEmployees = employees.filter((employee) => employee.toLowerCase().includes(term));
  renderEmployees(filteredEmployees);
});

amountPaidInput.addEventListener('input', updateSelectedCard);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitMessage.textContent = 'Speichere Bestellung...';

  const employeeName = employeeSelect.value.trim();
  if (!employeeName) {
    submitMessage.textContent = 'Bitte einen Mitarbeiter auswählen.';
    return;
  }

  const selected = findSelectedItem();
  if (!selected) {
    submitMessage.textContent = 'Bitte ein Gericht auswählen.';
    return;
  }

  const paid = Number(amountPaidInput.value);
  if (Number.isNaN(paid) || paid < 0) {
    submitMessage.textContent = 'Bitte einen gültigen Zahlbetrag eintragen.';
    return;
  }

  const order = {
    employee_name: employeeName,
    category: selected.category.category,
    menu_item_id: selected.item.id,
    menu_item_name: selected.item.name,
    price: Number(selected.item.price),
    notes: notesInput.value.trim(),
    amount_paid: paid,
    target_order_date: windowInfo.targetThursdayDate
  };

  try {
    const result = await createOrder(order);
    submitMessage.textContent =
      result.mode === 'updated'
        ? 'Vorhandene Bestellung wurde aktualisiert.'
        : 'Bestellung gespeichert. Auf der Azubi-Seite ist sie jetzt sichtbar.';

    notesInput.value = '';
    amountPaidInput.value = '';
    selectedCategory = '';
    selectedItemId = '';
    updateSelectionUi();
    updateSelectedCard();
    targetDateLabel.value = formatDate(windowInfo.targetThursday);
  } catch (error) {
    console.error(error);
    submitMessage.textContent = `Fehler beim Speichern: ${error.message}`;
  }
});

setModeBadge();
renderDeadlineBox();
renderEmployees(filteredEmployees);
renderMenu();
updateSelectedCard();
