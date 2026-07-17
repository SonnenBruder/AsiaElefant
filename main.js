import {
  getAllItems,
  getCategories,
  getPhoneLink,
  loadMenuData,
} from './scripts/menu-data.js';
import {
  renderCategoryControlsView,
  renderMenuView,
} from './scripts/menu-view.js';
import {
  createEmptyOrderList,
  getItemQuantity,
  getOrderUnitCount,
  incrementItem,
  persistOrderList,
  readOrderList,
  reconcileOrderList,
  removeItem,
  setItemNote,
  setItemQuantity,
} from './scripts/order-list.js';
import {
  buildOrderListClipboardText,
  renderOrderListView,
} from './scripts/order-list-view.js';
import { escapeHtml } from './scripts/menu-utils.js';
import { getTranslation } from './scripts/translations.js';

const GRID_SIZE_OPTIONS = ['compact', 'standard', 'large'];
const DEFAULT_GRID_SIZE = 'standard';
const GRID_SIZE_STORAGE_KEY = 'asia-elefant-grid-size';

const state = {
  activeCategory: 'all',
  gridSize: DEFAULT_GRID_SIZE,
  language: 'de',
  orderList: createEmptyOrderList(),
  searchQuery: '',
};

let menuData;
let orderDialogOpener;
let orderCopyFeedbackTimer;
let menuSectionMode;
let menuScrollSyncFrame;
let menuToolbarCollapsed = false;
let menuToolbarUserCollapsed;
const nodes = {};

function setMenuToolbarCollapsed(collapsed) {
  menuToolbarCollapsed = Boolean(collapsed);
  nodes.menuToolbar.classList.toggle('is-collapsed', menuToolbarCollapsed);
  nodes.menuToolbarControls.hidden = menuToolbarCollapsed;
  nodes.menuToolbarToggle.setAttribute(
    'aria-expanded',
    String(!menuToolbarCollapsed),
  );
  nodes.menuToolbarChevron.textContent = menuToolbarCollapsed
    ? 'expand_more'
    : 'expand_less';
}

function getActiveCategoryLabel() {
  if (state.activeCategory === 'all') {
    return getCopy('allCategories');
  }

  return (
    getCategories(menuData).find(
      (category) => category.id === state.activeCategory,
    )?.name ?? getCopy('allCategories')
  );
}

function syncMenuToolbarSummary() {
  nodes.menuSearchSummary.textContent =
    state.searchQuery.trim() || getCopy('searchSummaryEmpty');
  nodes.menuCategorySummary.textContent = getActiveCategoryLabel();
}

function syncMenuScrollState() {
  menuScrollSyncFrame = undefined;
  const menuBounds = nodes.menuSection.getBoundingClientRect();
  const headerHeight = nodes.siteHeader.offsetHeight;
  const menuIsActive =
    menuBounds.top < window.innerHeight &&
    menuBounds.bottom > headerHeight;
  const shouldHideHeader =
    menuBounds.top <= 0 && menuBounds.bottom > headerHeight;

  if (shouldHideHeader !== menuSectionMode) {
    menuSectionMode = shouldHideHeader;
    document.body.classList.toggle('menu-section-mode', shouldHideHeader);
    nodes.siteHeader.inert = shouldHideHeader;
  }
  if (shouldHideHeader) {
    nodes.siteHeader.setAttribute('aria-hidden', 'true');
  } else {
    nodes.siteHeader.removeAttribute('aria-hidden');
  }

  if (!menuIsActive) {
    menuToolbarUserCollapsed = undefined;
  }

  const toolbarBounds = nodes.menuToolbar.getBoundingClientRect();
  const controlsHaveFocus = nodes.menuToolbarControls.contains(
    document.activeElement,
  );
  const shouldAutoCollapse =
    shouldHideHeader &&
    !controlsHaveFocus &&
    nodes.menuGrid.getBoundingClientRect().top <= toolbarBounds.bottom;
  setMenuToolbarCollapsed(
    menuToolbarUserCollapsed ?? shouldAutoCollapse,
  );
}

function scheduleMenuScrollSync() {
  if (menuScrollSyncFrame !== undefined) {
    return;
  }

  menuScrollSyncFrame = requestAnimationFrame(syncMenuScrollState);
}

function toggleMenuToolbar() {
  menuToolbarUserCollapsed = !menuToolbarCollapsed;
  setMenuToolbarCollapsed(menuToolbarUserCollapsed);
}

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
    listQuantities: new Map(
      state.orderList.items.map((item) => [item.id, item.quantity]),
    ),
  });

  syncGridSizeControls();
  nodes.menuGrid.innerHTML = markup;
  nodes.menuGrid.setAttribute('aria-busy', 'false');
  nodes.emptyState.classList.toggle('hidden', visibleCount !== 0);
  updateResultCount(visibleCount, totalCount);
  scheduleMenuScrollSync();
}

function getMenuItem(itemId) {
  return getAllItems(menuData).find((item) => item.id === itemId);
}

function updateOrderBadges() {
  const count = getOrderUnitCount(state.orderList);
  document.querySelectorAll('[data-order-list-count]').forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function renderOrderList() {
  const { itemsMarkup, totalMarkup } = renderOrderListView({
    list: state.orderList,
    data: menuData,
    getCopy,
  });
  nodes.orderListItems.innerHTML = itemsMarkup;
  nodes.orderListTotal.innerHTML = totalMarkup;
  updateOrderBadges();
}

function copyTextWithFallback(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '-9999px';
  textarea.style.width = '1px';
  textarea.style.height = '1px';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.append(textarea);

  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    if (!document.execCommand('copy')) {
      throw new Error('Copy command was rejected');
    }
  } finally {
    textarea.remove();
  }
}

async function writeOrderListClipboardText(text) {
  if (typeof navigator.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {}
  }

  copyTextWithFallback(text);
}

function clearOrderCopyFeedbackTimer() {
  if (orderCopyFeedbackTimer) {
    clearTimeout(orderCopyFeedbackTimer);
    orderCopyFeedbackTimer = undefined;
  }
}

function showOrderCopyFeedback(button, translationKey) {
  clearOrderCopyFeedbackTimer();

  const feedback = getCopy(translationKey);
  const label = button.querySelector('[data-order-list-copy-label]');
  if (label && typeof feedback === 'string') {
    label.textContent = feedback;
  }
  if (typeof feedback === 'string') {
    nodes.orderListStatus.textContent = feedback;
  }
  if (button.isConnected) {
    button.focus({ preventScroll: true });
  }

  orderCopyFeedbackTimer = setTimeout(() => {
    orderCopyFeedbackTimer = undefined;
    if (!button.isConnected || !nodes.orderListTotal.contains(button)) {
      return;
    }

    const currentLabel = button.querySelector(
      '[data-order-list-copy-label]',
    );
    if (currentLabel) {
      currentLabel.textContent = getCopy('orderCopyLabel');
    }
  }, 2000);
}

async function handleOrderListTotalClick(event) {
  const button = event.target.closest('[data-order-list-copy]');
  if (!button || !nodes.orderListTotal.contains(button)) {
    return;
  }

  const text = buildOrderListClipboardText(state.orderList, menuData);
  if (!text) {
    return;
  }

  clearOrderCopyFeedbackTimer();
  try {
    await writeOrderListClipboardText(text);
    showOrderCopyFeedback(button, 'orderCopySuccess');
  } catch (error) {
    console.warn('Order list could not be copied.');
    showOrderCopyFeedback(button, 'orderCopyFailure');
  }
}

function focusItemControl(container, selector, datasetKey, itemId) {
  const control = Array.from(container.querySelectorAll(selector)).find(
    (candidate) => candidate.dataset[datasetKey] === itemId,
  );
  control?.focus();
  return Boolean(control);
}

function restoreOrderListFocus(focusContext) {
  if (!focusContext) {
    return;
  }

  if (
    focusItemControl(
      focusContext.container,
      focusContext.selector,
      focusContext.datasetKey,
      focusContext.itemId,
    )
  ) {
    return;
  }

  if (focusContext.fallbackIndex === undefined) {
    return;
  }

  const quantityControls = nodes.orderListItems.querySelectorAll(
    '[data-order-list-decrease]',
  );
  const fallbackControl =
    quantityControls[
      Math.min(focusContext.fallbackIndex, quantityControls.length - 1)
    ] ?? nodes.orderListClose;
  fallbackControl.focus();
}

function announceOrderUpdate(itemId) {
  const item = getMenuItem(itemId);
  if (!item) {
    return;
  }

  const quantity = getItemQuantity(state.orderList, itemId);
  const updateCopy = getCopy('orderUpdatedAnnouncement');
  const countCopy = getCopy('orderCountAnnouncement');
  const update =
    typeof updateCopy === 'function'
      ? updateCopy(item.name, quantity)
      : item.name;
  const count = getOrderUnitCount(state.orderList);
  const countText =
    typeof countCopy === 'function' ? countCopy(count) : String(count);
  nodes.orderListStatus.textContent = `${update}. ${countText}`;
}

function commitOrderList(nextList, itemId, focusContext) {
  state.orderList = nextList;
  persistOrderList(state.orderList);
  renderMenu();
  renderOrderList();
  restoreOrderListFocus(focusContext);
  announceOrderUpdate(itemId);
}

function handleMenuOrderClick(event) {
  const button = event.target.closest('[data-order-list-add]');
  if (!button || !nodes.menuGrid.contains(button)) {
    return;
  }

  const itemId = button.dataset.orderListAdd;
  commitOrderList(incrementItem(state.orderList, itemId), itemId, {
    container: nodes.menuGrid,
    selector: '[data-order-list-add]',
    datasetKey: 'orderListAdd',
    itemId,
  });
}

function handleOrderListClick(event) {
  const decrease = event.target.closest('[data-order-list-decrease]');
  const increase = event.target.closest('[data-order-list-increase]');
  const remove = event.target.closest('[data-order-list-remove]');
  const control = decrease || increase || remove;
  if (!control || !nodes.orderListItems.contains(control)) {
    return;
  }

  const itemId =
    control.dataset.orderListDecrease ||
    control.dataset.orderListIncrease ||
    control.dataset.orderListRemove;
  const fallbackIndex = Math.max(
    state.orderList.items.findIndex((item) => item.id === itemId),
    0,
  );
  if (increase) {
    commitOrderList(incrementItem(state.orderList, itemId), itemId, {
      container: nodes.orderListItems,
      selector: '[data-order-list-increase]',
      datasetKey: 'orderListIncrease',
      itemId,
      fallbackIndex,
    });
  } else if (decrease) {
    commitOrderList(
      setItemQuantity(
        state.orderList,
        itemId,
        getItemQuantity(state.orderList, itemId) - 1,
      ),
      itemId,
      {
        container: nodes.orderListItems,
        selector: '[data-order-list-decrease]',
        datasetKey: 'orderListDecrease',
        itemId,
        fallbackIndex,
      },
    );
  } else {
    commitOrderList(removeItem(state.orderList, itemId), itemId, {
      container: nodes.orderListItems,
      selector: '[data-order-list-remove]',
      datasetKey: 'orderListRemove',
      itemId,
      fallbackIndex,
    });
  }
}

function handleOrderNoteInput(event) {
  if (!event.target.matches('[data-order-list-note]')) {
    return;
  }

  state.orderList = setItemNote(
    state.orderList,
    event.target.dataset.orderListNote,
    event.target.value,
  );
  persistOrderList(state.orderList);
}

function openOrderList(event) {
  orderDialogOpener = event.currentTarget;
  renderOrderList();
  if (!nodes.orderListDialog.open) {
    nodes.orderListDialog.showModal();
  }
}

function closeOrderList() {
  nodes.orderListDialog.close();
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
  syncMenuToolbarSummary();
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
  renderOrderList();
  syncMenuToolbarSummary();
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
  nodes.siteHeader = requireNode('.site-header');
  nodes.menuSection = requireNode('#menu');
  nodes.menuToolbar = requireNode('.menu-toolbar');
  nodes.menuToolbarToggle = requireNode('#menu-toolbar-toggle');
  nodes.menuToolbarControls = requireNode('#menu-toolbar-controls');
  nodes.menuToolbarChevron = requireNode('.menu-toolbar__chevron');
  nodes.menuSearchSummary = requireNode('#menu-search-summary');
  nodes.menuCategorySummary = requireNode('#menu-category-summary');
  nodes.searchInput = requireNode('#menu-search');
  nodes.categoryFilters = requireNode('#category-filters');
  nodes.mobileCategoryFilters = requireNode('#mobile-category-filters');
  nodes.menuGrid = requireNode('#menu-grid');
  nodes.emptyState = requireNode('#empty-state');
  nodes.resultCount = requireNode('#result-count');
  nodes.orderListDialog = requireNode('#order-list-dialog');
  nodes.orderListItems = requireNode('#order-list-items');
  nodes.orderListTotal = requireNode('#order-list-total');
  nodes.orderListStatus = requireNode('#order-list-status');
  nodes.orderListClose = requireNode('#order-list-close');
}

async function init() {
  cacheNodes();
  state.orderList = readOrderList();
  state.gridSize = readStoredGridSize();
  menuData = await loadMenuData();
  state.orderList = reconcileOrderList(state.orderList, getAllItems(menuData));
  persistOrderList(state.orderList);
  updateStaticCopy();
  window.addEventListener('scroll', scheduleMenuScrollSync, { passive: true });
  window.addEventListener('resize', scheduleMenuScrollSync);
  document.addEventListener('focusin', scheduleMenuScrollSync);

  nodes.searchInput.addEventListener('input', applyFilters);
  nodes.menuToolbarToggle.addEventListener('click', toggleMenuToolbar);
  nodes.menuGrid.addEventListener('click', handleMenuOrderClick);
  nodes.orderListItems.addEventListener('click', handleOrderListClick);
  nodes.orderListItems.addEventListener('input', handleOrderNoteInput);
  nodes.orderListTotal.addEventListener('click', handleOrderListTotalClick);
  nodes.orderListClose.addEventListener('click', closeOrderList);
  nodes.orderListDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeOrderList();
    }
  });
  nodes.orderListDialog.addEventListener('click', (event) => {
    if (event.target === nodes.orderListDialog) {
      closeOrderList();
    }
  });
  nodes.orderListDialog.addEventListener('close', () => {
    orderDialogOpener?.focus();
    orderDialogOpener = undefined;
  });
  document.querySelectorAll('[data-order-list-open]').forEach((button) => {
    button.addEventListener('click', openOrderList);
  });
  document.querySelectorAll('[data-language]').forEach((button) => {
    button.addEventListener('click', () => setLanguage(button.dataset.language));
  });
  document.querySelectorAll('button[data-grid-size]').forEach((button) => {
    button.addEventListener('click', () => setGridSize(button.dataset.gridSize));
  });
  scheduleMenuScrollSync();
}

init().catch(renderFatalError);
