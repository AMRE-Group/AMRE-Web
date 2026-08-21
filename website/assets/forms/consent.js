/* ══════════════════════════════════════════════════════════════════════════
   AMRE SMS/call consent — single source of truth.

   Include on ANY page with a form that collects a phone number:
     <link rel="stylesheet" href="/assets/forms/consent.css">
     <script src="/assets/forms/consent.js" defer></script>

   What it does
   ------------
   1. Finds every phone input on the page.
   2. Injects the canonical A2P 10DLC / TCPA consent block (checkbox + full
      disclosure language) immediately above that form's submit control —
      unless a consent block is already present, in which case it REWRITES the
      text to the canonical version so every form on the site says the same thing.
   3. Enforces it. Required whenever the phone field is required, or whenever
      the visitor has actually typed a phone number. Blocks submit-button
      clicks in the capture phase, so it works even on forms whose submit is
      wired through an inline onclick=.
   4. Stamps proof of consent (checked yes/no, timestamp, language version)
      into every EmailJS payload by wrapping emailjs.send — so the lead
      notification carries an audit trail with no per-page changes.
   5. Sets `user_message` — a clean copy of the visitor's own words, captured
      BEFORE the audit trail is appended to `message`. Customer-facing
      auto-reply templates must render {{user_message}}, never {{message}},
      so the TCPA audit line never appears in the visitor's inbox.

   Change the language ONCE here and it changes site-wide.
   ══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var VERSION = '2026-07-30';
  var SENDER  = 'AMRE Real Estate Group';

  // ── Canonical disclosure. Every required element is present:
  //    explicit opt-in · sender named · STOP to opt out · HELP · frequency
  //    varies · msg &amp; data rates · links to Privacy Policy + Terms.
  var TEXT =
    'I agree to be contacted by <strong>' + SENDER + '</strong> by phone call, email, and ' +
    'text message at the number and address I provided, including messages sent using ' +
    'automated technology. Consent is not a condition of purchase. To opt out, reply ' +
    '<strong>STOP</strong> to any text at any time, or click the unsubscribe link in any ' +
    'email. Reply <strong>HELP</strong> for help. Message frequency varies. Message and ' +
    'data rates may apply. See our ' +
    '<a href="/privacy-policy/" target="_blank" rel="noopener">Privacy Policy</a> &amp; ' +
    '<a href="/terms-and-conditions/" target="_blank" rel="noopener">Terms of Service</a>.';

  var SUBMIT_SEL = [
    'button[type="submit"]', 'input[type="submit"]',
    '.amre-submit', '.grpt-submit', '.grpt-skip',
    'button.submit', 'button.btn-fill', 'button.btn-solid',
    '[onclick*="Finish"]', '[onclick*="finish"]', '[onclick*="submit"]', '[onclick*="Submit"]'
  ].join(',');

  function digits(v) { return (v || '').replace(/\D/g, ''); }

  // ── locate every phone input ────────────────────────────────────────────
  function phoneInputs() {
    var all = [].slice.call(document.querySelectorAll('input'));
    return all.filter(function (i) {
      if (i.type === 'tel') return true;
      var key = ((i.name || '') + ' ' + (i.id || '') + ' ' + (i.autocomplete || '')).toLowerCase();
      return /phone|\btel\b|mobile/.test(key);
    });
  }

  // ── the container that holds both the phone field and its submit button ──
  function scopeFor(input) {
    var n = input;
    while (n && n !== document.body) {
      if (n.matches && n.matches('form, [data-consent-scope]')) {
        // a <form> may wrap several independent steps; prefer the tighter step
        var step = closestStep(input, n);
        return step || n;
      }
      n = n.parentElement;
    }
    // no form at all (e.g. the calculator gates) — climb to whatever holds a submit
    n = input.parentElement;
    while (n && n !== document.body) {
      if (n.querySelector(SUBMIT_SEL)) return n;
      n = n.parentElement;
    }
    return input.parentElement;
  }

  // multi-step gates: the phone lives in one step div with its own buttons
  function closestStep(input, stop) {
    var n = input.parentElement;
    while (n && n !== stop) {
      var id = n.id || '', cls = n.className || '';
      if (/step/i.test(id) || (typeof cls === 'string' && /step/i.test(cls))) {
        if (n.querySelector(SUBMIT_SEL)) return n;
      }
      n = n.parentElement;
    }
    return null;
  }

  function submitsIn(scope) {
    var list = [].slice.call(scope.querySelectorAll(SUBMIT_SEL));
    return list.filter(function (b) {
      // ignore chip / toggle buttons that aren't really submits
      if (b.type === 'button' && !/finish|submit/i.test(b.getAttribute('onclick') || '') &&
          !b.classList.contains('grpt-skip') && !b.classList.contains('amre-submit') &&
          !b.classList.contains('submit')) return false;
      return true;
    });
  }

  // ── build / normalise the consent block ─────────────────────────────────
  var seq = 0;
  function build(required) {
    var id = 'amreOptin' + (++seq);
    var w = document.createElement('div');
    w.className = 'amre-optin';
    w.setAttribute('data-amre-optin', '');
    w.innerHTML =
      '<input type="checkbox" id="' + id + '" name="optin" value="Yes"' + (required ? ' required' : '') + '>' +
      '<label for="' + id + '">' + TEXT + '</label>';
    return w;
  }

  // already carries every required element? leave the markup untouched.
  function alreadyCompliant(box) {
    var t = (box.textContent || '').toLowerCase();
    return t.indexOf('stop') > -1 && t.indexOf('help') > -1 &&
           t.indexOf('frequency varies') > -1 && t.indexOf('rates may apply') > -1 &&
           box.querySelector('a[href*="privacy-policy"]') &&
           box.querySelector('a[href*="terms"]');
  }

  function normaliseExisting(box) {
    if (alreadyCompliant(box)) {
      box.setAttribute('data-amre-optin', '');
      var c0 = box.querySelector('input[type="checkbox"]');
      if (c0 && !c0.name) c0.name = 'optin';
      return true;
    }
    // an older hand-written consent block — keep the checkbox, replace the words
    var cb  = box.querySelector('input[type="checkbox"]');
    var lbl = box.querySelector('span, label');
    if (!cb) return false;
    if (!cb.name) cb.name = 'optin';
    if (!cb.id) cb.id = 'amreOptin' + (++seq);
    if (lbl) {
      lbl.innerHTML = TEXT;
      if (lbl.tagName === 'LABEL') lbl.setAttribute('for', cb.id);
    }
    box.setAttribute('data-amre-optin', '');
    box.classList.add('amre-optin');
    return true;
  }

  // ── enforcement ─────────────────────────────────────────────────────────
  function enforce(scope, box, phone) {
    var cb = box.querySelector('input[type="checkbox"]');

    function needed() {
      return phone.required || digits(phone.value).length >= 7;
    }
    function ok() { return !needed() || cb.checked; }
    function nag() {
      box.classList.add('is-bad');
      try { cb.focus({ preventScroll: false }); } catch (e) { cb.focus(); }
      try { box.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {}
    }

    // keep the visual "required" state honest as the user types a number
    function sync() {
      if (needed()) { cb.setAttribute('required', ''); box.classList.add('is-required'); }
      else { cb.removeAttribute('required'); box.classList.remove('is-required'); }
    }
    phone.addEventListener('input', sync);
    phone.addEventListener('change', sync);
    sync();

    cb.addEventListener('change', function () { box.classList.remove('is-bad'); });

    // capture phase: runs before any inline onclick or page-level handler
    submitsIn(scope).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        if (ok()) return;
        e.preventDefault(); e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        nag();
      }, true);
    });

    var form = scope.matches('form') ? scope : scope.closest('form');
    if (form) {
      form.addEventListener('submit', function (e) {
        if (ok()) return;
        e.preventDefault(); e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        nag();
      }, true);
    }
  }

  // ── place a block next to every phone field ──────────────────────────────
  function apply() {
    phoneInputs().forEach(function (phone) {
      var scope = scopeFor(phone);
      if (!scope || scope.getAttribute('data-optin-done') === '1') return;

      var box = scope.querySelector('[data-amre-optin], .amre-consent, .amre-optin, .lg-consent');
      if (box) {
        if (!normaliseExisting(box)) return;
      } else {
        box = build(!!phone.required);
        var btn = submitsIn(scope)[0];
        if (btn && btn.parentElement) btn.parentElement.insertBefore(box, btn);
        else scope.appendChild(box);
      }

      scope.setAttribute('data-optin-done', '1');
      enforce(scope, box, phone);
    });
  }

  // ── audit trail: stamp consent onto every EmailJS payload ────────────────
  function wrapEmailJS() {
    if (typeof emailjs === 'undefined' || emailjs.__amreConsentWrapped) return;
    var orig = emailjs.send;
    if (typeof orig !== 'function') return;
    emailjs.send = function (service, template, params) {
      try {
        var cb = document.querySelector('[data-amre-optin] input[type="checkbox"], input[name="optin"]');
        params = params || {};
        var yes = !!(cb && cb.checked);
        params.optin = yes ? 'Yes' : 'No';
        params.optin_detail =
          'SMS/call/email consent: ' + (yes ? 'YES' : 'NO') +
          ' | captured ' + new Date().toISOString() +
          ' | language version ' + VERSION +
          ' | page ' + location.pathname;

        // Customer-facing echo of the visitor's own words, captured BEFORE the
        // audit trail is appended below. Every auto-reply template renders
        // {{user_message}}; only internal lead templates use {{message}}.
        // forms.js sets this too — this covers pages with inline EmailJS forms.
        if (!params.user_message) {
          var clean = (params.message || '').split('\n\n— SMS/call/email consent:')[0].trim();
          if (clean === 'No message provided') clean = '';
          params.user_message = clean ||
            'You didn’t include a message — no problem, I’ll follow up with a few questions.';
        }

        if (params.message && params.message.indexOf('consent:') < 0) {
          params.message = params.message + '\n\n— ' + params.optin_detail;
        }
      } catch (e) {}
      return orig.apply(emailjs, [service, template, params].concat([].slice.call(arguments, 3)));
    };
    emailjs.__amreConsentWrapped = true;
  }

  function boot() { apply(); wrapEmailJS(); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', boot);

  /* Forms that appear later (modals, gates rendered on demand).
     Heavily DEBOUNCED and self-terminating: an un-throttled observer on an
     animation-heavy page fires thousands of times a second and locks the tab. */
  try {
    var queued = false, checks = 0, obs;

    function pending() {
      return phoneInputs().some(function (p) {
        var sc = scopeFor(p);
        return sc && sc.getAttribute('data-optin-done') !== '1';
      });
    }

    obs = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () {
        queued = false;
        if (++checks > 40) { obs.disconnect(); return; }   // hard ceiling
        if (!pending()) return;                            // nothing new to do
        apply();
      }, 400);
    });
    obs.observe(document.body || document.documentElement, { childList: true, subtree: true });

    // stop watching once the page has settled
    setTimeout(function () { try { obs.disconnect(); } catch (e) {} }, 30000);
  } catch (e) {}
})();
