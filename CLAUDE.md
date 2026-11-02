# AMRE website — amre.group

Static site on GitHub Pages (repo AMRE-Group/AMRE-Web, branch `main`), behind Cloudflare. Only the `website/` folder is served (`.github/workflows/pages.yml`, runs on pushes touching `website/**`). Goes live in about 1–2 minutes; hard-refresh to check — query strings don't bust the cache.

README.md and REVISION-HISTORY.md describe the old `Hilex2030/amre-assets` repo and are out of date.

## How to work
- Patch existing pages. Never rebuild a page from scratch unless Michael asks.
- Preview locally first (`python3 -m http.server 8000 -d website`), then commit and push only after Michael approves.
- Always `git pull` before editing — other sessions edit this repo too.
- Keep short, plain answers. Show Michael the result, not the process.

## Where files go
- New blog post: `website/blog/<slug>/index.html`, copied from an existing post. Images in `website/blog/<slug>/img/`.
- Property pages: `website/properties/<slug>/assets/`, continuing the existing filename series (`fg10` → `fg11`).
- Site-wide images: `website/assets/img/`.
- Link-only assets (e.g. for Buffer): `social/YYYY-MM-DD/<slug>.jpg` at repo root.
- Feature on homepage: add a card right after `<div class="jt-grid">` in `website/index.html`, matching the existing cards.

## Page rules (the #1 gotcha)
- Nav is injected — top of `<body>`: `<div id="site-nav-mount"></div><div id="site-drawer-mount"></div><script src="/assets/js/site-chrome.js"></script>`. Never hand-build the nav.
- Footer: copy the exact block from `website/index.html`, from `<footer class="site-footer"` through the `<!-- STICKY` marker.
- Scope all page-specific CSS under a `.ps` wrapper (`.ps ` prefix on every selector). Never add global `.site-nav` / `.site-footer` rules.
- Every page: unique title, meta description, canonical, Open Graph + Twitter tags, JSON-LD (BlogPosting + BreadcrumbList + FAQPage).

## Images
- Photos: JPEG, max ~1600px wide, quality 86, progressive. Floor plans: PNG, ~1600px, 256-color palette. Keep every file under ~1 MB.

## AMRE rules
- AMRE is separate from BizColab and Haps Club.
- Keep the Compass/DRE disclosure in the shared footer on every public page. Michael Abraham, REALTOR®, DRE# 02242095.
- Never publish MLS data or client details not cleared for public use.
- Never invent testimonials, reviews, sales figures or quotes.

## Verify after deploy
- Every new page and asset returns 200 on amre.group, the live HTML has the new content, and the footer matches `website/index.html`.
- Never say it's live until a fetch confirms it.
