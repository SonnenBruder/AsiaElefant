import { getAllItems } from './menu-data.js';
import { escapeHtml, formatPrice, itemDisplayNumber } from './menu-utils.js';
import { getOrderTotal, MAX_ORDER_NOTE_LENGTH } from './order-list.js';

function copyWithItem(getCopy, key, itemName) {
  const copy = getCopy(key);
  return typeof copy === 'function' ? copy(itemName) : String(copy);
}

function renderOrderRow(entry, item, currency, getCopy) {
  const number = itemDisplayNumber(item);
  const lineTotal = Number(item.price) * entry.quantity;
  const noteId = `order-note-${item.id}`;

  return `
    <li class="order-list-row" data-order-list-row="${escapeHtml(item.id)}">
      <div class="flex items-start justify-between gap-4">
        <div class="min-w-0">
          <p class="text-xs font-bold text-secondary">${escapeHtml(number)}</p>
          <h3 class="mt-1 font-headline-sm text-xl text-on-surface">${escapeHtml(item.name)}</h3>
          <p class="mt-1 text-sm text-on-surface-variant">${escapeHtml(formatPrice(item.price, currency))}</p>
        </div>
        <p class="shrink-0 font-bold text-secondary">${escapeHtml(formatPrice(lineTotal, currency))}</p>
      </div>
      <div class="mt-4 flex items-center justify-between gap-3">
        <div class="order-stepper" aria-label="${escapeHtml(getCopy('orderQuantityLabel'))}">
          <button class="order-icon-button focus-ring" type="button" data-order-list-decrease="${escapeHtml(item.id)}" aria-label="${escapeHtml(copyWithItem(getCopy, 'orderDecreaseLabel', item.name))}">
            <span class="material-symbols-outlined" aria-hidden="true">remove</span>
          </button>
          <output class="order-quantity" aria-label="${escapeHtml(getCopy('orderQuantityLabel'))}">${entry.quantity}</output>
          <button class="order-icon-button focus-ring" type="button" data-order-list-increase="${escapeHtml(item.id)}" aria-label="${escapeHtml(copyWithItem(getCopy, 'orderIncreaseLabel', item.name))}">
            <span class="material-symbols-outlined" aria-hidden="true">add</span>
          </button>
        </div>
        <button class="order-icon-button focus-ring text-error" type="button" data-order-list-remove="${escapeHtml(item.id)}" aria-label="${escapeHtml(copyWithItem(getCopy, 'orderRemoveLabel', item.name))}">
          <span class="material-symbols-outlined" aria-hidden="true">delete</span>
        </button>
      </div>
      <label class="mt-4 block text-xs font-bold text-on-surface-variant" for="${escapeHtml(noteId)}">${escapeHtml(getCopy('orderNoteLabel'))}</label>
      <textarea id="${escapeHtml(noteId)}" class="order-note focus-ring mt-2" rows="2" maxlength="${MAX_ORDER_NOTE_LENGTH}" data-order-list-note="${escapeHtml(item.id)}" placeholder="${escapeHtml(getCopy('orderNotePlaceholder'))}">${escapeHtml(entry.note)}</textarea>
    </li>`;
}

export function buildOrderListClipboardText(list, data) {
  const itemsById = new Map(
    getAllItems(data).map((item) => [item.id, item]),
  );

  return list.items
    .map((entry) => {
      const item = itemsById.get(entry.id);
      return item
        ? `${entry.quantity}x ${itemDisplayNumber(item)} : ${item.name}`
        : '';
    })
    .filter(Boolean)
    .join('\n');
}

export function renderOrderListView({ list, data, getCopy }) {
  const menuItems = getAllItems(data);
  const itemsById = new Map(menuItems.map((item) => [item.id, item]));
  const rows = list.items
    .map((entry) => {
      const item = itemsById.get(entry.id);
      return item ? renderOrderRow(entry, item, data.currency, getCopy) : '';
    })
    .join('');

  if (!rows) {
    return {
      itemsMarkup: `
        <div class="order-empty-state" role="status">
          <span class="material-symbols-outlined text-4xl text-secondary" aria-hidden="true">receipt_long</span>
          <h3 class="mt-4 font-headline-sm text-xl text-on-surface">${escapeHtml(getCopy('orderEmptyTitle'))}</h3>
          <p class="mt-2 text-sm leading-6 text-on-surface-variant">${escapeHtml(getCopy('orderEmptyText'))}</p>
        </div>`,
      totalMarkup: '',
    };
  }

  return {
    itemsMarkup: `<ul class="order-list-rows">${rows}</ul>`,
    totalMarkup: `
      <div class="order-total">
        <span class="text-sm font-bold text-on-surface-variant">${escapeHtml(getCopy('orderEstimatedTotal'))}</span>
        <strong class="font-headline-sm text-2xl text-secondary">${escapeHtml(formatPrice(getOrderTotal(list, menuItems), data.currency))}</strong>
      </div>
      <button class="order-copy-button focus-ring" type="button" data-order-list-copy>
        <span class="material-symbols-outlined" aria-hidden="true">content_copy</span>
        <span data-order-list-copy-label>${escapeHtml(getCopy('orderCopyLabel'))}</span>
      </button>`,
  };
}
