/* AMRE shared chrome — single source of truth for nav + footer.
   Every page includes:  <div id="amre-nav"></div> ... <div id="amre-footer"></div>
   then <script src="/assets/js/amre-chrome.js" defer></script>
   Styling comes from /assets/css/amre.css. Edit links/markup ONCE here. */
(function () {
  'use strict';

  // -- Google Tag Manager (GTM-TM5NWVRD), installed 2026-09-16.
  //    Replaces the direct-gtag GA4 loader above: this container already existed
  //    in the Google account (GA4 + Google Ads conversion + Meta Pixel, built by
  //    a prior agency) but had never been installed on the live site.
  //    Auto-installs on every page that loads amre-chrome.js.
  (function (w, d, s, l, i) {
    if (w.__amre_gtm_loaded) return;
    w.__amre_gtm_loaded = true;
    w[l] = w[l] || [];
    w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', 'GTM-TM5NWVRD');

  var LOGO = 'https://raw.githubusercontent.com/Hilex2030/amre-assets/main/assets/logos';

  // ---- required chrome CSS (injected so nav/drawer are correct on ANY page, even ones that don't inline it) ----
  (function () {
    var css =
      '.mobile-drawer{position:fixed;inset:0 0 0 auto;width:min(84vw,340px);background:var(--dark,#1c3d31);color:var(--bone,#f7f5f1);transform:translateX(100%);transition:transform .4s var(--ease,ease);z-index:55;display:flex;align-items:center;padding:0 34px;box-shadow:-20px 0 60px -30px rgba(0,0,0,.6)}'
      + '.mobile-drawer.open{transform:none}'
      + '.mobile-drawer nav{display:flex;flex-direction:column;gap:22px;width:100%}'
      + '.mobile-drawer nav a{font-family:var(--serif,serif);font-size:1.5rem;color:var(--bone,#f7f5f1);font-weight:300}'
      + '.mobile-drawer nav a.btn{font-family:var(--sans,sans-serif);font-size:.82rem;margin-top:12px;align-self:flex-start;color:var(--ink,#1a1a1a)}'
      + '.ham.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}'
      + '.ham.open span:nth-child(2){opacity:0}'
      + '.ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}'
      + '.ham{position:relative;z-index:70}'
      + '.ham.open span,header.nav.solid .ham.open span{background:#fff}'
      + '.drawer-backdrop{position:fixed;inset:0;background:rgba(12,16,13,.5);opacity:0;visibility:hidden;transition:opacity .4s var(--ease,ease),visibility .4s;z-index:54}'
      + '.drawer-backdrop.open{opacity:1;visibility:visible}'
      + '.mobile-drawer{align-items:flex-start;padding-top:110px}'
      + '.nav-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;color:rgba(255,255,255,.9);border:1px solid rgba(255,255,255,.35);transition:.3s}'
      + '.nav-icon-btn:hover{color:var(--clay,#ffc13c);border-color:var(--clay,#ffc13c);transform:translateY(-1px)}'
      + 'header.nav.solid .nav-icon-btn{color:var(--ink-2,#3a3a3c);border-color:rgba(26,26,26,.25)}'
      + 'header.nav.solid .nav-icon-btn:hover{color:var(--ink,#1a1a1a);border-color:var(--ink,#1a1a1a)}'
      + '@media(max-width:900px){.nav-right .nav-icon-btn{display:none}}'
      + '.amre-skip{position:absolute;left:-9999px;top:0;z-index:200;background:#1c3d31;color:#fff;padding:12px 20px;font-weight:600;font-size:.85rem;text-decoration:none}'
      + '.amre-skip:focus{left:0}'
      + '.marquee{position:relative}'
      + '.marquee-pause{position:absolute;right:12px;top:50%;transform:translateY(-50%);z-index:3;background:rgba(0,0,0,.6);color:#fff;border:1px solid rgba(255,255,255,.55);border-radius:100px;font-size:.7rem;padding:6px 12px;cursor:pointer;line-height:1}'
      + '.marquee-pause:focus-visible{outline:2px solid #ffc13c;outline-offset:2px}'
      + '.marquee:hover .marquee-track,.marquee:focus-within .marquee-track,.marquee.is-paused .marquee-track{animation-play-state:paused}'
      + '@media(prefers-reduced-motion:reduce){.marquee-track{animation:none!important}.hero-bg{animation:none!important;transform:none!important}.reveal{opacity:1!important;transform:none!important;transition:none!important}html{scroll-behavior:auto!important}}'
      ;
    css +=
      '#nav .nav-links a{white-space:nowrap}'
      + '#nav .nav-dd{position:relative;display:flex;align-items:center}'
      + '#nav .dd-caret{display:inline-block;width:6px;height:6px;margin-left:7px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:translateY(-2px) rotate(45deg);opacity:.8;transition:transform .2s}'
      + '#nav .nav-dd:hover .dd-caret,#nav .nav-dd:focus-within .dd-caret{transform:translateY(1px) rotate(225deg)}'
      + '#nav .nav-dd-menu{position:absolute;top:100%;left:50%;padding-top:18px;opacity:0;visibility:hidden;transform:translate(-50%,8px);transition:opacity .2s,transform .2s,visibility .2s;z-index:80}'
      + '#nav .nav-dd:hover .nav-dd-menu,#nav .nav-dd:focus-within .nav-dd-menu{opacity:1;visibility:visible;transform:translate(-50%,0)}'
      + '#nav .nav-dd-box{background:#fff;border-radius:16px;box-shadow:0 24px 60px -20px rgba(0,0,0,.35);padding:24px 30px;display:grid;gap:0 40px;text-align:left}'
      + '#nav .nav-dd-3{grid-template-columns:repeat(3,auto)}#nav .nav-dd-1{grid-template-columns:auto;padding:18px 26px}'
      + '#nav .nav-links .nav-dd-menu a{display:block;color:#3a3a3c;font-size:.86rem;line-height:1.5;padding:5px 0;font-weight:500;letter-spacing:.01em;text-transform:none}'
      + '#nav .nav-links .nav-dd-menu a:hover{color:#e6a800}'
      + '#nav .nav-links .nav-dd-menu .nav-dd-h{font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:#1c3d31;font-weight:600;padding:0 0 10px}'
      + '#nav .nav-links .nav-dd-menu .nav-dd-all{margin-top:10px;color:#1c3d31;font-weight:600}'
      + '#nav .nav-right .btn{white-space:nowrap}'
      + '#nav .nav-in{gap:40px}#nav .brand{gap:10px;flex-shrink:0}#nav .brand .sep{height:18px;opacity:.9}'
      + '@media(max-width:1440px){#nav .nav-links{gap:24px}}@media(max-width:1340px){#nav .nav-links{gap:18px}#nav .nav-in{gap:28px}}@media(max-width:1240px){#nav .nav-links{display:none}#nav .ham{display:flex}}';
    var st = document.createElement('style'); st.id = 'amre-chrome-css'; st.textContent = css;
    document.head.appendChild(st);
  })();

  // ---- nav links (edit once) ----
  // Nav order 2026-09-23: Sellers · Buyers · Neighborhoods ▾ · Featured Homes · Cash & Flow · Insights ▾ · About (7 items).
  // "Contact" dropped from the bar: the Get In Touch button + email/phone icons cover it.
  var WESTSIDE = [['/santa-monica/','Santa Monica'],['/venice/','Venice'],['/mar-vista/','Mar Vista'],['/culver-city/','Culver City'],
    ['/playa-vista/','Playa Vista'],['/marina-del-rey/','Marina del Rey'],['/west-los-angeles/','West Los Angeles'],['/cheviot-hills/','Cheviot Hills'],
    ['/brentwood/','Brentwood'],['/pacific-palisades/','Pacific Palisades'],['/westwood/','Westwood'],['/beverly-hills/','Beverly Hills'],
    ['/bel-air/','Bel Air'],['/west-adams/','West Adams']];
  var BEACH = [['/manhattan-beach/','Manhattan Beach'],['/hermosa-beach/','Hermosa Beach'],['/redondo-beach/','Redondo Beach'],['/el-segundo/','El Segundo']];
  var INSIGHTS = [['/market-reports/','Market Reports'],['/blog/','Journal'],['/relocating-from-new-york/','New York City']];
  var active = function (h) { return location.pathname.replace(/\/$/, '') === h.replace(/\/$/, '') ? ' aria-current="page"' : ''; };
  var a = function (l) { return '<a href="' + l[0] + '"' + active(l[0]) + '>' + l[1] + '</a>'; };
  var MENUS = {
    hoods: '<div class="nav-dd-box nav-dd-3">' +
      '<div><a class="nav-dd-h" href="/westside/">Westside</a>' + WESTSIDE.slice(0, 7).map(a).join('') + '</div>' +
      '<div><span class="nav-dd-h" aria-hidden="true">&nbsp;</span>' + WESTSIDE.slice(7).map(a).join('') + '</div>' +
      '<div><a class="nav-dd-h" href="/beach-cities/">Beach Cities</a>' + BEACH.map(a).join('') +
        '<a class="nav-dd-all" href="/neighborhoods/">All neighborhoods →</a></div></div>',
    insights: '<div class="nav-dd-box nav-dd-1"><div>' + INSIGHTS.map(a).join('') + '</div></div>'
  };
  var LINKS = [
    ['/sellers/', 'Sellers'], ['/buyers/', 'Buyers'],
    ['/neighborhoods/', 'Neighborhoods', 'hoods'],
    ['/featured-homes/', 'Featured Homes'],
    ['/cash-and-flow/', 'Cash &amp; Flow'],
    ['/market-reports/', 'Insights', 'insights'],
    ['/about/', 'About']
  ];
  var navLinks = LINKS.map(function (l) {
    if (l[2]) return '<div class="nav-dd"><a href="' + l[0] + '" aria-haspopup="true"' + active(l[0]) + '>' + l[1] + '<span class="dd-caret" aria-hidden="true"></span></a><div class="nav-dd-menu">' + MENUS[l[2]] + '</div></div>';
    return a(l);
  }).join('');
  var drawerLinks = LINKS.map(function (l) {
    if (l[2] === 'hoods') return a(['/westside/', 'Westside Neighborhoods']) + a(['/beach-cities/', 'Beach Cities']);
    if (l[2] === 'insights') return INSIGHTS.map(a).join('');
    return a(l);
  }).join('');

  var CONTACT_ICONS =
    '<a class="nav-icon-btn" href="mailto:Michael.Abraham@Compass.com" aria-label="Email us" title="Michael.Abraham@Compass.com">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path>' +
      '</svg>' +
    '</a>' +
    '<a class="nav-icon-btn" href="tel:+13237198585" aria-label="Call us" title="(323) 719-8585">' +
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"></path>' +
      '</svg>' +
    '</a>';

  var navHTML =
    '<header class="nav" id="nav">' +
      '<div class="wrap nav-in">' +
        '<a href="/" class="brand" aria-label="AMRE Real Estate Group">' +
          '<img class="amre logo-white" src="' + LOGO + '/amre-white.svg" alt="AMRE" width="80" height="22">' +
          '<img class="amre logo-dark" src="' + LOGO + '/amre-black.svg" alt="AMRE" width="80" height="22">' +
          '<span class="sep"></span>' +
          '<img class="comp logo-white" src="' + LOGO + '/compass-white.png" alt="Compass" width="70" height="15">' +
          '<img class="comp logo-dark" src="' + LOGO + '/compass-black.png" alt="Compass" width="70" height="15">' +
        '</a>' +
        '<nav class="nav-links">' + navLinks + '</nav>' +
        '<div class="nav-right">' +
          CONTACT_ICONS +
          '<a href="/contact/" class="btn btn-fill">Get In Touch <span class="arrow">→</span></a>' +
          '<button class="ham" id="ham" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-drawer" id="drawer" aria-hidden="true" inert><nav>' + drawerLinks +
        '<a href="/contact/" class="btn btn-fill">Get In Touch</a></nav></div>' +
    '</header>';

  var footHTML =
    '<footer itemscope itemtype="https://schema.org/RealEstateAgent">' +
      '<meta itemprop="name" content="AMRE Real Estate Group"><meta itemprop="telephone" content="+13237198585">' +
      '<div class="wrap">' +
        '<div class="foot-top">' +
          '<div class="foot-brand">' +
            '<span class="foot-logos"><img src="' + LOGO + '/amre-white.svg" alt="AMRE Real Estate Group"><span class="fsep"></span><img src="' + LOGO + '/compass-white.png" alt="Compass"></span>' +
            '<p>Empowering clients to achieve their real estate dreams, one home at a time. Compass Beverly&nbsp;Hills.</p>' +
          '</div>' +
          '<div class="foot-cols">' +
            '<div><h4>Navigate</h4><a href="/sellers/">Sellers</a><a href="/buyers/">Buyers</a><a href="/buyers/roadmap/">Buyer&#39;s Roadmap</a><a href="/westside/">Westside Neighborhoods</a><a href="/about/">Team</a><a href="/blog/">Journal</a><a href="/contact/">Contact</a><a href="/properties/">Past Transactions</a><a href="/featured-homes/">Featured Homes</a></div>' +
            '<div><h4>Services</h4><a href="/sellers/#three-phase">3-Phase Marketing</a><a href="/sellers/#concierge">Compass Concierge</a><a href="/buyers/">Buyer Advisory</a><a href="/#contact">Home Valuation</a><a href="/#contact">Investment Advisory</a><a href="/cash-and-flow/">Cash &amp; Flow</a><a href="/cash-and-flow/calculator/">Investment Calculator</a><a href="/tools/net-proceeds-calculator/">Seller Net Proceeds</a></div>' +
            '<div><h4>Connect</h4><a href="tel:3237198585">(323) 719-8585</a><a href="mailto:michael.abraham@compass.com">Email Us</a><a href="https://www.instagram.com/amre.group/">Instagram</a><a href="https://www.youtube.com/@AMRE_Real_Estate">YouTube</a><a href="https://www.facebook.com/amre.grp">Facebook</a><a href="https://www.linkedin.com/company/amre-real-estate-group/">LinkedIn</a><a href="/privacy-policy/">Privacy Policy</a><a href="/terms-and-conditions/">Terms &amp; Conditions</a></div>' +
          '</div>' +
        '</div>' +
        '<div class="foot-bot">' +
          '<span>© 2026 AMRE Real Estate Group. All rights reserved. <a href="/privacy-policy/">Privacy Policy</a> · <a href="/terms-and-conditions/">Terms &amp; Conditions</a></span>' +
          '<span>Michael Abraham DRE# 02242095 · Ania De Pourbaix DRE# 01891438 · Compass DRE# 01991628</span>' +
        '</div>' +
      '</div>' +
    '</footer>' +
    '<div class="disclosure"><div class="wrap disclosure-in">' +
      '<p>AMRE Real Estate Group is a team of real estate agents affiliated with Compass. <a href="https://www.compass.com/" target="_blank" rel="noopener">Compass</a> is a real estate broker licensed by the State of California and abides by Equal Housing Opportunity laws. License Number 01991628. All material presented herein is intended for informational purposes only and is compiled from sources deemed reliable but has not been verified. Changes in price, condition, sale or withdrawal may be made without notice. No statement is made as to the accuracy of any description. All measurements and square footage are approximate. If your property is currently listed for sale this is not a solicitation.</p>' +
      '<div><img src="https://raw.githubusercontent.com/Hilex2030/amre-assets/main/website/assets/logos/realtor-eho-dark.jpg" alt="REALTOR® and Equal Housing Opportunity" loading="lazy"></div>' +
    '</div></div>';

  function mount(id, html) { var el = document.getElementById(id); if (el) el.outerHTML = html; }
  mount('amre-nav', navHTML);
  mount('amre-footer', footHTML);

  // ---- skip-to-content link (WCAG 2.4.1) ----
  (function () {
    var target = document.querySelector('main') ||
                 document.querySelector('.hero') ||
                 document.querySelector('section');
    if (!target) return;
    if (!target.id) target.id = 'main-content';
    if (target.getAttribute('tabindex') === null) target.setAttribute('tabindex', '-1');
    var skip = document.createElement('a');
    skip.className = 'amre-skip';
    skip.href = '#' + target.id;
    skip.textContent = 'Skip to main content';
    document.body.insertBefore(skip, document.body.firstChild);
  })();

  // ---- marquee pause control (WCAG 2.2.2) ----
  document.querySelectorAll('.marquee').forEach(function (mq) {
    if (mq.querySelector('.marquee-pause')) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'marquee-pause';
    b.setAttribute('aria-label', 'Pause scrolling text');
    b.textContent = 'Pause';
    b.addEventListener('click', function () {
      var paused = mq.classList.toggle('is-paused');
      b.textContent = paused ? 'Play' : 'Pause';
      b.setAttribute('aria-label', paused ? 'Resume scrolling text' : 'Pause scrolling text');
    });
    mq.appendChild(b);
  });

  // nav solidify on scroll
  var nav = document.getElementById('nav');
  if (nav) {
    // pages with a light top section set <body data-nav="solid"> to keep the nav solid
    var forceSolid = document.body && document.body.getAttribute('data-nav') === 'solid';
    var upd = function () { nav.classList.toggle('solid', forceSolid || window.scrollY > 60); };
    upd(); window.addEventListener('scroll', upd, { passive: true });
  }
  // hamburger drawer
  var ham = document.getElementById('ham'), drawer = document.getElementById('drawer');
  if (ham && drawer) {
    var backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop'; backdrop.id = 'drawerBackdrop';
    document.body.appendChild(backdrop);
    var setDrawer = function (open) {
      var wasInside = document.activeElement && drawer.contains(document.activeElement);
      ham.classList.toggle('open', open);
      drawer.classList.toggle('open', open);
      backdrop.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        drawer.removeAttribute('inert');
        var first = drawer.querySelector('a, button');
        if (first) first.focus();
      } else {
        if (wasInside) ham.focus();
        drawer.setAttribute('inert', '');
      }
    };
    ham.addEventListener('click', function () { setDrawer(!drawer.classList.contains('open')); });
    backdrop.addEventListener('click', function () { setDrawer(false); });
    document.addEventListener('keydown', function (e) {
      if ((e.key === 'Escape' || e.key === 'Esc') && drawer.classList.contains('open')) setDrawer(false);
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  }
  // keep "Los Angeles" on one line everywhere (current + future content)
  (function () {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) {
      var p = n.parentNode ? n.parentNode.nodeName : '';
      if (p === 'SCRIPT' || p === 'STYLE') continue;
      if (n.nodeValue.indexOf('Los Angeles') !== -1 || n.nodeValue.indexOf('eal Estate') !== -1 || n.nodeValue.indexOf('eal estate') !== -1) nodes.push(n);
    }
    nodes.forEach(function (t) { t.nodeValue = t.nodeValue.replace(/Los Angeles/g, 'Los\u00A0Angeles').replace(/real estate/g,'real\u00A0estate').replace(/Real Estate/g,'Real\u00A0Estate'); });
  })();

  // scroll reveals
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3 * 70) + 'ms'; io.observe(el); });

  // -- BreadcrumbList JSON-LD (ported from legacy site-chrome.js 2026-09-23); skipped if page already has one --
  (function () {
    try {
      var has = Array.prototype.some.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) { return /BreadcrumbList/.test(s.textContent); });
      if (has || document.getElementById('amre-breadcrumb-jsonld')) return;
      var path = (location.pathname || '/').replace(/\/+$/, ''), origin = 'https://amre.group';
      var crumbs = [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' }];
      if (path) {
        var acc = '';
        path.split('/').filter(Boolean).forEach(function (p, i) {
          acc += '/' + p;
          crumbs.push({ '@type': 'ListItem', position: i + 2, name: p.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); }), item: origin + acc + '/' });
        });
      }
      var tag = document.createElement('script');
      tag.type = 'application/ld+json'; tag.id = 'amre-breadcrumb-jsonld';
      tag.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs });
      document.head.appendChild(tag);
    } catch (e) {}
  })();
})();
