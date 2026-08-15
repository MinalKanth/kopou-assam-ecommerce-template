# KOPOU — Assam, Delivered.
### A Premium Assam E-Commerce Website Template

KOPOU is a fully designed, front-end e-commerce template built around a single idea: **every product has a traceable origin**. The design, copy, and interactions all reinforce that one concept — from the signature "thread" motif to the maker → village → district → Assam → home traceability strip that appears throughout the site.

This README documents the project structure, design system, pages, functionality, and how to customize it for your own store.

---

## 1. What's Included

| File | Description |
|---|---|
| `index.html` | Home page — hero, shop-by-category rail, best sellers, featured products, pinned heritage story, origin thread, trust bar, testimonials, newsletter |
| `shop.html` | Shop / product listing page — full catalog with sidebar filters, sorting, pagination |
| `product.html` | Product details page — gallery, variants, quantity, buy now, specs, reviews, recommendations |
| `cart.html` | Cart & checkout — 4-step flow (Bag → Delivery → Payment → Confirmation) |
| `license.html` | Commercial template license, styled to match the site |
| `shared.js` | Shared logic used by every page: product catalog, cart state, cursor, nav, search/cart drawers, quick view |
| `README.md` | This file |

All five HTML pages are **fully self-contained** (each has its own inlined CSS) and reference the single `shared.js` file for data and interactivity. Keep all six files in the same folder.

---

## 2. Design Concept

### The signature motif: "The Thread"
A continuous gold/terracotta dashed line is used as a single recurring visual device across the whole site:
- It fills in during the preloader on first load
- It becomes the scroll-progress indicator at the top of the viewport
- It appears as a divider under the navigation bar and above the footer
- It resolves into the **Origin Thread** — the strip that visually connects *Maker → Village → District → Assam → Your Home* on the home page and on every product page

This is intentional — one motif, one meaning, reused everywhere, rather than decorative flourishes that don't connect to the brand idea.

### Positioning
KOPOU is designed to feel like a **flagship, editorial-grade marketplace** rather than a generic template — closer to a premium heritage brand site than a typical Shopify theme. The tone is warm, tactile, and rooted in place (Dibrugarh tea gardens, Sualkuchi silk looms, Sarthebari bell-metal workshops, home kitchens across Assam's districts).

---

## 3. Design System

### Color Palette
| Token | Hex | Usage |
|---|---|---|
| `--ink` | `#15201a` | Primary text |
| `--forest-deep` | `#0f1912` | Dark sections, nav-dark, footer |
| `--forest` | `#223629` | Secondary text on light backgrounds |
| `--forest-soft` | `#3a5544` | Organic badge, accents |
| `--ivory` | `#f6f1e6` | Page background |
| `--bamboo` | `#e8ded0` | Tinted section backgrounds |
| `--paper` | `#fffdf8` | Card backgrounds |
| `--terracotta` | `#b1583a` | Primary action color (buttons, links, thread) |
| `--terracotta-deep` | `#8f4229` | Hover states, category labels |
| `--gold` / `--gold-soft` | `#b3924e` / `#d8c48b` | Accent, thread, dark-section eyebrows |

### Typography
- **Display / headings:** `Fraunces` (serif, variable optical size) — used for all `h1–h4`, prices, and large numerals
- **Body / UI:** `Inter` — paragraph text, nav, form fields
- **Mono / labels:** `Inter Tight` — eyebrows, badges, category tags, breadcrumbs (all uppercase, letter-spaced)

Type scale is fluid, defined with `clamp()` custom properties (`--step--1` through `--step-5`) so headings and body text scale smoothly between mobile and desktop without separate breakpoint overrides.

### Spacing & Shape
- Container max-width: `1320px`, with fluid gutter via `clamp()`
- Border radius is intentionally tight (`2px`–`5px`) — a refined, non-rounded, editorial feel rather than soft "app-like" corners
- Border colors use low-opacity ink (`--line`, `--line-strong`) rather than gray, so hairlines feel warm rather than clinical

### Motion Principles
- Custom cursor (dot + trailing ring) on desktop, replaced by the native cursor on touch devices and when `prefers-reduced-motion` is set
- Product cards tilt subtly on mouse move (perspective transform), reveal a Quick Add / Quick View row on hover, and swap to a secondary image
- Section headings split into words and reveal on scroll
- Home page hero has layered parallax (background, floating canvas particles, copy) and a pinned, scroll-scrubbed "heritage" story section
- All motion respects `prefers-reduced-motion: reduce` and gracefully degrades on touch devices

---

## 4. Page-by-Page Breakdown

### `index.html` — Home
- Preloader with animated thread fill
- Cinematic hero with parallax background, floating particle canvas, animated stat counters
- Shop-by-category interactive rail (5 categories, expand-on-hover panels)
- Best Sellers + Featured This Week product grids (pulled live from the shared catalog)
- Pinned, scroll-scrubbed "Heritage" story — four chapters (Dibrugarh tea → Sualkuchi silk → Sarthebari metalwork → home kitchens)
- Origin Thread strip
- Trust bar (5 reassurance points)
- Draggable testimonial rail
- Newsletter signup

### `shop.html` — Shop / Products
- Sidebar filters: category checkboxes (with live counts), price range slider, in-stock toggle, highlight/badge filters
- Sort dropdown: Featured, Price (low–high / high–low), Highest Rated, Newest
- Removable filter chips showing active filters
- Client-side pagination (8 products per page)
- Deep-linkable by category via URL, e.g. `shop.html?category=Handloom%20%26%20Textiles` (used by the home page's category rail and nav links)
- Empty state when filters return nothing
- Mobile: filters open as a full-screen drawer

### `product.html` — Product Details
- Image gallery with thumbnail strip
- Variant selector (pills), quantity stepper
- Add to Cart / Buy Now actions
- Delivery info card (shipping, returns, verified origin)
- Origin trace block (maker → village → district → Assam)
- Tabbed content: Description / Specifications / Reviews (with rating breakdown bars)
- "You May Also Like" recommendations, prioritized by same category
- Loaded dynamically via `product.html?id=X` — every product card site-wide links here

### `cart.html` — Cart & Checkout
- Step 1 — **Bag**: line items with quantity controls, remove, live order summary, promo code field
- Step 2 — **Delivery**: saved address card + "add new address" form
- Step 3 — **Payment**: Card / UPI / Net Banking / Cash on Delivery options
- Step 4 — **Confirmation**: order success state with a generated order ID
- A persistent step indicator at the top tracks progress
- Cart state is shared with the rest of the site (see Section 5)

### `license.html` — Commercial Template License
- Styled to match the rest of the site (uses the same page-hero, typography, and card components)
- Covers: license grant, permitted use, restrictions on redistribution, ownership, customization rights, third-party assets, warranty/liability, termination
- See Section 7 below for a summary of what it means for you as the buyer

---

## 5. How the Shared Logic Works (`shared.js`)

`shared.js` is loaded on every page and provides:

- **`PRODUCTS`** — a single array of 12 demo products (tea, handloom, handicrafts, food, gift boxes) with pricing, ratings, stock, badges, image galleries, specs, variants, and origin data. Every page reads from this same array, so a product added anywhere (grid, quick view, product page) is consistent everywhere.
- **Cart state** — stored in `window.CART` and persisted to `sessionStorage` under the key `kopou_cart`, so the cart survives navigation between pages within a browsing session (it does **not** persist after the browser tab is closed — see Section 6 for how to change this).
- **`renderProductGrid()` / `cardHTML()`** — shared product card markup and grid rendering, used by the home page, shop page, and "recommended products" on the product page.
- **UI behaviors** — nav scroll shrink, mobile drawer, search overlay, mini cart drawer, custom cursor, toast notifications, quick view modal, "fly to cart" micro-interaction.

Each page also defines its own `onPageReady()` function (called automatically once `shared.js` finishes its base setup) for page-specific logic — e.g. `shop.html` builds its filter UI, `product.html` renders the selected product, `cart.html` renders the checkout steps.

---

## 6. Customizing for Your Own Store

### Replace the product catalog
Edit the `PRODUCTS` array near the bottom of `shared.js`. Each product needs:
```js
{
  id, slug, name, category, price, sale_price, rating, review_count,
  stock_quantity, badges: ['BESTSELLER', ...],
  img1, img2, gallery: [...],
  desc, origin: [...], specs: [[label, value], ...], variants: [...]
}
```
Badges currently styled: `BESTSELLER`, `ORGANIC`, `LIMITED` (others render with the default dark badge style — add a CSS rule under `.badge.yourbadge` to give a new badge its own color).

### Replace imagery
All images currently point to Unsplash placeholder URLs for demonstration. Before going live, replace every `img1`, `img2`, and `gallery` URL with your own licensed photography (see Section 7 — third-party image licensing is the buyer's responsibility).

### Rebrand colors & type
All colors and font stacks are defined once as CSS custom properties at the top of each page's `<style>` block (`:root { --ink: ...; --terracotta: ...; }`). Changing these values updates the entire page consistently. If you rebrand, update the same variables across **all five HTML files** to keep them in sync.

### Connect to a real backend
This is a front-end template only — there is no server, database, or payment processor wired up. To take it live you'll need to:
- Replace the in-memory `PRODUCTS` array with data fetched from your own product API / CMS
- Wire the checkout's "Place Order" action to a real payment gateway (Razorpay, Stripe, etc.) instead of the simulated confirmation
- Persist carts server-side or in `localStorage`/a real database if you need carts to survive across browser sessions and devices (currently `sessionStorage` is used deliberately to keep the demo self-contained)
- Add real authentication behind the "Account" icon (currently a placeholder)

---

## 7. License Summary

Full legal terms are in `license.html`. In short:

- **You may** use this template to build one commercial website (per license purchased), fully rebrand it, restructure it, and connect it to your own backend.
- **You may not** resell, redistribute, or re-upload the template itself (as a template) to any marketplace or template store, or reuse a single license across multiple unrelated commercial sites.
- **Ownership** of the original design system and codebase remains with the template creator; content you add (your products, copy, and brand assets) is yours.
- Placeholder fonts (Google Fonts) and photography (Unsplash) are for demonstration only — review their individual licenses or replace them before launch.

Read `license.html` in full before deploying commercially.

---

## 8. Browser & Device Support

- Built with modern CSS (custom properties, `clamp()`, `aspect-ratio`, `backdrop-filter`) — targets current versions of Chrome, Safari, Firefox, and Edge.
- Fully responsive: distinct layouts for desktop, tablet (≤900–1100px), and mobile (≤720px), including a mobile nav drawer and mobile filter drawer on the shop page.
- Respects `prefers-reduced-motion` throughout — disables the custom cursor, scroll-scrubbed animations, and decorative floating effects for users who request reduced motion.
- Touch devices automatically get native cursors and simplified hover interactions.

---

## 9. Quick Start

1. Download all six files (`index.html`, `shop.html`, `product.html`, `cart.html`, `license.html`, `shared.js`) into a single folder.
2. Open `index.html` in a browser — no build step or server required.
3. Browse to Shop, click into a product, add it to your bag, and walk through checkout to see the full flow end to end.
4. Start customizing per Section 6 above.

Made with care for Assam's makers. 🍃
