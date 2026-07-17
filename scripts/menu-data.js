export const MENU_DATA_URL = 'asia_elefant_menu.json';

export function getCategories(data) {
  return Array.isArray(data?.categories) ? data.categories : [];
}

export function getAllItems(data) {
  return getCategories(data).flatMap((category) =>
    Array.isArray(category.items) ? category.items : [],
  );
}

export function getPhoneLink(data) {
  const phoneLink = data?.contact?.phone_link;
  if (typeof phoneLink !== 'string' || !phoneLink.startsWith('tel:')) {
    throw new Error('Missing or invalid contact.phone_link in menu data.');
  }
  return phoneLink;
}

export function assertValidMenuData(data) {
  if (!data || typeof data !== 'object') {
    throw new TypeError('Menu data must be an object.');
  }
  if (typeof data.restaurant !== 'string' || data.restaurant.trim() === '') {
    throw new TypeError('Menu data is missing restaurant.');
  }
  if (typeof data.currency !== 'string' || data.currency.trim() === '') {
    throw new TypeError('Menu data is missing currency.');
  }

  getPhoneLink(data);
  const categories = getCategories(data);
  if (categories.length === 0) {
    throw new TypeError('Menu data must contain at least one category.');
  }

  categories.forEach((category) => {
    if (
      typeof category.id !== 'string' ||
      typeof category.name !== 'string' ||
      !Array.isArray(category.items)
    ) {
      throw new TypeError('Each menu category needs id, name and items.');
    }
    category.items.forEach((item) => {
      if (
        typeof item.id !== 'string' ||
        typeof item.name !== 'string' ||
        typeof item.item_number !== 'string'
      ) {
        throw new TypeError('Each menu item needs id, name and item_number.');
      }
      if (!Number.isFinite(Number(item.price))) {
        throw new TypeError(`Menu item ${item.id} has an invalid price.`);
      }
    });
  });
}

export async function loadMenuData() {
  try {
    const response = await fetch(MENU_DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(
        `Menu JSON request failed with ${response.status} ${response.statusText}`,
      );
    }
    const data = await response.json();
    assertValidMenuData(data);
    return data;
  } catch (error) {
    throw new Error(
      `Menue-Daten konnten nicht geladen werden. Bitte die Seite ueber einen Webserver oeffnen und ${MENU_DATA_URL} bereitstellen. (${error.message})`,
    );
  }
}