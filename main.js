import {
  getCategories,
  getPhoneLink,
  loadMenuData,
} from './scripts/menu-data.js';
import {
  renderCategoryControlsView,
  renderMenuView,
} from './scripts/menu-view.js';
import { escapeHtml } from './scripts/menu-utils.js';
import { getTranslation } from './scripts/translations.js';

const GRID_SIZE_OPTIONS = ['compact', 'standard', 'large'];
const DEFAULT_GRID_SIZE = 'standard';
const GRID_SIZE_STORAGE_KEY = 'asia-elefant-grid-size';

const state = {
  activeCategory: 'all',
  gridSize: DEFAULT_GRID_SIZE,
  language: 'de',
  searchQuery: '',
};

let menuData;
const nodes = {};

function getCopy(key) {
  return getTranslation(state.language, key);
}

function gridSizeOrDefault(value) {
  return GRID_SIZE_OPTIONS.includes(value) ? value : DEFAULT_GRID_SIZE;
}

function readStoredGridSize() {
  try {
    return gridSizeOrDefault(localStorage.getItem(GRID_SIZE_STORAGE_KEY));
  } catch (error) {
    return DEFAULT_GRID_SIZE;
  }
}

function storeGridSize(gridSize) {
  try {
    localStorage.setItem(GRID_SIZE_STORAGE_KEY, gridSize);
  } catch (error) {
    console.warn('Grid size preference could not be stored:', error);
  }
}

function syncGridSizeControls() {
  nodes.menuGrid.dataset.gridSize = state.gridSize;
  document.querySelectorAll('button[data-grid-size]').forEach((button) => {
    const isActive = button.dataset.gridSize === state.gridSize;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function setGridSize(gridSize) {
  state.gridSize = gridSizeOrDefault(gridSize);
  storeGridSize(state.gridSize);
  syncGridSizeControls();
}

function updateResultCount(visible, total) {
  const resultCopy = getCopy('resultCount');
  nodes.resultCount.textContent =
    typeof resultCopy === 'function'
      ? resultCopy(visible, total)
      : `${visible}/${total}`;
}

function renderMenu() {
  const { markup, visibleCount, totalCount } = renderMenuView({
    data: menuData,
    activeCategory: state.activeCategory,
    searchQuery: state.searchQuery,
    language: state.language,
    getCopy,
  });

  syncGridSizeControls();
  nodes.menuGrid.innerHTML = markup;
  nodes.menuGrid.setAttribute('aria-busy', 'false');
  nodes.emptyState.classList.toggle('hidden', visibleCount !== 0);
  updateResultCount(visibleCount, totalCount);
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

function renderCategoryControls() {
  const markup = renderCategoryControlsView(menuData, getCopy('allCategories'));
  [nodes.categoryFilters, nodes.mobileCategoryFilters].forEach((filterGroup) => {
    filterGroup.innerHTML = markup;
    filterGroup.querySelectorAll('[data-category-id]').forEach((button) => {
      button.addEventListener('click', () =>
        setActiveCategory(button.dataset.categoryId),
      );
    });
  });
  syncActiveCategoryControls();
}

function applyFilters() {
  state.searchQuery = nodes.searchInput.value;
  renderMenu();
  syncActiveCategoryControls();
}

function updatePhoneActions() {
  const phone = menuData.contact.phone;
  const phoneLink = getPhoneLink(menuData);

  document.querySelectorAll('[data-phone-action]').forEach((link) => {
    link.setAttribute('href', phoneLink);
    const labelSlot = link.querySelector('.phone-label');
    const labelKey = link.dataset.phoneLabel;
    if (labelSlot && labelKey) {
      const translationKey = `call${labelKey.charAt(0).toUpperCase()}${labelKey.slice(1)}`;
      const labelCopy = getCopy(translationKey);
      labelSlot.textContent =
        typeof labelCopy === 'function' ? labelCopy(phone) : phone;
    }
  });
  document.querySelectorAll('[data-restaurant-phone]').forEach((element) => {
    element.textContent = phone;
  });
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
  document.querySelectorAll('[data-i18n-aria-label]').forEach((element) => {
    const value = getCopy(element.dataset.i18nAriaLabel);
    if (typeof value === 'string') {
      element.setAttribute('aria-label', value);
    }
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    const isActive = button.dataset.language === state.language;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  syncGridSizeControls();
  updatePhoneActions();
  renderCategoryControls();
  renderMenu();
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
  state.gridSize = readStoredGridSize();
  menuData = await loadMenuData();
  updateStaticCopy();

  nodes.searchInput.addEventListener('input', applyFilters);
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  document.querySelectorAll('button[data-grid-size]').forEach((button) => {
    button.addEventListener('click', () => setGridSize(button.dataset.gridSize));
  });
}

init().catch(renderFatalError);