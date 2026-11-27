# The Deal Ledger — Black Friday 2026 Deal Finder

[![make.fun](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/jihanhamnus-web/the-deal-ledger/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/jihanhamnus-web/the-deal-ledger/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

Submission for the [make.fun Black Friday Deal Finder Bounty (`black-friday-deal-finder-01`)](https://make.fun/bounty/black-friday-deal-finder-01).

**The Deal Ledger** is a zero-dependency, completely offline static deal finder listing **40 verified Black Friday & Cyber Monday 2026 deals** checked on **November 27, 2026 (UTC)**. Every file loaded by the browser resides under `app/` — no external scripts, stylesheets, fonts, images, or runtime network fetches.

## Features

- **40 Verified Deals:** Covers 10 categories (TV & Home Theater, Audio, Smart Home, Kitchen, Wearables & Cameras, Laptops & Tablets, Tools & Power, Monitors & Peripherals, Gaming, Software & Security) across Amazon, 1Password, and Proton.
- **Price & Authenticity Verification:** Each deal carries exact sale price, usual list price, calculated `% off` and `$ saved`, ISO-UTC check timestamp, cited source name and link, and an editorial verdict (`Steep cut` vs `Solid deal`) with supporting evidence.
- **Instant Search & Multi-Criteria Filtering:** Real-time debounced search (`/` keyboard shortcut to focus, `Esc` to clear), category and store filters, minimum discount threshold (`Any`, `25%+`, `40%+`, `50%+`), maximum price ceiling (`Any`, `<= $100`, `<= $300`, `<= $1,000`), and four sort orders (`Top Picks`, `Biggest % Off`, `Most $ Saved`, `Lowest Price`).
- **Detail Drawer (`<dialog>`):** Visual price-drop bar, UTC check timestamp, source citation link, promo code block (when applicable), one-click copy link, and direct store link (`rel="noopener noreferrer"`).
- **Shortlist / Savings Basket:** Toggle deals into a persistent `localStorage` shortlist (`bf-deal-ledger-shortlist`) with live usual vs. Black Friday totals and combined dollar savings.
- **Methodology & Distribution Panel:** Displays verified count, average discount, category/store distribution bars, and verification timestamp.

## Architecture

- `main.ts` — Deterministic bundler copying `app/` and `screenshots/` to `/output` and generating `dossier.json` via `vendor/makefun-frontend.ts`.
- `serve.ts` — Local static dev server (`node serve.ts`) serving `app/` on `http://localhost:8080`.
- `app/index.html` — Semantic HTML5 document with skip link, landmarks, live status region, and native `<dialog>` drawers.
- `app/style.css` — Editorial ink-on-paper stylesheet (`#faf7f0` / `#16130e`), WCAG AA+ contrast, 3px purple `:focus-visible` outlines, responsive down to 360px+.
- `app/deals.js` — Verified 40-deal dataset and calculation/formatting helpers.
- `app/filters.js` — Pure search, filter, and sort logic (`applyFilters`, `computeStats`).
- `app/basket.js` — Persistent `localStorage` shortlist state and aggregate savings calculation.
- `app/view.js` — DOM rendering for deal cards, detail drawer, basket modal, and methodology breakdown.
- `app/main.js` — Bootstrapping, event wiring, keyboard shortcuts, and live announcements.

## Run Locally

```bash
# Serve app/ on http://localhost:8080
node serve.ts

# Package deterministically (Node 22.18+)
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](./LICENSE).
