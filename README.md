# Asia Elefant menu site

Static restaurant menu built with native ES modules and Tailwind CSS 3.

## Local development

Install the exact dependencies from the lockfile:

```sh
npm ci
```

Create the minified production stylesheet:

```sh
npm run build
```

During CSS or markup work, run the stylesheet watcher in one terminal:

```sh
npm run watch:css
```

Serve the repository root in another terminal, for example:

```sh
python -m http.server 8000
```

Then open `http://127.0.0.1:8000/`. `index.css` is the Tailwind and custom CSS source. `styles.css` is the generated production output used by `index.html`; keep it updated with `npm run build` before deployment.

## Netlify

Set the build command to `npm run build` and the publish directory to `.`. Netlify installs the dependencies from `package.json` and `package-lock.json`, then publishes the generated `styles.css` with the static site.

## File ownership

- `asia_elefant_menu.json`: restaurant details, phone number, categories, and dishes.
- `scripts/translations.js`: German and English interface copy.
- `tailwind.config.js`: Tailwind content paths, forms plugin, and theme tokens such as colors, fonts, spacing, and radii.
- `index.css`: Tailwind directives and custom layout, responsive grid, focus, and component styles.
- `styles.css`: generated minified production stylesheet.
- `scripts/menu-data.js`: menu loading and schema validation.
- `scripts/menu-utils.js`: price, number, tag, normalization, and search helpers.
- `scripts/menu-view.js`: category and dish markup.
- `scripts/order-list.js`: order-list domain rules, sanitization, totals, and persistence.
- `scripts/order-list-view.js`: order-list drawer rows and empty/total markup.
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

Add or change both language entries in `scripts/translations.js`; matching keys keep the language toggle complete. Change theme tokens in `tailwind.config.js` and custom visual rules in `index.css`, then regenerate `styles.css` with `npm run build`.

## Order-list storage

The future-order list is stored locally under `asia-elefant-order-list`. Its versioned JSON contains only menu item IDs, integer quantities (maximum 99), and optional notes (maximum 200 characters). Names, numbers, prices, customer details, and payment data are not stored.

Stored values are sanitized when read. Items that no longer exist in the current menu are removed after menu data loads.
