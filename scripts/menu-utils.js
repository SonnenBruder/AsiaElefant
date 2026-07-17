export function escapeHtml(value) {
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

export function formatPrice(price, currency) {
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

export function itemDisplayNumber(item) {
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

export function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .trim();
}

function addTag(tags, key, labelDe, labelEn, modifier) {
  if (!tags.has(key)) {
    tags.set(key, { labelDe, labelEn, modifier });
  }
}

export function collectTagDefinitions(item) {
  const tags = new Map();
  const rawTags = Array.isArray(item?.tags) ? item.tags : [];

  rawTags.forEach((tag) => {
    const normalizedTag = normalizeText(tag);
    if (['gf', 'glutenfrei', 'gluten free', 'gluten-free'].includes(normalizedTag)) {
      addTag(tags, 'gluten-free', 'GF Glutenfrei', 'GF Gluten free', 'tag-chip--diet');
    } else if (['spicy', 'scharf', 'hot'].includes(normalizedTag)) {
      addTag(tags, 'spicy', 'Scharf', 'Spicy', 'tag-chip--hot');
    } else if (normalizedTag === 'vegan') {
      addTag(tags, 'vegan', 'Vegan', 'Vegan', 'tag-chip--diet');
    } else if (normalizedTag) {
      addTag(tags, normalizedTag, String(tag), String(tag), '');
    }
  });

  const attributes = item?.attributes ?? {};
  if (attributes.is_spicy === true) {
    addTag(tags, 'spicy', 'Scharf', 'Spicy', 'tag-chip--hot');
  }
  if (attributes.is_vegan === true) {
    addTag(tags, 'vegan', 'Vegan', 'Vegan', 'tag-chip--diet');
  }
  if (attributes.is_gluten_free === true) {
    addTag(tags, 'gluten-free', 'GF Glutenfrei', 'GF Gluten free', 'tag-chip--diet');
  }

  return Array.from(tags.values());
}

export function buildSearchText(item, category) {
  const attributes = item?.attributes ?? {};
  const dietaryTerms = [
    attributes.is_spicy === true ? 'scharf spicy hot' : '',
    attributes.is_vegan === true ? 'vegan' : '',
    attributes.is_gluten_free === true ? 'gf glutenfrei gluten free gluten-free' : '',
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

export function itemMatchesSearch(item, category, query) {
  const normalizedQuery = normalizeText(query);
  return !normalizedQuery || buildSearchText(item, category).includes(normalizedQuery);
}