/* ════════════════════════════════════════════════════════════════════
   AMRE shared form logic
   - Auto-detects forms via [data-amre-form]
   - Form type via data-form-type="contact" | "valuation"
   - Source via data-source="amre.group/path/"
   - Property context (listing pages) via data-property="123 Main St"
   - Wires chip selectors, validation, and dual-send EmailJS pattern
   - Requires EmailJS SDK (@emailjs/browser@4) loaded before this script
   ════════════════════════════════════════════════════════════════════ */

(function(){
  // ── Credentials ──
  var EMAILJS_PUBLIC_KEY = 'yWt3TMJ6ysOrH3vH1';
  var EMAILJS_SERVICE_ID = 'service_rvg801y';

  // ── Template registry per form type ──
  var TEMPLATES = {
    contact:   { lead: 'template_9y2zh4b', user: 'template_xwvinyi' },
    valuation: { lead: 'template_p5rtsi8', user: 'template_8h3fkqu' },
    buyer:     { lead: 'template_s7ggyxb', user: 'template_9jgb96g' }
  };

  function initEmailJS(){
    if (typeof emailjs !== 'undefined') {
      try { emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY }); } catch(e){}
    }
  }

  // ── Chips ──
  function wireChips(form){
    var chips = form.querySelectorAll('.amre-chip');
    var hidden = form.querySelector('[name="inquiry_type"]');
    if (!chips.length || !hidden) return;
    var selected = null;
    chips.forEach(function(chip){
      chip.addEventListener('click', function(){
        var v = this.dataset.value;
        if (selected === v) {
          selected = null;
          hidden.value = '';
          chips.forEach(function(c){ c.setAttribute('aria-pressed','false'); c.classList.remove('is-selected'); });
        } else {
          selected = v;
          hidden.value = v;
          chips.forEach(function(c){
            var match = c.dataset.value === v;
            c.setAttribute('aria-pressed', match ? 'true' : 'false');
            c.classList.toggle('is-selected', match);
          });
        }
      });
    });
  }

  // ── Build templateParams ──
  function buildParams(form){
    var data = {};
    Array.prototype.forEach.call(form.elements, function(el){
      if (!el.name) return;
      if (el.type === 'checkbox') {
        data[el.name] = el.checked ? 'Yes' : 'No';
      } else {
        data[el.name] = (el.value || '').trim();
      }
    });

    var fname = data.first_name || '';
    var lname = data.last_name  || '';
    var email = data.email      || '';
    var msg   = data.message    || data.notes || '';

    return {
      to_name:       fname,
      to_email:      email,
      full_name:     (fname + (lname ? ' ' + lname : '')).trim(),
      first_name:    fname,
      last_name:     lname,
      email:         email,
      phone:         data.phone || 'Not provided',
      message:       msg || 'No message provided',
      notes:         data.notes || '',
      inquiry_type:  data.inquiry_type || 'Not specified',
      address:       data.address || '',
      property_type: data.property_type || '',
      timeline:      data.timeline || '',
      price_range:   data.price_range || '',
      bedrooms:      data.bedrooms || '',
      property:      form.dataset.property || '',
      optin:         data.optin || 'No',
      source:        form.dataset.source || (window.location.host + window.location.pathname),
      reply_to:      email
    };
  }

  // ── Validation ──
  function validate(form){
    var fname   = form.querySelector('[name="first_name"]');
    var email   = form.querySelector('[name="email"]');
    var address = form.querySelector('[name="address"]');
    var optin   = form.querySelector('[name="optin"]');

    if (fname && !fname.value.trim())                                 { alert('Please enter your first name.'); fname.focus(); return false; }
    if (email && (!email.value.trim() || !email.value.includes('@'))) { alert('Please enter a valid email address.'); email.focus(); return false; }
    if (address && address.required && !address.value.trim())         { alert('Please enter the property address.'); address.focus(); return false; }
    if (optin && !optin.checked)                                      { alert('Please agree to the contact terms to continue.'); return false; }
    return true;
  }

  // ── Submit ──
  function wireSubmit(form){
    var type = form.dataset.formType || 'contact';
    var tpl  = TEMPLATES[type];
    if (!tpl) { console.error('AMRE form: unknown type "' + type + '"'); return; }

    var btn       = form.querySelector('.amre-submit');
    var btnText   = btn ? btn.querySelector('.amre-btn-text') : null;
    var errorEl   = form.querySelector('.amre-error');
    var successEl = form.parentElement && form.parentElement.querySelector('.amre-success');

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!validate(form)) return;

      btn.disabled = true;
      if (btnText) {
        if (!btnText.dataset.original) btnText.dataset.original = btnText.textContent;
        btnText.textContent = 'Sending\u2026';
      }
      if (errorEl) errorEl.classList.remove('is-visible');

      var params = buildParams(form);

      // Listing pages: prepend property context to message body
      if (form.dataset.property && type === 'contact') {
        var orig = (params.message === 'No message provided') ? '(no additional message)' : params.message;
        params.message = 'Inquiry about: ' + form.dataset.property + '\n\n' + orig;
      }

      if (typeof emailjs === 'undefined') {
        console.error('AMRE form: EmailJS SDK not loaded');
        if (errorEl) errorEl.classList.add('is-visible');
        btn.disabled = false;
        if (btnText && btnText.dataset.original) btnText.textContent = btnText.dataset.original;
        return;
      }

      // User auto-reply, then internal lead notification
      emailjs.send(EMAILJS_SERVICE_ID, tpl.user, params)
        .then(function(){ return emailjs.send(EMAILJS_SERVICE_ID, tpl.lead, params); })
        .then(function(){
          form.style.display = 'none';
          if (successEl) {
            successEl.classList.add('is-visible');
            try {
              var rect = successEl.getBoundingClientRect();
              window.scrollTo({ top: window.scrollY + rect.top - 100, behavior: 'smooth' });
            } catch(_){}
          }
          // ── Analytics: Lead event ──
          var leadValue = (type === 'valuation') ? 1500 : 500;
          try {
            if (typeof gtag === 'function') {
              gtag('event', 'generate_lead', {
                event_category: 'engagement',
                event_label: type,
                form_source: params.source || '',
                value: leadValue,
                currency: 'USD'
              });
            }
          } catch(_){}
          try {
            if (typeof fbq === 'function') {
              fbq('track', 'Lead', {
                content_category: type,
                content_name: form.dataset.source || type + '_form',
                value: leadValue,
                currency: 'USD'
              });
            }
          } catch(_){}
        })
        .catch(function(err){
          console.error('AMRE form: EmailJS error', err);
          btn.disabled = false;
          if (btnText && btnText.dataset.original) btnText.textContent = btnText.dataset.original;
          if (errorEl) errorEl.classList.add('is-visible');
        });
    });
  }

  function init(){
    initEmailJS();
    document.querySelectorAll('[data-amre-form]').forEach(function(form){
      wireChips(form);
      wireSubmit(form);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
