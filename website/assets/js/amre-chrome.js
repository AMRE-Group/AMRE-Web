/* AMRE shared chrome — single source of truth for nav + footer.
   Every page includes:  <div id="amre-nav"></div> ... <div id="amre-footer"></div>
   then <script src="/assets/js/amre-chrome.js" defer></script>
   Styling comes from /assets/css/amre.css. Edit links/markup ONCE here. */
(function () {
  'use strict';
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
      + '.ham.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}';
    var st = document.createElement('style'); st.id = 'amre-chrome-css'; st.textContent = css;
    document.head.appendChild(st);
  })();

  // ---- nav links (edit once) ----
  var LINKS = [
    ['/sellers/', 'Sellers'], ['/buyers/', 'Buyers'],
    ['/cash-and-flow/', 'Cash &amp; Flow'], ['/about/', 'About'], ['/contact/', 'Contact'],
    ['/properties/fruitland-401/', 'Recent Sale']
  ];
  var active = function (h) { return location.pathname.replace(/\/$/, '') === h.replace(/\/$/, '') ? ' aria-current="page"' : ''; };
  var navLinks = LINKS.map(function (l) { return '<a href="' + l[0] + '"' + active(l[0]) + '>' + l[1] + '</a>'; }).join('');

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
          '<a href="/contact/" class="btn btn-fill">Get In Touch <span class="arrow">→</span></a>' +
          '<button class="ham" id="ham" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-drawer" id="drawer" aria-hidden="true"><nav>' + navLinks +
        '<a href="/blog/">Journal</a><a href="/contact/" class="btn btn-fill">Get In Touch</a></nav></div>' +
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
            '<div><h4>Navigate</h4><a href="/sellers/">Sellers</a><a href="/buyers/">Buyers</a><a href="/about/">Team</a><a href="/blog/">Journal</a><a href="/contact/">Contact</a><a href="/properties/">Past Transactions</a><a href="/properties/900-s-nueva-vista-dr/">Featured Property</a><a href="/properties/fruitland-401/">Recent Sale</a></div>' +
            '<div><h4>Services</h4><a href="/sellers/#three-phase">3-Phase Marketing</a><a href="/sellers/#concierge">Compass Concierge</a><a href="/buyers/">Buyer Advisory</a><a href="/#contact">Home Valuation</a><a href="/#contact">Investment Advisory</a><a href="/tools/investor-calculator/">Investor Calculator</a><a href="/tools/net-proceeds-calculator/">Seller Net Proceeds</a></div>' +
            '<div><h4>Connect</h4><a href="tel:3237198585">(323) 719-8585</a><a href="mailto:michael.abraham@compass.com">Email Us</a><a href="https://www.instagram.com/amre.group/">Instagram</a><a href="https://www.youtube.com/@AMRE_Real_Estate">YouTube</a><a href="https://www.facebook.com/amre.grp">Facebook</a><a href="https://www.linkedin.com/company/amre-real-estate-group/">LinkedIn</a></div>' +
          '</div>' +
        '</div>' +
        '<div class="foot-bot">' +
          '<span>© 2026 AMRE Real Estate Group. All rights reserved. <a href="/terms-and-conditions/">Privacy Policy</a></span>' +
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

  // nav solidify on scroll
  var nav = document.getElementById('nav');
  if (nav) {
    var upd = function () { nav.classList.toggle('solid', window.scrollY > 60); };
    upd(); window.addEventListener('scroll', upd, { passive: true });
  }
  // hamburger drawer
  var ham = document.getElementById('ham'), drawer = document.getElementById('drawer');
  if (ham && drawer) {
    ham.addEventListener('click', function () {
      var open = ham.classList.toggle('open');
      drawer.classList.toggle('open', open);
      ham.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () {
      ham.classList.remove('open'); drawer.classList.remove('open'); document.body.style.overflow = '';
    }); });
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
})();
