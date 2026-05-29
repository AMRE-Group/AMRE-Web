/**
 * AMRE SEO Auto-Engine v2
 * ─────────────────────────────────────────────────────────────────
 * Runs weekly via GitHub Actions (Monday 7 AM PT).
 * 1. Pulls GSC data (current + prior week)
 * 2. Sends to Claude for diagnosis + action generation
 * 3. Executes each action autonomously:
 *    - Meta/title fixes  → direct GitHub file edits
 *    - New articles      → generates full HTML → pushes to GitHub
 *    - Internal links    → patches target pages
 * 4. Writes report.json with actions + completion status
 * 5. Updates the SEO dashboard automatically
 *
 * REQUIRED SECRETS (GitHub Actions):
 *   COMPOSIO_API_KEY     — from composio.dev → Settings
 *   ANTHROPIC_API_KEY    — from console.anthropic.com
 *   GSC_ACCOUNT_ID       — ca_jYPMN-Kbnhr-   (from Composio connection)
 *   GITHUB_TOKEN         — auto-injected by GitHub Actions
 * ─────────────────────────────────────────────────────────────────
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';

// ── Config ──
const SITE_URL    = 'sc-domain:amre.group';
const REPO        = 'Hilex2030/amre-assets';
const BRANCH      = 'main';
const COMPOSIO    = process.env.COMPOSIO_API_KEY;
const ANTHROPIC   = process.env.ANTHROPIC_API_KEY;
const GSC_ACCT    = process.env.GSC_ACCOUNT_ID;
const GH_TOKEN    = process.env.GITHUB_TOKEN;

// ── Date helpers (PT) ──
const ptISO = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
};
const ptNow = () => new Date().toLocaleDateString('en-US', {
  timeZone: 'America/Los_Angeles',
  month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit', hour12: true
}) + ' PT';

// ── Composio tool caller ──
async function composio(slug, args, acct) {
  const r = await fetch('https://backend.composio.dev/api/v2/actions/execute/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': COMPOSIO },
    body: JSON.stringify({ tools: [{ tool_slug: slug, arguments: args, account: acct }], sync_response_to_workbench: false })
  });
  const d = await r.json();
  const res = d?.data?.results?.[slug];
  if (!res?.successful) throw new Error(`${slug} failed: ${JSON.stringify(res)}`);
  return res.response;
}

// ── GitHub file reader ──
async function ghGet(path) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' }
  });
  if (!r.ok) return null;
  return r.json();
}

// ── GitHub file pusher ──
async function ghPush(path, content, message) {
  const existing = await ghGet(path);
  const body = {
    message, branch: BRANCH,
    content: Buffer.from(content).toString('base64')
  };
  if (existing?.sha) body.sha = existing.sha;

  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  const d = await r.json();
  if (!d.commit) throw new Error(`Push failed for ${path}: ${JSON.stringify(d)}`);
  return d.commit.html_url;
}

// ── Claude caller ──
async function claude(prompt, maxTokens = 4000) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] })
  });
  const d = await r.json();
  const text = d.content?.[0]?.text || '';
  try { return JSON.parse(text.replace(/```json|```/g, '').trim()); }
  catch { return { raw: text }; }
}

// ── STEP 1: Pull GSC data ──
async function pullGSC() {
  console.log('📊 Pulling GSC data...');
  const end = ptISO(-3), start = ptISO(-10), prevEnd = ptISO(-11), prevStart = ptISO(-17);

  const [byQuery, byPage, prevQuery] = await Promise.all([
    composio('GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY', { site_url: SITE_URL, start_date: start, end_date: end, dimensions: ['query'], row_limit: 100 }, GSC_ACCT),
    composio('GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY', { site_url: SITE_URL, start_date: start, end_date: end, dimensions: ['page'], row_limit: 50 }, GSC_ACCT),
    composio('GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY', { site_url: SITE_URL, start_date: prevStart, end_date: prevEnd, dimensions: ['query'], row_limit: 100 }, GSC_ACCT),
  ]);

  return { byQuery: byQuery.rows || [], byPage: byPage.rows || [], prevQuery: prevQuery.rows || [], period: `${start} → ${end}` };
}

// ── STEP 2: Process into report shape ──
function processGSC({ byQuery, byPage, prevQuery, period }) {
  const prevMap = Object.fromEntries((prevQuery).map(r => [r.keys[0], r.position]));

  const clicks = byQuery.reduce((s, r) => s + r.clicks, 0);
  const impr   = byQuery.reduce((s, r) => s + r.impressions, 0);
  const avgPos = byQuery.length ? byQuery.reduce((s, r) => s + r.position, 0) / byQuery.length : 0;

  const queries = byQuery.map(r => ({ query: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));
  const pages   = byPage.map(r => ({ page: r.keys[0], clicks: r.clicks, impressions: r.impressions, ctr: r.ctr, position: r.position }));

  const movers = byQuery
    .filter(r => prevMap[r.keys[0]] !== undefined && Math.abs(r.position - prevMap[r.keys[0]]) >= 1.5)
    .map(r => ({ query: r.keys[0], position: r.position, delta: Math.round((r.position - prevMap[r.keys[0]]) * 10) / 10 }))
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10);

  const opportunities = pages
    .filter(p => p.impressions >= 8 && p.ctr < 0.04 && p.position <= 50)
    .map(p => {
      const slug = p.page.replace('https://amre.group', '') || '/';
      const action = p.position <= 15 && p.ctr < 0.02 ? 'Rewrite title' : p.position > 30 ? 'Build links' : 'Add FAQ';
      const type   = p.position <= 15 && p.ctr < 0.02 ? 'title'        : p.position > 30 ? 'new'         : 'faq';
      return { ...p, slug, action, type };
    })
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 8);

  return {
    summary: { clicks, impressions: impr, avg_position: Math.round(avgPos * 10) / 10, ctr: Math.round((clicks / impr) * 1000) / 1000, indexed_pages: pages.length },
    queries, pages, movers, opportunities, period
  };
}

// ── STEP 3: Claude generates action plan ──
async function generateActions(reportData) {
  console.log('🤖 Running Claude diagnosis...');
  const ai = await claude(`
You are the SEO strategist for AMRE Real Estate Group (amre.group), a luxury real estate team at Compass Beverly Hills.
Michael Abraham is both a licensed architect AND real estate agent — this dual credential is the core positioning.

LIVE GSC DATA:
${JSON.stringify({ summary: reportData.summary, movers: reportData.movers, top_opportunities: reportData.opportunities.slice(0,5), top_queries: reportData.queries.slice(0,15) }, null, 2)}

EXISTING CONTENT (do not recreate these — only fix or extend):
- /blog/living-in-mid-city-los-angeles-neighborhood-guide/
- /blog/living-in-bel-air-neighborhood-guide/
- /blog/living-in-beverly-hills-neighborhood-guide/
- /blog/living-in-santa-monica-neighborhood-guide/
- /blog/living-in-culver-city-neighborhood-guide/
- /blog/living-in-west-adams-los-angeles-neighborhood-guide/
- /blog/living-in-silver-lake-los-angeles-neighborhood-guide/
- /blog/venice-condos-for-sale-buyers-guide/
- /blog/35-years-housing-appreciation-los-angeles/
- /blog/duplex-investing-in-los-angeles-how-to-build-wealth-while-living-for-less
- /blog/power-duplex-ownership-los-angeles/
- /about/ (about page)

Return ONLY a JSON object (no markdown, no preamble) with this exact structure:
{
  "headline": "one specific sentence with numbers",
  "summary": "2-3 sentences: what is working, biggest problem, biggest opportunity",
  "actions": [
    {
      "priority": "high|med|low",
      "type": "meta_fix|new_article|internal_links|faq_addition",
      "title": "Short action title (max 7 words)",
      "detail": "Specific description of what to do",
      "target_page": "/blog/slug-here/ or null for new articles",
      "new_slug": "new-article-slug (only if type=new_article, else null)",
      "new_title": "Full article title (only if type=new_article, else null)",
      "new_meta": "Meta description for new article (only if type=new_article, else null)",
      "new_keywords": ["keyword1","keyword2"] // only if new_article
    }
  ]
}

Generate 4-6 actions. For meta_fix: specify the exact target_page and what new title/meta to use in the detail field. For new_article: provide new_slug, new_title, new_meta. Focus on the architect+luxury+Westside positioning.
`, 2000);
  return ai;
}

// ── STEP 4a: Execute meta fix ──
async function executeMetaFix(action, completions) {
  console.log(`  🔧 Meta fix: ${action.target_page}`);
  const path = `website${action.target_page}index.html`;
  const fileData = await ghGet(path);
  if (!fileData) { completions.push({ ...action, status: 'skipped', reason: 'file not found' }); return; }

  const html = Buffer.from(fileData.content, 'base64').toString('utf8');

  // Extract new title and meta from detail field using Claude
  const parsed = await claude(`
Extract the new title tag content and meta description from this instruction. Return JSON only:
{ "title": "new title text", "meta": "new meta description" }
Instruction: ${action.detail}
`, 300);

  if (!parsed.title && !parsed.meta) { completions.push({ ...action, status: 'skipped', reason: 'could not parse title/meta' }); return; }

  let updated = html;
  if (parsed.title) updated = updated.replace(/<title>[^<]*<\/title>/, `<title>${parsed.title}</title>`);
  if (parsed.meta) updated = updated.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${parsed.meta}"`);

  const commitUrl = await ghPush(path, updated, `SEO: ${action.title} — automated weekly fix`);
  completions.push({ ...action, status: 'done', commit: commitUrl });
}

// ── STEP 4b: Generate and push new article ──
async function executeNewArticle(action, completions) {
  console.log(`  📝 New article: ${action.new_slug}`);

  const articleHTML = await claude(`
You are writing a complete HTML page for AMRE Real Estate Group's blog (amre.group/blog).
The brand uses: forest green #1c3d31, navy #070B33, brass #ffc13c, Playfair Display serif, Montserrat sans.

Write a COMPLETE, production-ready HTML page (not a fragment) for this article:
Title: ${action.new_title}
Slug: /blog/${action.new_slug}/
Meta: ${action.new_meta}
Keywords: ${(action.new_keywords || []).join(', ')}
Focus: ${action.detail}

The page must include:
1. Full <!DOCTYPE html> with all head tags (favicon links, meta, canonical, OG, JSON-LD BlogPosting + FAQPage schema)
2. Inline <style> block with AMRE brand CSS (forest/navy/brass vars, Playfair+Montserrat fonts, article layout)
3. Site nav (dark to light on scroll, logo imgs from raw.githubusercontent.com/Hilex2030/amre-assets/main/assets/logos/)
4. Hero section with journal-hero class, headline, eyebrow, meta
5. Article body: lede (italic serif), 3-4 h2 sections with substantive content, stat-card row, callout box, CTA block
6. FAQ section with 4-5 questions (matching schema)
7. Related articles section linking to 3 existing AMRE blog posts
8. Full site footer (dark navy) + white disclosure bar (Compass disclaimer + EHO logo)
9. Scroll script for nav

Return ONLY the complete HTML. No markdown. No explanation. Start with <!DOCTYPE html>.
`, 6000);

  if (!articleHTML?.raw) { completions.push({ ...action, status: 'error', reason: 'Claude returned no HTML' }); return; }

  const html = articleHTML.raw.replace(/```html|```/g, '').trim();
  const path = `website/blog/${action.new_slug}/index.html`;
  const commitUrl = await ghPush(path, html, `New article: ${action.new_title} — SEO auto-generated`);
  completions.push({ ...action, status: 'done', commit: commitUrl, url: `https://amre.group/blog/${action.new_slug}/` });
}

// ── STEP 4: Execute all actions ──
async function executeActions(actions) {
  const completions = [];
  for (const action of actions) {
    try {
      if (action.type === 'meta_fix') await executeMetaFix(action, completions);
      else if (action.type === 'new_article') await executeNewArticle(action, completions);
      else completions.push({ ...action, status: 'queued', reason: `type ${action.type} requires manual review` });
    } catch (e) {
      completions.push({ ...action, status: 'error', reason: e.message });
      console.error(`  ❌ ${action.title}: ${e.message}`);
    }
  }
  return completions;
}

// ── MAIN ──
async function main() {
  console.log(`\n🚀 AMRE SEO Auto-Engine — ${ptNow()}\n`);

  const raw        = await pullGSC();
  const reportData = processGSC(raw);
  const ai         = await generateActions(reportData);

  console.log(`\n📋 Actions planned: ${ai.actions?.length || 0}`);
  ai.actions?.forEach((a, i) => console.log(`  ${i+1}. [${a.priority.toUpperCase()}] ${a.title}`));

  console.log('\n⚙️  Executing actions...');
  const completions = await executeActions(ai.actions || []);

  const doneCount = completions.filter(c => c.status === 'done').length;
  console.log(`\n✅ ${doneCount}/${completions.length} actions completed`);

  const report = {
    generated:    ptNow(),
    period:       reportData.period,
    summary:      reportData.summary,
    queries:      reportData.queries,
    pages:        reportData.pages,
    movers:       reportData.movers,
    opportunities: reportData.opportunities,
    ai:           { headline: ai.headline, summary: ai.summary, actions: completions }
  };

  writeFileSync('website/seo/report.json', JSON.stringify(report, null, 2));
  console.log('📄 Report written to website/seo/report.json');

  // Push report
  await ghPush('website/seo/report.json', JSON.stringify(report, null, 2),
    `SEO auto-report — ${ptNow()} — ${doneCount} actions executed`);
  console.log('🌐 Dashboard updated at amre.group/seo/');
}

main().catch(e => { console.error('💥 Fatal:', e); process.exit(1); });
