Build one responsive static HTML webpage for Asia Elefant Schorndorf. The page should use the repository's Serene Heritage design language, render menu content from the JSON data as the source of truth, support bilingual German/English UI copy, include menu browsing/search/category filtering/click-to-call CTAs/restaurant info sections, and use intentional image placeholders until real approved assets are supplied.

**Steps**

1. Define the target output as a new root-level `index.html` in `c:\\Project\\WebDev\\Elefant\\AsiaElefant`, keeping deployment simple and matching the existing Tailwind CDN/static HTML approach.
2. Reuse the design tokens from `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\serene_heritage\\DESIGN.md` and the existing `tailwind-config` sections from the desktop/mobile mockups: dark charcoal surfaces, saffron/gold accent, Newsreader headings, Plus Jakarta Sans body/UI text, 8px rhythm, 1200px max-width, and restrained 4-8px radii.
3. Create the page shell: semantic `header`, `main`, menu sections, restaurant-info section, and `footer`; use German as the primary visible language with English secondary copy/toggle labels where useful because the requested final page is bilingual.
4. Add responsive navigation: desktop sticky top nav inspired by the desktop mockup; mobile fixed header and bottom nav inspired by the mobile mockup; all phone actions must use the JSON contact `phone_link` value `tel:071814826448`.
5. Embed or load the JSON menu data from `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\asia_elefant_menu_json_updated_with_numbers.json`. For a single-file static page, preferred first version is an inline `menuData` object copied from the JSON so the page opens directly without a dev server or CORS issues; alternatively use `fetch()` only if serving via a local/static server is accepted.
6. Implement menu rendering helpers: `formatPrice(price, currency)`, `itemDisplayNumber(item)` combining `number_prefix` and `item_number`, `renderCategory(category)`, `renderMenu(data)`, and `renderTags(item)` mapping `tags` plus `attributes.is_spicy`, `attributes.is_vegan`, and `attributes.is_gluten_free` into bilingual visual chips.
7. Implement search and category filtering: `normalizeText(value)` for accent/case-insensitive matching, `applyFilters()` combining search query and selected category, `setActiveCategory(categoryId)`, an \"All / Alle\" option, empty-state text, and result count feedback.
8. Build menu card/list presentation: desktop uses a 2-3 column card grid similar to the desktop mockup; mobile uses stacked list cards similar to the mobile mockup. Use placeholder image blocks rather than external dish URLs, with category-aware labels and accessible `aria-label`/text alternatives.
9. Add restaurant information sections requested for version one: contact/phone, short bilingual intro, location placeholder, opening-hours placeholder, and legal/contact/footer links as placeholders if real data is not present in the repo.
10. Add accessibility and responsive polish: keyboard-focus states, button `aria-pressed`/active state, readable contrast, no text overlap, no horizontal overflow, reduced-motion-safe transitions, and clear empty states.
11. Keep out of scope for version one: cart, checkout, online payment, order submission, account flows, and real food photography until approved assets are provided.

**Relevant files**

- `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\asia_elefant_menu_json_updated_with_numbers.json` — authoritative restaurant/menu/contact data; use `restaurant`, `currency`, `contact.phone`, `contact.phone_link`, `categories[].id`, `categories[].name`, `categories[].description`, `items[].item_number`, `items[].number_prefix`, `items[].name`, `items[].description`, `items[].price`, `items[].tags`, and `items[].attributes`.
- `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\serene_heritage\\DESIGN.md` — design system source: colors, typography, spacing, grid, component guidance, and elephant motif direction.
- `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\speisekarte_desktop_mit_bestellnummern\\code.html` — reuse the Tailwind theme config, desktop sticky nav, hero/search area, category chips, card grid structure, item number/price/tag layout, and footer pattern.
- `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\speisekarte_mobile_mit_bestellnummern\\code.html` — reuse the mobile fixed header, search bar placement, horizontal category tabs, call-to-order CTA, stacked item layout, bottom navigation, `.no-scrollbar`, `.active-tab`, `.elephant-pattern`, and simple tab interaction pattern as references.
- `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\speisekarte_desktop_mit_bestellnummern\\screen.png` and `c:\\Project\\WebDev\\Elefant\\AsiaElefant\\speisekarte_mobile_mit_bestellnummern\\screen.png` — visual regression references for desktop and mobile composition.

**Verification**

1. Open the new static page directly in a browser and confirm it renders without a dev server if the JSON is embedded inline.
2. Test responsive layout at 375px, 768px, 1024px, and 1440px widths; verify no overlap, no horizontal scroll, and desktop/mobile navigation adapts correctly.
3. Confirm every JSON item appears exactly once with correct category, item number (`S1`, `S2`, `24`, `25`), name, description, tags, dietary chips, and EUR price formatting.
4. Test search for `rainbow`, `sashimi`, `chicken`, `szechuan`, `scharf`, `GF`, and no-match input; verify category filtering combines correctly with search.
5. Test category buttons/tabs for All/Alle, Sushi Bar, and Wok Specialties; verify active state and visible results.
6. Click every phone CTA in header, menu CTA, bottom nav, and footer; verify each uses `tel:071814826448`.
7. Keyboard-test tab order through navigation, search input, category filters, language controls if added, and phone links.
8. Compare desktop/mobile screenshots against the existing mockup screenshots for overall visual fidelity while accounting for image placeholders and JSON-only item count.
9. Validate external dependencies load: Tailwind CDN, Google Fonts, Material Symbols. If offline deployment is needed later, plan a second pass to self-host or remove CDN dependencies.

**Decisions**

- Build target: single responsive static HTML page.
- Content authority: JSON menu data, not the sample mockup items.
- Language: bilingual German/English, with German primary because the restaurant/customer context is local.
- Scope included: menu browsing, search/filtering, click-to-call ordering, restaurant info sections.
- Image handling: placeholders until approved assets are provided.
- Excluded: cart/checkout and full online ordering workflow.

**Further Considerations**

1. If the menu JSON grows beyond the current four items, inline data becomes less comfortable to maintain; use a static server plus `fetch()` or a build step then.
2. Real address/opening-hours/legal details are not present in the current repo; use placeholders in version one and mark them clearly for content replacement.
3. The existing mockups use CDN-hosted/generated image URLs; do not carry them into the final page unless explicitly approved."
   }
