# Asia Elefant menu site

Static restaurant page. It uses native ES modules, the Tailwind CDN, and no build step or package installation.

## File ownership

- `asia_elefant_menu.json`: restaurant details, phone number, categories, and dishes.
- `scripts/translations.js`: German and English interface copy.
- `tailwind.config.js`: theme tokens such as colors, fonts, spacing, and radii.
- `index.css`: custom layout, responsive grid, focus, and component styles.
- `scripts/menu-data.js`: menu loading and schema validation.
- `scripts/menu-utils.js`: price, number, tag, normalization, and search helpers.
- `scripts/menu-view.js`: category and dish markup.
- `main.js`: page state, DOM updates, storage, and event handling.
- `index.html`: document structure and accessible static content.

## Edit the menu

Edit `asia_elefant_menu.json` and keep valid JSON syntax. Required top-level fields are:

```json
{
  "restaurant": "Restaurant name",
  "currency": "EUR",
  "contact": {
    "phone": "Display number",
    "phone_link": "tel:digits"
  },
  "categories": []
}
```

Each category requires string fields `id` and `name`, plus an `items` array. Each item requires string fields `id`, `item_number`, and `name`, plus a numeric `price`. `description`, `number_prefix`, `tags`, `attributes`, and `image_url` are optional display/search data. Keep IDs unique and stable.

## Edit copy and visuals

Add or change both language entries in `scripts/translations.js`; matching keys keep the language toggle complete. Change theme tokens in `tailwind.config.js` and custom visual rules in `index.css`. Keep the Tailwind CDN script before `tailwind.config.js` in `index.html`.
