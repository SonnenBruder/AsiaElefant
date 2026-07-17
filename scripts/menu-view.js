import { getAllItems, getCategories } from './menu-data.js';
import {
  collectTagDefinitions,
  escapeHtml,
  formatPrice,
  itemDisplayNumber,
  itemMatchesSearch,
} from './menu-utils.js';

function renderTags(item, language) {
  return collectTagDefinitions(item)
    .map((tag) => {
      const label = language === 'de' ? tag.labelDe : tag.labelEn;
      return `<span class="tag-chip ${escapeHtml(tag.modifier)}">${escapeHtml(label)}</span>`;
    })
    .join('');
}

function renderMenuItem(item, category, options) {
  const { currency, language, getCopy, listQuantities } = options;
  const selectedQuantity = listQuantities.get(item.id) ?? 0;
  const number = itemDisplayNumber(item);
  const placeholderCopy = getCopy('imagePlaceholderLabel');
  const placeholderLabel =
    typeof placeholderCopy === 'function'
      ? placeholderCopy(category.name, item.name)
      : `${category.name}: ${item.name}`;

  const buttonCopy = selectedQuantity
    ? getCopy('orderAddAnother')
    : getCopy('orderAdd');

  return `
        <article class="menu-card group flex min-h-full flex-col overflow-hidden" data-menu-item="${escapeHtml(item.id)}">
          <div class="menu-card-media dish-placeholder relative flex aspect-[16/10] items-end p-4" role="img" aria-label="${escapeHtml(placeholderLabel)}">
            <div class="rounded-md border border-secondary/20 bg-background/78 px-3 py-2 glass-header">
              <p class="text-xs font-bold text-secondary">${escapeHtml(category.name)}</p>
              <p class="text-sm text-on-surface-variant">${escapeHtml(number)} · ${escapeHtml(getCopy('imagePending'))}</p>
            </div>
          </div>
          <div class="flex flex-1 flex-col p-5 md:p-6">
            <div class="flex items-start justify-between gap-4">
              <h3 class="min-w-0 font-headline-sm text-headline-sm text-on-surface">
                <span class="mr-2 text-secondary">${escapeHtml(number)}</span> ${escapeHtml(item.name)}
              </h3>
              <p class="shrink-0 font-headline-sm text-xl text-secondary">${escapeHtml(formatPrice(item.price, currency))}</p>
            </div>
            <p class="menu-card-description mt-4 flex-1 text-sm leading-6 text-on-surface-variant">${escapeHtml(item.description)}</p>
            <div class="mt-5 flex min-h-7 flex-wrap gap-2" aria-label="${escapeHtml(getCopy('tagGroupLabel'))}">
              ${renderTags(item, language)}
            </div>
            <button class="menu-add-button focus-ring mt-5" type="button" data-order-list-add="${escapeHtml(item.id)}">
              <span class="material-symbols-outlined text-[20px]" aria-hidden="true">playlist_add</span>
              <span>${escapeHtml(buttonCopy)}</span>
              ${
                selectedQuantity
                  ? `<span class="menu-selected-quantity">${escapeHtml(getCopy('orderSelectedQuantity'))}: ${selectedQuantity}</span>`
                  : ''
              }
            </button>
          </div>
        </article>`;
}

function renderCategory(category, options) {
  if (category.items.length === 0) {
    return '';
  }

  const dishCountCopy = options.getCopy('dishCount');
  const dishCount =
    typeof dishCountCopy === 'function'
      ? dishCountCopy(category.items.length)
      : String(category.items.length);

  return `
        <section class="scroll-mt-40" id="category-${escapeHtml(category.id)}" aria-labelledby="heading-${escapeHtml(category.id)}">
          <div class="mb-5 flex flex-col gap-2 border-b border-secondary/15 pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 id="heading-${escapeHtml(category.id)}" class="font-headline-md text-headline-md text-tertiary">${escapeHtml(category.name)}</h3>
              <p class="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">${escapeHtml(category.description)}</p>
            </div>
            <p class="text-sm font-bold text-secondary">${escapeHtml(dishCount)}</p>
          </div>
          <div class="menu-items-grid">
            ${category.items.map((item) => renderMenuItem(item, category, options)).join('')}
          </div>
        </section>`;
}

export function renderMenuView({
  data,
  activeCategory,
  searchQuery,
  language,
  getCopy,
  listQuantities,
}) {
  let visibleCount = 0;
  const markup = getCategories(data)
    .map((category) => {
      if (activeCategory !== 'all' && activeCategory !== category.id) {
        return '';
      }
      const items = category.items.filter((item) =>
        itemMatchesSearch(item, category, searchQuery),
      );
      visibleCount += items.length;
      return renderCategory(
        { ...category, items },
        {
          currency: data.currency,
          language,
          getCopy,
          listQuantities,
        },
      );
    })
    .join('');

  return { markup, visibleCount, totalCount: getAllItems(data).length };
}

export function renderCategoryControlsView(data, allCategoriesLabel) {
  return [
    { id: 'all', label: allCategoriesLabel },
    ...getCategories(data).map((category) => ({
      id: category.id,
      label: category.name,
    })),
  ]
    .map(
      (button) => `
        <button class="category-filter focus-ring shrink-0 px-4 py-3 text-sm font-bold" type="button" data-category-id="${escapeHtml(button.id)}" aria-controls="menu-grid" aria-pressed="false">
          ${escapeHtml(button.label)}
        </button>`,
    )
    .join('');
}