# ORBIT by Starsonn — inventory & operations prototype

A clickable prototype of an inventory-first ERP for a small manufacturer, built to demo and collect feedback.
Everything runs in the browser (plain HTML/CSS/JS, no build step, no server). Data is sample data saved in the visitor's own browser (localStorage).

**Demo sign-in:** `demo@orbit.app` / `demo` (or the "Use the demo account" button).

## What's in it
- **Items & stock** — on hand, QC hold, allocated, available, on order, days of supply, coverage bar, status. Filter chips, sortable columns, column chooser, CSV export.
- **Item detail** — stock by bin & lot, 90-day usage, full history with running balance, projected balance across open orders, BOM / where-used.
- **Stock actions** — receive, issue, adjust (reason codes), transfer (keeps lot identity), spot count. Stock can't go negative; FIFO by lot.
- **Locations** — bins with contents and value; QC hold bin with one-click release.
- **Stock history** — the audit trail of every movement.
- **Cycle counts** — ABC-based schedule, blind count sessions, variance posting, accuracy.
- **Reorder planner** — groups shortages by vendor → draft POs; made items → planned work orders.
- **Bills of material** — multi-level explode, cost roll-up with labor, "can build now", editor.
- **Work orders** — plan → release → issue materials (or backflush) → report completions → labor.
- **Purchase orders** — drafts, submit, partial receipts with lots and optional QC hold, print.
- **Sales orders** — availability per line, ship with FIFO picking, create WOs for shortages, packing slip.
- **Query explorer** — pick a dataset, add filters, group & total, sort/limit, chart, drill into groups, save, share by link, CSV. Starter questions and a simple "quick ask" box.
- **Search** — ⌘K / Ctrl-K or `/` finds items, POs, SOs, WOs, lots, vendors, customers and actions.
- **Suggest changes or features** — yellow button in the top bar (plus one on every page). Opens the visitor's email app addressed to Starsonn and keeps a copy under *My suggestions*.

## Change where suggestions go
Edit the first line of `js/core.js`:
```js
const SUGGEST_TO = 'jadecruz@starsonn.com';
```

## Publish on GitHub Pages
1. Create a new repository on GitHub (e.g. `orbit-demo`). Public is required for Pages on a free plan.
2. **Add file → Upload files** and drag in everything from this folder (`index.html`, `.nojekyll`, `css/`, `js/`, `README.md`). Commit.
3. **Settings → Pages** → Source: *Deploy from a branch* → Branch: `main`, folder `/ (root)` → Save.
4. After a minute the site is live at `https://<your-username>.github.io/orbit-demo/`. Send that link to the client.

To reset the demo in a browser: **Settings → Reset demo data** (suggestions are kept).
