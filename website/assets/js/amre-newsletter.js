/* AMRE newsletter — "The AMRE Edition" signup pop-up + shared submit handler.
   Loaded site-wide by amre-chrome.js. The /newsletter/ page reuses window.amreNewsletterSubmit.
   Signups go to the team inbox via the EmailJS contact lead-alert template
   until the AMRE MailerLite account is connected. */
(function () {
  'use strict';
  if (window.__amreNl) return;
  window.__amreNl = true;

  var SERVICE = 'service_rvg801y', TEAM = 'template_9y2zh4b', PUBKEY = 'yWt3TMJ6ysOrH3vH1';
  var KEY = 'amre_nl_state';           // localStorage: {sub:1} or {closed:n, until:ts}
  var PHOTO = '/assets/img/newsletter/team-michael-ania.jpg';
  var path = location.pathname;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return {}; } }
  function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} }
  function dl(o) { try { window.dataLayer = window.dataLayer || []; window.dataLayer.push(o); } catch (e) {} }

  function ensureEmailJS(cb) {
    if (window.emailjs) { try { emailjs.init({ publicKey: PUBKEY }); } catch (e) {} return cb(); }
    var s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
    s.onload = function () { try { emailjs.init({ publicKey: PUBKEY }); } catch (e) {} cb(); };
    s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }

  /* Shared submit: {email, first, interest, source} -> Promise */
  window.amreNewsletterSubmit = function (d) {
    return new Promise(function (resolve, reject) {
      ensureEmailJS(function () {
        if (!window.emailjs) return reject(new Error('emailjs unavailable'));
        var p = {
          to_name: d.first || 'there', first_name: d.first || '', full_name: d.first || 'Not provided',
          email: d.email, to_email: d.email, reply_to: d.email, phone: 'Not provided',
          inquiry_type: 'Newsletter signup — The AMRE Edition',
          message: 'Newsletter signup (The AMRE Edition). Interest: ' + (d.interest || 'Not specified') + '.',
          user_message: 'Newsletter signup. Interest: ' + (d.interest || 'Not specified') + '.',
          interest: d.interest || 'Not specified', source: d.source || ('amre.group' + path),
          optin_detail: 'Newsletter opt-in via ' + (d.source || path) + ' on ' + new Date().toISOString()
        };
        emailjs.send(SERVICE, TEAM, p).then(function () {
          save({ sub: 1 });
          dl({ event: 'newsletter_signup', form_source: p.source, interest: p.interest });
          resolve();
        }, reject);
      });
    });
  };

  /* ---------- pop-up ---------- */
  var SKIP = /^\/(newsletter|contact|contact-us|home-valuation|portal|admin|access|clients|agent|artifacts|presentation|postcard|seo|tools|privacy-policy|terms-and-conditions)(\/|$)/;
  if (SKIP.test(path)) return;
  var st = load();
  if (st.sub || (st.until && Date.now() < st.until)) return;

  var css =
    '.anl-back{position:fixed;inset:0;z-index:9990;background:rgba(20,28,24,.42);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;opacity:0;pointer-events:none;transition:opacity .35s ease}' +
    '.anl-back.on{opacity:1;pointer-events:auto}' +
    '.anl{position:relative;width:min(880px,100%);background:#faf7f1;border-radius:20px;overflow:hidden;display:flex;box-shadow:0 40px 80px -30px rgba(0,0,0,.5);transform:translateY(14px);transition:transform .4s cubic-bezier(.22,.61,.36,1);font-family:"Instrument Sans",-apple-system,Segoe UI,sans-serif;color:#1a1a1a}' +
    '.anl-back.on .anl{transform:none}' +
    '.anl-ph{flex:0 0 44%;background:#efe7d8 url(' + PHOTO + ') 60% center/cover;position:relative;min-height:500px}' +
    '.anl-cap{position:absolute;left:16px;bottom:16px;background:rgba(255,255,255,.93);border-radius:12px;padding:9px 13px;font-size:12px;line-height:1.35;color:#1c3d31;font-weight:600}' +
    '.anl-cap span{display:block;font-weight:500;color:#5a5a5a}' +
    '.anl-fm{flex:1;padding:42px 42px 32px}' +
    '.anl-x{position:absolute;top:12px;right:14px;width:34px;height:34px;border-radius:50%;border:0;background:rgba(255,255,255,.92);font-size:22px;line-height:1;color:#555;cursor:pointer;z-index:2}' +
    '.anl-eb{font-size:11px;letter-spacing:.22em;text-transform:uppercase;font-weight:700;color:#b07d00;margin:0 0 12px}' +
    '.anl h2{font-family:Fraunces,Georgia,serif;font-weight:400;color:#1c3d31;font-size:34px;line-height:1.1;letter-spacing:-.01em;margin:0 0 14px}' +
    '.anl h2 em{font-style:italic;color:#b07d00}' +
    '.anl p.anl-sub{margin:0 0 18px;font-size:14.5px;line-height:1.6;color:#4a4a46}' +
    '.anl-row{display:flex;gap:10px;margin-bottom:14px}' +
    '.anl input{flex:1;min-width:0;border:1px solid #d9d1c0;background:#fff;border-radius:10px;padding:13px 14px;font:500 14px "Instrument Sans",sans-serif;color:#1a1a1a}' +
    '.anl input:focus{outline:none;border-color:#e6a800}' +
    '.anl-lbl{font-size:12px;font-weight:700;color:#4a4a46;margin:0 0 8px}' +
    '.anl-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}' +
    '.anl-chip{border:1px solid #d9d1c0;border-radius:999px;padding:8px 13px;font:600 12.5px "Instrument Sans",sans-serif;color:#1c3d31;background:#fff;cursor:pointer}' +
    '.anl-chip.on{background:#1c3d31;color:#fff;border-color:#1c3d31}' +
    '.anl-btn{width:100%;border:0;border-radius:999px;padding:15px 20px;font:700 14px "Instrument Sans",sans-serif;color:#1a1a1a;background:linear-gradient(135deg,#ffce5e,#ffc13c 60%,#e6a800);box-shadow:0 10px 24px -10px rgba(230,168,0,.8);cursor:pointer}' +
    '.anl-btn:disabled{opacity:.65;cursor:wait}' +
    '.anl-micro{font-size:11.5px;color:#8f8a80;text-align:center;margin:12px 0 0}' +
    '.anl-micro a{color:#8f8a80}' +
    '.anl-err{display:none;font-size:12.5px;color:#b3261e;margin:-6px 0 10px}' +
    '.anl-ok{text-align:center;padding:30px 6px}' +
    '.anl-ck{width:60px;height:60px;border-radius:50%;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;background:linear-gradient(135deg,#ffc13c,#e6a800)}' +
    '.anl-nx{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:20px;text-align:left}' +
    '.anl-nx a{display:block;border:1px solid rgba(43,46,42,.14);border-radius:12px;padding:12px;font-size:12.5px;font-weight:600;color:#1c3d31;line-height:1.35;background:#fff;text-decoration:none}' +
    '.anl-nx a span{display:block;color:#5a5a5a;font-weight:500;margin-top:4px}' +
    '@media(max-width:760px){.anl-back{align-items:flex-end;padding:0}.anl{border-radius:22px 22px 0 0;flex-direction:column}.anl-ph{display:none}.anl-fm{padding:26px 22px 24px}.anl h2{font-size:27px}.anl-row{flex-direction:column}.anl-nx{grid-template-columns:1fr}.anl-x{top:10px;right:10px}}';

  var html =
    '<div class="anl" role="dialog" aria-modal="true" aria-labelledby="anlT">' +
      '<button class="anl-x" type="button" aria-label="Close">&times;</button>' +
      '<div class="anl-ph" aria-hidden="true"><div class="anl-cap">Michael &amp; Ania<span>Your AMRE team at Compass</span></div></div>' +
      '<div class="anl-fm">' +
        '<form class="anl-form" novalidate>' +
          '<p class="anl-eb">The AMRE Edition &middot; Once a month</p>' +
          '<h2 id="anlT">Los Angeles real estate,<br><em>and everything else<br>that matters.</em></h2>' +
          '<p class="anl-sub">New listings before they&rsquo;re everywhere, the Los Angeles market by the numbers, and the neighborhoods, openings and spots worth knowing.</p>' +
          '<div class="anl-row"><input type="text" name="first" placeholder="First name" autocomplete="given-name" aria-label="First name"><input type="email" name="email" placeholder="Email address" autocomplete="email" aria-label="Email address" required></div>' +
          '<p class="anl-err">Please enter a valid email address.</p>' +
          '<p class="anl-lbl">I&rsquo;m mostly interested in&hellip;</p>' +
          '<div class="anl-chips" role="group" aria-label="Interest"><button type="button" class="anl-chip">Buying</button><button type="button" class="anl-chip">Selling</button><button type="button" class="anl-chip">Investing</button><button type="button" class="anl-chip">Just watching</button></div>' +
          '<button type="submit" class="anl-btn">Send me the next edition &rarr;</button>' +
          '<p class="anl-micro">One email a month &middot; Unsubscribe anytime &middot; <a href="/privacy-policy/">We never share your email</a></p>' +
        '</form>' +
        '<div class="anl-ok" hidden><div class="anl-ck">&#10003;</div>' +
          '<h2 class="anl-okh">You&rsquo;re in.</h2>' +
          '<p class="anl-sub" style="margin:0">Your first edition lands at the start of next month. In the meantime:</p>' +
          '<div class="anl-nx"><a href="/private-exclusives/">Private exclusives<span>Before they go public &rarr;</span></a><a href="/home-valuation/">Your home&rsquo;s value<span>Back within 48 hours &rarr;</span></a><a href="https://calendar.app.google/yjBVQ2eqPNbtFY2Z9" target="_blank" rel="noopener">Book a 15-min call<span>Talk to us directly &rarr;</span></a></div>' +
        '</div>' +
      '</div>' +
    '</div>';

  var back, shown = false;
  function build() {
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
    back = document.createElement('div'); back.className = 'anl-back'; back.innerHTML = html;
    document.body.appendChild(back);
    var form = back.querySelector('.anl-form'), err = back.querySelector('.anl-err'), btn = back.querySelector('.anl-btn');
    var chips = back.querySelectorAll('.anl-chip'), interest = '';
    Array.prototype.forEach.call(chips, function (c) {
      c.addEventListener('click', function () {
        Array.prototype.forEach.call(chips, function (o) { o.classList.remove('on'); });
        c.classList.add('on'); interest = c.textContent;
      });
    });
    back.querySelector('.anl-x').addEventListener('click', close);
    back.addEventListener('click', function (e) { if (e.target === back) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && shown) close(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim(), first = form.first.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { err.style.display = 'block'; return; }
      err.style.display = 'none'; btn.disabled = true; btn.textContent = 'Sending…';
      window.amreNewsletterSubmit({ email: email, first: first, interest: interest, source: 'amre.group' + path + ' (pop-up)' })
        .then(function () {
          form.hidden = true; var ok = back.querySelector('.anl-ok'); ok.hidden = false;
          if (first) ok.querySelector('.anl-okh').textContent = 'You’re in, ' + first + '.';
        })
        .catch(function () { btn.disabled = false; btn.textContent = 'Send me the next edition →'; err.textContent = 'Something went wrong. Please try again or text (323) 719-8585.'; err.style.display = 'block'; });
    });
  }
  function otherModalOpen() {
    return !!document.querySelector('.omh-back.omh-on, .amre-modal.open, .amre-modal.is-open, .mobile-drawer.open');
  }
  function open(src) {
    if (shown || otherModalOpen()) return;
    var s = load(); if (s.sub || (s.until && Date.now() < s.until)) return;
    if (!back) build();
    shown = true; back.classList.add('on'); document.documentElement.style.overflow = 'hidden';
    dl({ event: 'newsletter_popup_open', popup_trigger: src });
  }
  function close() {
    back.classList.remove('on'); document.documentElement.style.overflow = '';
    var s = load(), n = (s.closed || 0) + 1;
    // first close: hide 14 days; second close: hide for a year
    save({ closed: n, until: Date.now() + (n >= 2 ? 365 : 14) * 864e5 });
  }

  var delay = path === '/' ? 30000 : 20000;
  function arm() {
    setTimeout(function () { open('timer'); }, delay);
    window.addEventListener('scroll', function onS() {
      var h = document.documentElement, pct = (h.scrollTop + window.innerHeight) / h.scrollHeight;
      if (pct > 0.4 && (Date.now() - t0) > 8000) { window.removeEventListener('scroll', onS); open('scroll'); }
    }, { passive: true });
  }
  var t0 = Date.now();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm); else arm();
})();
