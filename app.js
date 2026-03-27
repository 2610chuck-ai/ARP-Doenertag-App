import { employees, menuItems } from './data.js';
import { config, createOrder, formatDate, formatEuro, getOrderWindow, hasLiveApi } from './shared.js';

const employeeSearch = document.querySelector('#employee-search');
const employeeSelect = document.querySelector('#employee');
const categorySelect = document.querySelector('#category');
const itemSelect = document.querySelector('#item');
const priceInput = document.querySelector('#price');
const notesInput = document.querySelector('#notes');
const amountPaidInput = document.querySelector('#amount-paid');
const targetDateLabel = document.querySelector('#target-date-label');
const deadlineBox = document.querySelector('#deadline-box');
const submitMessage = document.querySelector('#submit-message');
const form = document.querySelector('#order-form');
const modeBadge = document.querySelector('#mode-badge');

const windowInfo = getOrderWindow();
let filteredEmployees = [...employees];

document.title = config.companyName;

function setModeBadge() {
  modeBadge.textContent = hasLiveApi() ? 'Live' : 'Demo';
  modeBadge.classList.toggle('mode-live', hasLiveApi());
  modeBadge.classList.toggle('mode-demo', !hasLiveApi());
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
  employeeSelect.innerHTML = '<option value="">Bitte Mitarbeiter wählen</option>';
  list.forEach((employee) => {
    const option = document.createElement('option');
    option.value = employee;
    option.textContent = employee;
    employeeSelect.appendChild(option);
  });
}

function renderCategories() {
  categorySelect.innerHTML = '<option value="">Bitte Kategorie wählen</option>';
  menuItems.forEach((category) => {
    const option = document.createElement('option');
    option.value = category.category;
    option.textContent = `${category.category} (${category.items.length})`;
    categorySelect.appendChild(option);
  });
}

function renderItems(categoryName) {
  itemSelect.innerHTML = '<option value="">Bitte Gericht wählen</option>';
  const category = menuItems.find((entry) => entry.category === categoryName);
  if (!category) {
    priceInput.value = '';
    return;
  }

  category.items.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.name} — ${formatEuro(item.price)}`;
    option.dataset.price = String(item.price);
    option.dataset.name = item.name;
    itemSelect.appendChild(option);
  });
}

function updatePrice() {
  const selected = itemSelect.selectedOptions[0];
  priceInput.value = selected?.dataset?.price ? formatEuro(selected.dataset.price) : '';
}

employeeSearch.addEventListener('input', () => {
  const term = employeeSearch.value.trim().toLowerCase();
  filteredEmployees = employees.filter((employee) => employee.toLowerCase().includes(term));
  renderEmployees(filteredEmployees);
});

categorySelect.addEventListener('change', () => {
  renderItems(categorySelect.value);
  updatePrice();
});

itemSelect.addEventListener('change', updatePrice);

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitMessage.textContent = 'Speichere Bestellung...';

  const employeeName = employeeSelect.value.trim();
  if (!employeeName) {
    submitMessage.textContent = 'Bitte einen Mitarbeiter auswählen.';
    return;
  }

  const category = menuItems.find((entry) => entry.category === categorySelect.value);
  const item = category?.items?.find((entry) => entry.id === itemSelect.value);

  if (!item) {
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
    category: category.category,
    menu_item_id: item.id,
    menu_item_name: item.name,
    price: Number(item.price),
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

    form.reset();
    categorySelect.value = '';
    itemSelect.innerHTML = '<option value="">Bitte Gericht wählen</option>';
    priceInput.value = '';
    targetDateLabel.value = formatDate(windowInfo.targetThursday);
    renderEmployees(filteredEmployees);
  } catch (error) {
    console.error(error);
    submitMessage.textContent = `Fehler beim Speichern: ${error.message}`;
  }
});

setModeBadge();
renderDeadlineBox();
renderEmployees(filteredEmployees);
renderCategories();
