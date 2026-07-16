const MENU_DATA_URL = 'asia_elefant_menu_json_updated_with_numbers.json';

const copy = {
  de: {
    navHome: 'Start',
    navMenu: 'Speisekarte',
    navInfo: 'Info',
    navContact: 'Kontakt',
    navCall: 'Anrufen',
    heroKicker: 'Asia Elefant Schorndorf',
    heroTitle: 'Speisekarte',
    heroSubtitle:
      'Sushi, Wok-Spezialitaeten und telefonische Bestellung in einer ruhigen, klaren Restaurantansicht.',
    heroSubtitleSecondary:
      'Menu browsing, search, category filters and click-to-call ordering for local guests.',
    browseMenu: 'Speisekarte ansehen',
    imagePlaceholderTitle: 'Bildplatzhalter',
    imagePlaceholderText:
      'Reserviert fuer freigegebene Speisen- und Restaurantfotografie.',
    phoneLabel: 'Telefon',
    serviceLabel: 'Service',
    serviceText: 'Anrufen & abholen',
    menuKicker: 'Speisekarte / Menu',
    menuHeading: 'Gerichte entdecken',
    searchLabel: 'Speisekarte durchsuchen',
    searchPlaceholder: 'Suche nach Gericht, Nummer oder Tag...',
    emptyTitle: 'Keine Treffer',
    emptyText: 'Passe Suche oder Kategorie an.',
    infoKicker: 'Restaurantinfo / Restaurant Info',
    infoHeading: 'Asia Elefant Schorndorf',
    infoIntro:
      'Lokale asiatische Kueche mit Sushi-Bar, Wok-Gerichten und direkter telefonischer Bestellung. Real address, opening hours and legal details should be inserted after approval.',
    contactHeading: 'Kontakt',
    contactText: 'Bestellung und Rueckfragen direkt per Telefon.',
    locationHeading: 'Standort',
    locationText:
      'Adresse folgt als Inhaltsplatzhalter, sobald die finalen Standortdaten freigegeben sind.',
    hoursHeading: 'Oeffnungszeiten',
    hoursText: 'Zeiten folgen als Platzhalter bis zur finalen Inhaltsfreigabe.',
    legalHeading: 'Rechtliches',
    legalText:
      'Impressum, Datenschutz und Allergene als Platzhalter fuer Version eins.',
    footerText:
      'Statische Version eins: Speisekarte, Suche, Kategorie-Filter und Telefonkontakt.',
    footerImprint: 'Impressum folgt',
    footerPrivacy: 'Datenschutz folgt',
    footerAllergens: 'Allergene folgen',
    allCategories: 'Alle / All',
    resultCount: (visible, total) =>
      `${visible} von ${total} Gerichten sichtbar`,
    callHeader: (phone) => `Anrufen: ${phone}`,
    callHero: () => 'Anrufen & bestellen',
    callMenu: () => 'Telefonisch bestellen',
    callInfo: () => 'Anrufen',
    callFooter: (phone) => phone,
  },
  en: {
    navHome: 'Home',
    navMenu: 'Menu',
    navInfo: 'Info',
    navContact: 'Contact',
    navCall: 'Call',
    heroKicker: 'Asia Elefant Schorndorf',
    heroTitle: 'Menu',
    heroSubtitle:
      'Sushi, wok specialties and phone ordering in a calm, focused restaurant view.',
    heroSubtitleSecondary:
      'Deutsch bleibt die Primaersprache; English UI copy is available for browsing and calls.',
    browseMenu: 'Browse menu',
    imagePlaceholderTitle: 'Image placeholder',
    imagePlaceholderText:
      'Reserved for approved dish and restaurant photography.',
    phoneLabel: 'Phone',
    serviceLabel: 'Service',
    serviceText: 'Call & collect',
    menuKicker: 'Menu / Speisekarte',
    menuHeading: 'Browse dishes',
    searchLabel: 'Search menu',
    searchPlaceholder: 'Search by dish, number or tag...',
    emptyTitle: 'No matches',
    emptyText: 'Adjust the search or category filter.',
    infoKicker: 'Restaurant Info / Restaurantinfo',
    infoHeading: 'Asia Elefant Schorndorf',
    infoIntro:
      'Local Asian cuisine with sushi bar, wok dishes and direct phone ordering. Adresse, Oeffnungszeiten und rechtliche Angaben folgen nach Freigabe.',
    contactHeading: 'Contact',
    contactText: 'Orders and questions directly by phone.',
    locationHeading: 'Location',
    locationText:
      'Address placeholder until the final location details are approved.',
    hoursHeading: 'Opening hours',
    hoursText: 'Opening hours placeholder until final content approval.',
    legalHeading: 'Legal',
    legalText:
      'Imprint, privacy and allergen links are placeholders for version one.',
    footerText:
      'Static version one: menu, search, category filters and phone contact.',
    footerImprint: 'Imprint pending',
    footerPrivacy: 'Privacy pending',
    footerAllergens: 'Allergens pending',
    allCategories: 'All / Alle',
    resultCount: (visible, total) => `${visible} of ${total} dishes visible`,
    callHeader: (phone) => `Call: ${phone}`,
    callHero: () => 'Call to order',
    callMenu: () => 'Order by phone',
    callInfo: () => 'Call',
    callFooter: (phone) => phone,
  },
};

const state = {
  activeCategory: 'all',
  language: 'de',
  searchQuery: '',
};

const nodes = {};

function escapeHtml(value) {
  return String(value ?? '').replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character],
  );
}

function getCopy(key) {
  return copy[state.language]?.[key] ?? copy.de[key] ?? key;
}

function getCategories(data) {
  return Array.isArray(data?.categories) ? data.categories : [];
}

function getAllItems(data) {
  return getCategories(data).flatMap((category) =>
    Array.isArray(category.items) ? category.items : [],
  );
}

async function loadMenuData() {
  if (window.location.protocol === 'file:') {
    return embeddedMenuData;
  }

  try {
    const response = await fetch(MENU_DATA_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(
        `Menu JSON request failed with ${response.status} ${response.statusText}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.warn('Falling back to embedded menu data:', error);
    return embeddedMenuData;
  }
}

function getPhoneLink(data) {
  const phoneLink = data?.contact?.phone_link;
  if (typeof phoneLink !== 'string' || !phoneLink.startsWith('tel:')) {
    throw new Error('Missing or invalid contact.phone_link in menu data.');
  }
  return phoneLink;
}

function assertValidMenuData(data) {
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
  if (getCategories(data).length === 0) {
    throw new TypeError('Menu data must contain at least one category.');
  }
  getCategories(data).forEach((category) => {
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

function formatPrice(price, currency) {
  const numericPrice = Number(price);
  if (!Number.isFinite(numericPrice)) {
    return 'Preis folgt';
  }
  const safeCurrency =
    typeof currency === 'string' && currency.trim() ? currency : 'EUR';
  try {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: safeCurrency,
    }).format(numericPrice);
  } catch (error) {
    console.warn('Price formatting failed:', error);
    return `${numericPrice.toFixed(2)} ${safeCurrency}`;
  }
}

function itemDisplayNumber(item) {
  if (!item || typeof item !== 'object') {
    return '';
  }
  const prefix =
    typeof item.number_prefix === 'string' ? item.number_prefix.trim() : '';
  const number =
    typeof item.item_number === 'string' || typeof item.item_number === 'number'
      ? String(item.item_number).trim()
      : '';
  return `${prefix}${number}`;
}

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .trim();
}

function addChip(chips, key, labelDe, labelEn, modifier) {
  if (!chips.has(key)) {
    chips.set(key, { labelDe, labelEn, modifier });
  }
}

function collectTagDefinitions(item) {
  const chips = new Map();
  const rawTags = Array.isArray(item?.tags) ? item.tags : [];
  rawTags.forEach((tag) => {
    const normalizedTag = normalizeText(tag);
    if (
      ['gf', 'glutenfrei', 'gluten free', 'gluten-free'].includes(normalizedTag)
    ) {
      addChip(
        chips,
        'gluten-free',
        'GF Glutenfrei',
        'GF Gluten free',
        'tag-chip--diet',
      );
    } else if (['spicy', 'scharf', 'hot'].includes(normalizedTag)) {
      addChip(chips, 'spicy', 'Scharf', 'Spicy', 'tag-chip--hot');
    } else if (['vegan'].includes(normalizedTag)) {
      addChip(chips, 'vegan', 'Vegan', 'Vegan', 'tag-chip--diet');
    } else if (normalizedTag) {
      addChip(chips, normalizedTag, String(tag), String(tag), '');
    }
  });

  const attributes = item?.attributes ?? {};
  if (attributes.is_spicy === true) {
    addChip(chips, 'spicy', 'Scharf', 'Spicy', 'tag-chip--hot');
  }
  if (attributes.is_vegan === true) {
    addChip(chips, 'vegan', 'Vegan', 'Vegan', 'tag-chip--diet');
  }
  if (attributes.is_gluten_free === true) {
    addChip(
      chips,
      'gluten-free',
      'GF Glutenfrei',
      'GF Gluten free',
      'tag-chip--diet',
    );
  }
  return Array.from(chips.values());
}

function renderTags(item) {
  const tags = collectTagDefinitions(item);
  if (tags.length === 0) {
    return '';
  }
  return tags
    .map((tag) => {
      const label = state.language === 'de' ? tag.labelDe : tag.labelEn;
      return `<span class="tag-chip ${escapeHtml(tag.modifier)}">${escapeHtml(label)}</span>`;
    })
    .join('');
}

function buildSearchText(item, category) {
  const attributes = item?.attributes ?? {};
  const dietaryTerms = [
    attributes.is_spicy === true ? 'scharf spicy hot' : '',
    attributes.is_vegan === true ? 'vegan' : '',
    attributes.is_gluten_free === true
      ? 'gf glutenfrei gluten free gluten-free'
      : '',
  ].join(' ');
  const tagTerms = collectTagDefinitions(item)
    .map((tag) => `${tag.labelDe} ${tag.labelEn}`)
    .join(' ');
  return normalizeText(
    [
      itemDisplayNumber(item),
      item?.name,
      item?.description,
      Array.isArray(item?.tags) ? item.tags.join(' ') : '',
      tagTerms,
      dietaryTerms,
      category?.name,
      category?.description,
    ].join(' '),
  );
}

function itemMatchesSearch(item, category) {
  if (!state.searchQuery) {
    return true;
  }
  return buildSearchText(item, category).includes(
    normalizeText(state.searchQuery),
  );
}

function filterItems(category) {
  const items = Array.isArray(category?.items) ? category.items : [];
  return items.filter((item) => itemMatchesSearch(item, category));
}

function renderMenuItem(item, category) {
  const number = itemDisplayNumber(item);
  const tags = renderTags(item);
  const placeholderLabel = `${category.name}: ${item.name} Bildplatzhalter / image placeholder`;
  return `
        <article class="menu-card group flex min-h-full flex-col overflow-hidden" data-menu-item="${escapeHtml(item.id)}">
          <div class="dish-placeholder relative flex aspect-[16/10] items-end p-4" role="img" aria-label="${escapeHtml(placeholderLabel)}">
            <div class="rounded-md border border-secondary/20 bg-background/78 px-3 py-2 glass-header">
              <p class="text-xs font-bold text-secondary">${escapeHtml(category.name)}</p>
              <p class="text-sm text-on-surface-variant">${escapeHtml(number)} · ${state.language === 'de' ? 'Bild folgt' : 'Image pending'}</p>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-5 md:p-6">
            <div class="flex items-start justify-between gap-4">
              <h3 class="min-w-0 font-headline-sm text-headline-sm text-on-surface">
                <span class="mr-2 text-secondary">${escapeHtml(number)}</span> ${escapeHtml(item.name)}
              </h3>
              <p class="shrink-0 font-headline-sm text-xl text-secondary">${escapeHtml(formatPrice(item.price, menuData.currency))}</p>
            </div>
            <p class="mt-4 flex-1 text-sm leading-6 text-on-surface-variant">${escapeHtml(item.description)}</p>
            <div class="mt-5 flex min-h-7 flex-wrap gap-2" aria-label="Tags / dietary notes">
              ${tags}
            </div>
          </div>
        </article>`;
}

function renderCategory(category) {
  const safeItems = Array.isArray(category?.items) ? category.items : [];
  if (safeItems.length === 0) {
    return '';
  }
  return `
        <section class="scroll-mt-40" id="category-${escapeHtml(category.id)}" aria-labelledby="heading-${escapeHtml(category.id)}">
          <div class="mb-5 flex flex-col gap-2 border-b border-secondary/15 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 id="heading-${escapeHtml(category.id)}" class="font-headline-md text-headline-md text-tertiary">${escapeHtml(category.name)}</h3>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">${escapeHtml(category.description)}</p>
            </div>
            <p class="text-sm font-bold text-secondary">${safeItems.length} ${state.language === 'de' ? 'Gerichte' : 'dishes'}</p>
          </div>
          <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            ${safeItems.map((item) => renderMenuItem(item, category)).join('')}
          </div>
        </section>`;
}

function renderMenu(data) {
  assertValidMenuData(data);
  const categories = getCategories(data);
  let visibleCount = 0;
  const sections = categories
    .map((category) => {
      if (
        state.activeCategory !== 'all' &&
        state.activeCategory !== category.id
      ) {
        return '';
      }
      const visibleItems = filterItems(category);
      visibleCount += visibleItems.length;
      return renderCategory({ ...category, items: visibleItems });
    })
    .join('');

  nodes.menuGrid.innerHTML = sections;
  nodes.menuGrid.setAttribute('aria-busy', 'false');
  nodes.emptyState.classList.toggle('hidden', visibleCount !== 0);
  updateResultCount(visibleCount, getAllItems(data).length);
}

function renderCategoryControls(data) {
  const categories = getCategories(data);
  const buttons = [
    { id: 'all', label: getCopy('allCategories') },
    ...categories.map((category) => ({
      id: category.id,
      label: category.name,
    })),
  ];
  const markup = buttons
    .map(
      (button) => `
        <button class="category-filter focus-ring shrink-0 px-4 py-3 text-sm font-bold" type="button" data-category-id="${escapeHtml(button.id)}" aria-controls="menu-grid" aria-pressed="false">
          ${escapeHtml(button.label)}
        </button>`,
    )
    .join('');

  [nodes.categoryFilters, nodes.mobileCategoryFilters].forEach(
    (filterGroup) => {
      filterGroup.innerHTML = markup;
      filterGroup.querySelectorAll('[data-category-id]').forEach((button) => {
        button.addEventListener('click', () =>
          setActiveCategory(button.dataset.categoryId),
        );
      });
    },
  );
  syncActiveCategoryControls();
}

function syncActiveCategoryControls() {
  document.querySelectorAll('[data-category-id]').forEach((button) => {
    const isActive = button.dataset.categoryId === state.activeCategory;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function setActiveCategory(categoryId) {
  const validIds = new Set([
    'all',
    ...getCategories(menuData).map((category) => category.id),
  ]);
  state.activeCategory = validIds.has(categoryId) ? categoryId : 'all';
  syncActiveCategoryControls();
  applyFilters();
}

function applyFilters() {
  state.searchQuery = nodes.searchInput?.value ?? '';
  renderMenu(menuData);
  syncActiveCategoryControls();
}

function updateResultCount(visible, total) {
  const resultCopy = getCopy('resultCount');
  nodes.resultCount.textContent =
    typeof resultCopy === 'function'
      ? resultCopy(visible, total)
      : `${visible}/${total}`;
}

function updateStaticCopy() {
  document.documentElement.lang = state.language;
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = getCopy(element.dataset.i18n);
    if (typeof value === 'string') {
      element.textContent = value;
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const value = getCopy(element.dataset.i18nPlaceholder);
    if (typeof value === 'string') {
      element.setAttribute('placeholder', value);
    }
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    const isActive = button.dataset.language === state.language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
  updatePhoneActions();
  renderCategoryControls(menuData);
  renderMenu(menuData);
}

function updatePhoneActions() {
  const phone = menuData.contact.phone;
  const phoneLink = getPhoneLink(menuData);
  document.querySelectorAll('[data-phone-action]').forEach((link) => {
    link.setAttribute('href', phoneLink);
    const labelSlot = link.querySelector('.phone-label');
    const labelKey = link.dataset.phoneLabel;
    if (labelSlot && labelKey) {
      const labelCopy = getCopy(
        `call${labelKey.charAt(0).toUpperCase()}${labelKey.slice(1)}`,
      );
      labelSlot.textContent =
        typeof labelCopy === 'function' ? labelCopy(phone) : phone;
    }
  });
  document.querySelectorAll('[data-restaurant-phone]').forEach((element) => {
    element.textContent = phone;
  });
}

function setLanguage(language) {
  state.language = language === 'en' ? 'en' : 'de';
  updateStaticCopy();
}

function renderFatalError(error) {
  console.error(error);
  if (nodes.menuGrid) {
    nodes.menuGrid.setAttribute('aria-busy', 'false');
    nodes.menuGrid.innerHTML = `
          <div class="surface-panel p-8" role="alert">
            <h2 class="font-headline-sm text-headline-sm text-error">Menue konnte nicht geladen werden</h2>
            <p class="mt-3 text-sm text-on-surface-variant">${escapeHtml(error.message)}</p>
          </div>`;
  }
}

function requireNode(selector) {
  const node = document.querySelector(selector);
  if (!node) {
    throw new Error(`Missing required page element: ${selector}`);
  }
  return node;
}

function cacheNodes() {
  nodes.searchInput = requireNode('#menu-search');
  nodes.categoryFilters = requireNode('#category-filters');
  nodes.mobileCategoryFilters = requireNode('#mobile-category-filters');
  nodes.menuGrid = requireNode('#menu-grid');
  nodes.emptyState = requireNode('#empty-state');
  nodes.resultCount = requireNode('#result-count');
}

async function init() {
  cacheNodes();
  menuData = await loadMenuData();

  assertValidMenuData(menuData);
  updateStaticCopy();

  nodes.searchInput.addEventListener('input', applyFilters);
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () =>
      setLanguage(button.dataset.language),
    );
  });
}

init().catch(renderFatalError);
