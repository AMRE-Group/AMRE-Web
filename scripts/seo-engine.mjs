/**
 * AMRE SEO Engine — runs weekly via GitHub Actions
 * Pulls GSC + GA4 via Composio, analyzes with Claude, writes report.json
 */
import { writeFileSync, readFileSync } from 'fs';
import { execSync } from 'child_process';

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GSC_ACCOUNT_ID = process.env.GSC_ACCOUNT_ID;   // Composio connected account ID
const GA_ACCOUNT_ID  = process.env.GA_ACCOUNT_ID;    // Composio connected account ID
const SITE_URL = 'sc-domain:amre.group';
const GA_PROPERTY = 'properties/YOUR_GA4_PROPERTY_ID'; // update after first run

// ── Date helpers ──
function ptDate(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // YYYY-MM-DD
}

// ── Composio tool executor ──
async function composioExec(toolSlug, args, accountId) {
  const payload = {
    tools: [{ tool_slug: toolSlug, arguments: args, account: accountId }],
    sync_response_to_workbench: false
  };
  const r = await fetch('https://connect.composio.dev/api/v1/actions/execute/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': COMPOSIO_API_KEY
    },
    body: JSON.stringify(payload)
  });
  const data = await r.json();
  const result = data?.data?.results?.[toolSlug];
  if (!result?.successful) throw new Error(`${toolSlug} failed: ${JSON.stringify(result)}`);
  return result.response;
}

// ── Pull GSC data ──
async function getGSCData() {
  const endDate   = ptDate(-3);  // GSC lags ~3 days
  const startDate = ptDate(-10); // last 7 days of available data
  const startPrev = ptDate(-17);
  const endPrev   = ptDate(-11);

  // Current period by query
  const byQuery = await composioExec('GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY', {
    site_url: SITE_URL,
    start_date: startDate,
    end_date: endDate,
    dimensions: ['query'],
    row_limit: 100
  }, GSC_ACCOUNT_ID);

  // Current period by page
  const byPage = await composioExec('GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY', {
    site_url: SITE_URL,
    start_date: startDate,
    end_date: endDate,
    dimensions: ['page'],
    row_limit: 50
  }, GSC_ACCOUNT_ID);

  // Prior period by query (for movers)
  const byQueryPrev = await composioExec('GOOGLE_SEARCH_CONSOLE_SEARCH_ANALYTICS_QUERY', {
    site_url: SITE_URL,
    start_date: startPrev,
    end_date: endPrev,
    dimensions: ['query'],
    row_limit: 100
  }, GSC_ACCOUNT_ID);

  return { byQuery, byPage, byQueryPrev, startDate, endDate };
}

// ── Process data into report shape ──
function processData(gsc) {
  const rows    = gsc.byQuery?.rows || [];
  const pages   = gsc.byPage?.rows  || [];
  const prevMap = {};
  (gsc.byQueryPrev?.rows || []).forEach(r => { prevMap[r.keys[0]] = r.position; });

  // Summary
  const totClicks = rows.reduce((s,r) => s + r.clicks, 0);
  const totImpr   = rows.reduce((s,r) => s + r.impressions, 0);
  const avgPos    = rows.length ? rows.reduce((s,r) => s + r.position, 0) / rows.length : 0;
  const avgCtr    = totImpr > 0 ? totClicks / totImpr : 0;

  // Top queries
  const queries = rows.map(r => ({
    query:       r.keys[0],
    clicks:      r.clicks,
    impressions: r.impressions,
    ctr:         r.ctr,
    position:    r.position
  }));

  // Top pages
  const topPages = pages.map(r => ({
    page:        r.keys[0],
    clicks:      r.clicks,
    impressions: r.impressions,
    ctr:         r.ctr,
    position:    r.position
  }));

  // Ranking movers — queries with biggest position change
  const movers = rows
    .filter(r => prevMap[r.keys[0]] !== undefined)
    .map(r => ({
      query:    r.keys[0],
      position: r.position,
      delta:    r.position - prevMap[r.keys[0]]  // negative = improved
    }))
    .filter(r => Math.abs(r.delta) >= 1.5)
    .sort((a,b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, 10);

  // Opportunities — high impressions, low CTR pages
  const opportunities = topPages
    .filter(p => p.impressions > 50 && p.ctr < 0.03)
    .sort((a,b) => b.impressions - a.impressions)
    .slice(0, 8)
    .map(p => {
      let action = 'Rewrite title';
      let type   = 'title';
      if (p.position > 10)   { action = 'New content'; type = 'new'; }
      else if (p.ctr < 0.01) { action = 'Add FAQ';     type = 'faq'; }
      return { ...p, action, type };
    });

  return {
    summary: {
      clicks:         totClicks,
      impressions:    totImpr,
      avg_position:   Math.round(avgPos * 10) / 10,
      ctr:            Math.round(avgCtr * 1000) / 1000,
      position_delta: 0,  // set by Claude
      indexed_pages:  pages.length
    },
    queries,
    pages: topPages,
    movers,
    opportunities,
    period: `${gsc.startDate} → ${gsc.endDate}`
  };
}

// ── Claude analysis ──
async function claudeAnalysis(reportData) {
  const prompt = `You are the SEO strategist for AMRE Real Estate Group (amre.group), a luxury real estate team at Compass Beverly Hills. The team's differentiation is that Michael Abraham is both a licensed architect AND real estate agent — this is the core positioning.

Here is this week's GSC performance data:
${JSON.stringify(reportData, null, 2)}

Analyze this data and return ONLY a JSON object (no markdown, no preamble) with this exact shape:
{
  "headline": "one-sentence summary of this week's SEO state (be specific, use numbers)",
  "summary": "2-3 sentence analysis: what's working, what's not, biggest opportunity",
  "actions": [
    {
      "priority": "high|med|low",
      "title": "Short action title (max 8 words)",
      "detail": "Specific action: what page/query, what to change, why it will help rankings"
    }
  ]
}

Generate 4-6 actions ranked by expected SEO impact. Actions should be concrete: specific pages to update, specific articles to write (with title suggestions), specific meta descriptions to rewrite, schema to add, neighborhood pages to create, etc. Focus on the architect+luxury+Westside positioning angle when recommending new content.`;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  const data = await r.json();
  const text = data.content?.[0]?.text || '{}';
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch {
    return { headline: 'Analysis unavailable', summary: text, actions: [] };
  }
}

// ── Main ──
async function main() {
  console.log('🔍 Fetching GSC data…');
  const gsc = await getGSCData();

  console.log('⚙️  Processing…');
  const reportData = processData(gsc);

  console.log('🤖 Running Claude analysis…');
  const ai = await claudeAnalysis(reportData);

  const now = new Date().toLocaleDateString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  }) + ' PT';

  const report = {
    generated: now,
    ...reportData,
    ai
  };

  writeFileSync('website/seo/report.json', JSON.stringify(report, null, 2));
  console.log('✅ Report written to website/seo/report.json');
  console.log(`   Clicks: ${report.summary.clicks} | Impressions: ${report.summary.impressions} | Avg Position: ${report.summary.avg_position}`);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
