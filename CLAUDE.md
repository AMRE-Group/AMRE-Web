# AMRE website — amre.group

Static site on GitHub Pages (repo AMRE-Group/AMRE-Web, branch `main`), behind Cloudflare. Only the `website/` folder is served (`.github/workflows/pages.yml`, runs on pushes touching `website/**`). Goes live in about 1–2 minutes; hard-refresh to check — query strings don't bust the cache.

README.md and REVISION-HISTORY.md describe the old `Hilex2030/amre-assets` repo and are out of date.

## How to work
- Patch existing pages. Never rebuild a page from scratch unless Michael asks.
- Preview locally first (`python3 -m http.server 8001 -d website` — 8000 is BizColab's, 8002 is Haps Club's), then commit and push only after Michael approves.
- Always `git pull` before editing — other sessions edit this repo too.
- Keep short, plain answers. Show Michael the result, not the process.

## Where files go
- New blog post: `website/blog/<slug>/index.html`, copied from an existing post. Images in `website/blog/<slug>/img/`.
- Property pages: `website/properties/<slug>/assets/`, continuing the existing filename series (`fg10` → `fg11`).
- Site-wide images: `website/assets/img/`.
- Link-only assets (e.g. for Buffer): `social/YYYY-MM-DD/<slug>.jpg` at repo root.
- Feature on homepage: add a card to the journal section (`<div class="jrn-grid">` in `website/index.html`), matching the existing cards.

## Page rules (the #1 gotcha)
- Nav and footer are injected by `/assets/js/amre-chrome.js`: use `<div id="amre-nav"></div>`, `<div id="amre-footer"></div>` and the same `amre-chrome.js` script tag as `website/index.html`. Never hand-build the nav or footer.
- New pages start from a current page that already uses `amre-chrome.js` (e.g. `website/blog/1031-exchange-los-angeles/`). About 96 older pages load no shared chrome — don't copy from those.
- Don't add global CSS rules that restyle the shared nav or footer.
- Every page: unique title, meta description, canonical, Open Graph + Twitter tags, JSON-LD (BlogPosting + BreadcrumbList + FAQPage).

## Images
- Photos: JPEG, max ~1600px wide, quality 86, progressive. Floor plans: PNG, ~1600px, 256-color palette. Keep every file under ~1 MB.

## AMRE rules
- AMRE is separate from BizColab and Haps Club.
- Keep the Compass/DRE disclosure in the shared footer on every public page. Michael Abraham, REALTOR®, DRE# 02242095.
- Never publish MLS data or client details not cleared for public use.
- Never invent testimonials, reviews, sales figures or quotes.

## Verify after deploy
- Every new page and asset returns 200 on amre.group, the live HTML has the new content, and the nav and footer render.
- Never say it's live until a fetch confirms it.
