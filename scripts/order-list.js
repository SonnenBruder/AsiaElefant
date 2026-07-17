export const ORDER_LIST_STORAGE_KEY = 'asia-elefant-order-list';
export const ORDER_LIST_VERSION = 1;
export const MAX_ORDER_QUANTITY = 99;
export const MAX_ORDER_NOTE_LENGTH = 200;

function sanitizeId(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeQuantity(value) {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity < 1) {
    return 0;
  }
  return Math.min(quantity, MAX_ORDER_QUANTITY);
}

export function sanitizeOrderNote(value) {
  return typeof value === 'string'
    ? value.slice(0, MAX_ORDER_NOTE_LENGTH)
    : '';
}

export function createEmptyOrderList() {
  return { version: ORDER_LIST_VERSION, items: [] };
}

export function sanitizeOrderList(value) {
  if (
    !value ||
    typeof value !== 'object' ||
    value.version !== ORDER_LIST_VERSION ||
    !Array.isArray(value.items)
  ) {
    return createEmptyOrderList();
  }

  const itemsById = new Map();
  value.items.forEach((candidate) => {
    const id = sanitizeId(candidate?.id);
    const quantity = sanitizeQuantity(candidate?.quantity);
    if (!id || !quantity) {
      return;
    }

    const existing = itemsById.get(id);
    itemsById.set(id, {
      id,
      quantity: Math.min(
        (existing?.quantity ?? 0) + quantity,
        MAX_ORDER_QUANTITY,
      ),
      note: sanitizeOrderNote(candidate.note || existing?.note),
    });
  });

  return { version: ORDER_LIST_VERSION, items: Array.from(itemsById.values()) };
}

export function readOrderList(storage) {
  try {
    const targetStorage = storage ?? globalThis.localStorage;
    const storedValue = targetStorage?.getItem(ORDER_LIST_STORAGE_KEY);
    return storedValue
      ? sanitizeOrderList(JSON.parse(storedValue))
      : createEmptyOrderList();
  } catch (error) {
    console.warn('Order list could not be read:', error);
    return createEmptyOrderList();
  }
}

export function persistOrderList(list, storage) {
  const sanitized = sanitizeOrderList(list);
  try {
    const targetStorage = storage ?? globalThis.localStorage;
    targetStorage?.setItem(ORDER_LIST_STORAGE_KEY, JSON.stringify(sanitized));
    return true;
  } catch (error) {
    console.warn('Order list could not be stored:', error);
    return false;
  }
}

export function getItemQuantity(list, itemId) {
  return list.items.find((item) => item.id === itemId)?.quantity ?? 0;
}

export function setItemQuantity(list, itemId, quantity) {
  const id = sanitizeId(itemId);
  const safeQuantity = sanitizeQuantity(quantity);
  const existing = list.items.find((item) => item.id === id);

  if (!id || !safeQuantity) {
    return {
      ...list,
      items: list.items.filter((item) => item.id !== id),
    };
  }

  if (existing) {
    return {
      ...list,
      items: list.items.map((item) =>
        item.id === id ? { ...item, quantity: safeQuantity } : item,
      ),
    };
  }

  return {
    ...list,
    items: [...list.items, { id, quantity: safeQuantity, note: '' }],
  };
}

export function incrementItem(list, itemId) {
  return setItemQuantity(list, itemId, getItemQuantity(list, itemId) + 1);
}

export function removeItem(list, itemId) {
  return setItemQuantity(list, itemId, 0);
}

export function setItemNote(list, itemId, note) {
  const id = sanitizeId(itemId);
  return {
    ...list,
    items: list.items.map((item) =>
      item.id === id ? { ...item, note: sanitizeOrderNote(note) } : item,
    ),
  };
}

export function reconcileOrderList(list, menuItems) {
  const availableIds = new Set(menuItems.map((item) => item.id));
  return {
    ...list,
    items: list.items.filter((item) => availableIds.has(item.id)),
  };
}

export function getOrderUnitCount(list) {
  return list.items.reduce((count, item) => count + item.quantity, 0);
}

export function getOrderTotal(list, menuItems) {
  const pricesById = new Map(
    menuItems.map((item) => [item.id, Number(item.price)]),
  );
  return list.items.reduce((total, item) => {
    const price = pricesById.get(item.id);
    return Number.isFinite(price) ? total + price * item.quantity : total;
  }, 0);
}
