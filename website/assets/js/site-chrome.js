/* AMRE site chrome — single source of truth for site nav + mobile drawer.
   Edit nav links / buttons here ONCE; every page picks up the change.
   --------------------------------------------------------------------
   Required mount points on each page:
     <div id="site-nav-mount"></div>
     <div id="site-drawer-mount"></div>
   Place this script immediately after the mount points.
*/
(function () {
  'use strict';

  // ── Google Analytics 4 (G-B95R68B9EY) — auto-installs on every page that loads site-chrome.js ──
  (function () {
    var GA_ID = 'G-B95R68B9EY';
    if (window.__amre_ga_loaded) return;
    window.__amre_ga_loaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag(){window.dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  })();

  var BASE = '';
  var LOGO = 'https://raw.githubusercontent.com/Hilex2030/amre-assets/main/assets/logos';

  // ── Nav links — edit here, propagates everywhere ──
  var LINKS = [
    { href: BASE + '/sellers/', label: 'Sellers',  match: /\/sellers\// },
    { href: BASE + '/buyers/',  label: 'Buyers',   match: /\/buyers\//  },
    { href: BASE + '/team/',    label: 'Team',     match: /\/team\//    },
    { href: BASE + '/contact/', label: 'Contact',  match: /\/contact\// },
     { href: BASE + '/properties/mulholland-14423/', label: 'OUR PROCESS', match: /\/properties\/mulholland-14423\// }
  ];

  // ── Right-side actions — edit here, propagates everywhere ──
  // Order: leftmost first. Render in nav AND drawer.
  var ACTIONS = [
    { href: BASE + '/contact/', label: 'Get In Touch',     style: 'button', match: null            }
  ];

  function activeClass(matcher) {
    if (!matcher) return '';
    return matcher.test(window.location.pathname) ? ' active' : '';
  }

  function buildNavLinks() {
    return LINKS.map(function (l) {
      return '<li><a href="' + l.href + '" class="' +
             (activeClass(l.match).trim() || '') + '">' + l.label + '</a></li>';
    }).join('');
  }

  function buildNavActions() {
    return ACTIONS.map(function (a) {
      var cls = a.style === 'text' ? 'nav-link-text' : 'nav-cta';
      return '<a href="' + a.href + '" class="' + cls + '">' +
             a.label.replace(/ /g, '&nbsp;') + '</a>';
    }).join('');
  }

  function buildDrawerLinks() {
    var page = LINKS.map(function (l) {
      return '<li><a href="' + l.href + '"' +
             (activeClass(l.match) ? ' class="drawer-active"' : '') +
             '>' + l.label + '</a></li>';
    }).join('');
    var blog = '<li><a href="' + BASE + '/blog/">Journal</a></li>';
    var actions = ACTIONS.map(function (a) {
      var cls = a.style === 'text' ? '' : ' class="drawer-cta"';
      return '<li><a href="' + a.href + '"' + cls + '>' + a.label + '</a></li>';
    }).join('');
    return page + blog + actions;
  }

  function navHTML() {
    return '' +
      '<nav class="site-nav" id="siteNav" role="navigation" aria-label="Main navigation">' +
        '<a href="' + BASE + '/" class="nav-brand" aria-label="AMRE Real Estate Group">' +
          '<img src="' + LOGO + '/amre-white.svg" alt="AMRE Real Estate Group" class="logo-white nav-amre" width="80" height="22">' +
          '<img src="' + LOGO + '/amre-black.svg" alt="AMRE Real Estate Group" class="logo-dark nav-amre" width="80" height="22">' +
          '<div class="nav-sep" aria-hidden="true"></div>' +
          '<img src="' + LOGO + '/compass-white.png" alt="Compass" class="logo-white nav-compass" width="70" height="15">' +
          '<img src="' + LOGO + '/compass-black.png" alt="Compass" class="logo-dark nav-compass" width="70" height="15">' +
        '</a>' +
        '<ul class="nav-links">' + buildNavLinks() + '</ul>' +
        '<div class="nav-right">' +
          buildNavActions() +
          '<button class="ham-btn" id="hamBtn" aria-label="Toggle navigation menu" aria-expanded="false" aria-controls="mobileDrawer">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</nav>';
  }

  function drawerHTML() {
    return '' +
      '<div class="mobile-drawer" id="mobileDrawer" aria-hidden="true">' +
        '<ul role="list">' + buildDrawerLinks() + '</ul>' +
      '</div>';
  }

  // ── Inject ──
  var navMount    = document.getElementById('site-nav-mount');
  var drawerMount = document.getElementById('site-drawer-mount');
  if (navMount)    navMount.outerHTML    = navHTML();
  if (drawerMount) drawerMount.outerHTML = drawerHTML();

  // ── Scroll → light state ──
  (function () {
    var nav = document.getElementById('siteNav');
    if (!nav) return;
    function upd() { nav.classList.toggle('is-light', window.scrollY > 80); }
    upd();
    window.addEventListener('scroll', upd, { passive: true });
  })();

  // ── Hamburger / mobile drawer ──
  (function () {
    var btn = document.getElementById('hamBtn');
    var drawer = document.getElementById('mobileDrawer');
    if (!btn || !drawer) return;
    btn.addEventListener('click', function () {
      var open = btn.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        btn.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  })();

  // ── BreadcrumbList JSON-LD — auto-generated from URL path for every page ──
  (function () {
    try {
      var path = (location.pathname || '/').replace(/\/+$/, '');
      if (!path) path = '/';
      var origin = 'https://amre.group';
      var crumbs = [{
        '@type':'ListItem',
        position: 1,
        name: 'Home',
        item: origin + '/'
      }];
      if (path !== '/') {
        var parts = path.split('/').filter(Boolean);
        var acc = '';
        parts.forEach(function (p, i) {
          acc += '/' + p;
          // Title-case the slug for the breadcrumb name
          var name = p.replace(/-/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
          crumbs.push({
            '@type':'ListItem',
            position: i + 2,
            name: name,
            item: origin + acc + '/'
          });
        });
      }
      var ld = {
        '@context':'https://schema.org',
        '@type':'BreadcrumbList',
        itemListElement: crumbs
      };
      var tag = document.createElement('script');
      tag.type = 'application/ld+json';
      tag.id = 'amre-breadcrumb-jsonld';
      tag.textContent = JSON.stringify(ld);
      // Avoid duplicate injection
      if (!document.getElementById('amre-breadcrumb-jsonld')) {
        document.head.appendChild(tag);
      }
    } catch (e) { /* breadcrumb is non-critical */ }
  })();

})();
