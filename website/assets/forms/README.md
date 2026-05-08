# AMRE forms system

Shared form infrastructure for amre.group. Two form types — **contact** and **valuation** — both wired to EmailJS with a dual-send pattern (user auto-reply + AMRE lead notification).

All public-site forms must use this system. Do not hand-roll new EmailJS forms or re-introduce Tally / third-party iframes.

## Files

| File | Purpose |
|---|---|
| `forms.css` | All shared styles (`.amre-form`, `.amre-chip`, `.amre-input`, etc.) |
| `forms.js` | Auto-discovers `[data-amre-form]` elements, wires chips, validation, and `emailjs.send()` × 2 |

## Adding a form to a new page

**1. Add to `<head>`:**

```html
<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="/assets/forms/forms.css">
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script src="/assets/forms/forms.js" defer></script>
```

**2. Drop in the form HTML.** Pick the variant you need below. Replace `{prefix}` with a unique slug for the page (e.g. `cf-buyers`, `vf-sellers`) and `{source}` with the page's path (`amre.group/buyers/`).

**3. That's it.** `forms.js` finds the form on `DOMContentLoaded`, wires submit + chips automatically.

## Variant A — contact form

Use for general inquiries, "Send a message", "Start a conversation", listing-page "Schedule a Showing", etc. Sends to the **contact** template pair.

```html
<div class="amre-chips" role="group" aria-label="What brings you here? (optional)">
  <span class="amre-chips-label">I'm a… <span class="amre-chips-optional">(optional)</span></span>
  <div class="amre-chips-row">
    <button type="button" class="amre-chip" data-value="Buyer" aria-pressed="false">Buyer</button>
    <button type="button" class="amre-chip" data-value="Seller" aria-pressed="false">Seller</button>
    <button type="button" class="amre-chip" data-value="Investor" aria-pressed="false">Investor</button>
    <button type="button" class="amre-chip" data-value="Just Curious" aria-pressed="false">Just Curious</button>
  </div>
</div>

<form class="amre-form" data-amre-form data-form-type="contact" data-source="{source}" novalidate>
  <input type="hidden" name="inquiry_type" value="">
  <div class="amre-row-2">
    <div class="amre-field">
      <label class="amre-label" for="{prefix}-fname">First name <span class="amre-required">*</span></label>
      <input class="amre-input" id="{prefix}-fname" name="first_name" type="text" required autocomplete="given-name">
    </div>
    <div class="amre-field">
      <label class="amre-label" for="{prefix}-lname">Last name</label>
      <input class="amre-input" id="{prefix}-lname" name="last_name" type="text" autocomplete="family-name">
    </div>
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-email">Email <span class="amre-required">*</span></label>
    <input class="amre-input" id="{prefix}-email" name="email" type="email" required autocomplete="email" inputmode="email">
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-phone">Phone</label>
    <input class="amre-input" id="{prefix}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="(optional)">
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-message">Message</label>
    <textarea class="amre-textarea" id="{prefix}-message" name="message" rows="5" placeholder="Tell us about your goals, timing, or any questions…"></textarea>
  </div>
  <label class="amre-consent">
    <input type="checkbox" name="optin" required>
    <span>I agree to be contacted by AMRE Real Estate Group via call, email, and text for real estate services. Reply 'stop' to opt out at any time. Message and data rates may apply. <a href="/terms-and-conditions/">Privacy Policy</a>.</span>
  </label>
  <button type="submit" class="amre-submit">
    <span class="amre-btn-text">Send message</span>
  </button>
  <div class="amre-error" role="alert">
    Something went wrong sending your message. Please try again, call <a href="tel:3237198585">(323) 719-8585</a>, or email <a href="mailto:michael.abraham@compass.com">michael.abraham@compass.com</a> directly.
  </div>
</form>

<div class="amre-success" role="status" aria-live="polite">
  <div class="amre-success-icon" aria-hidden="true">✓</div>
  <h3 class="amre-success-h">Message received.</h3>
  <p class="amre-success-p">Thanks for reaching out — we typically respond within a few hours on business days. A confirmation copy is on its way to your inbox.</p>
</div>
```

**Listing-page variant.** Add `data-property="{full address}"` to the `<form>` tag — the address gets prepended to the lead message automatically as `Inquiry about: 123 Main St` so Michael knows which property triggered the lead. You can also drop the chips block on listing pages since intent is implicit.

```html
<form class="amre-form" data-amre-form data-form-type="contact"
      data-source="amre.group/properties/123-main/"
      data-property="123 Main St, Los Angeles CA 90001"
      novalidate>
```

## Variant B — valuation form

Use for "What is your home worth?" CTAs and the dedicated `/home-valuation/` page. Sends to the **valuation** template pair.

```html
<form class="amre-form" data-amre-form data-form-type="valuation" data-source="{source}" novalidate>
  <div class="amre-row-2">
    <div class="amre-field">
      <label class="amre-label" for="{prefix}-fname">First name <span class="amre-required">*</span></label>
      <input class="amre-input" id="{prefix}-fname" name="first_name" type="text" required autocomplete="given-name">
    </div>
    <div class="amre-field">
      <label class="amre-label" for="{prefix}-lname">Last name</label>
      <input class="amre-input" id="{prefix}-lname" name="last_name" type="text" autocomplete="family-name">
    </div>
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-email">Email <span class="amre-required">*</span></label>
    <input class="amre-input" id="{prefix}-email" name="email" type="email" required autocomplete="email" inputmode="email">
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-phone">Phone</label>
    <input class="amre-input" id="{prefix}-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="(optional)">
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-address">Property address <span class="amre-required">*</span></label>
    <input class="amre-input" id="{prefix}-address" name="address" type="text" required autocomplete="street-address" placeholder="e.g., 123 Main St, Los Angeles, CA 90012">
  </div>
  <div class="amre-row-2">
    <div class="amre-field">
      <label class="amre-label" for="{prefix}-property-type">Property type</label>
      <select class="amre-select" id="{prefix}-property-type" name="property_type">
        <option value="">— Select —</option>
        <option value="Single-family home">Single-family home</option>
        <option value="Condo / Townhouse">Condo / Townhouse</option>
        <option value="Multi-family (2–4 units)">Multi-family (2–4 units)</option>
        <option value="Multi-family (5+ units)">Multi-family (5+ units)</option>
        <option value="Land / Lot">Land / Lot</option>
        <option value="Other">Other</option>
      </select>
    </div>
    <div class="amre-field">
      <label class="amre-label" for="{prefix}-timeline">Timeline</label>
      <select class="amre-select" id="{prefix}-timeline" name="timeline">
        <option value="">— Select —</option>
        <option value="ASAP">ASAP</option>
        <option value="1–3 months">1–3 months</option>
        <option value="3–6 months">3–6 months</option>
        <option value="6–12 months">6–12 months</option>
        <option value="Just exploring">Just exploring</option>
      </select>
    </div>
  </div>
  <div class="amre-field">
    <label class="amre-label" for="{prefix}-notes">Anything we should know?</label>
    <textarea class="amre-textarea" id="{prefix}-notes" name="notes" rows="4" placeholder="Recent updates, urgency, or specific questions…"></textarea>
  </div>
  <label class="amre-consent">
    <input type="checkbox" name="optin" required>
    <span>I agree to be contacted by AMRE Real Estate Group via call, email, and text for real estate services. Reply 'stop' to opt out at any time. Message and data rates may apply. <a href="/terms-and-conditions/">Privacy Policy</a>.</span>
  </label>
  <button type="submit" class="amre-submit">
    <span class="amre-btn-text">Get my free valuation</span>
  </button>
  <div class="amre-error" role="alert">
    Something went wrong sending your request. Please try again, call <a href="tel:3237198585">(323) 719-8585</a>, or email <a href="mailto:michael.abraham@compass.com">michael.abraham@compass.com</a> directly.
  </div>
</form>

<div class="amre-success" role="status" aria-live="polite">
  <div class="amre-success-icon" aria-hidden="true">✓</div>
  <h3 class="amre-success-h">Valuation requested.</h3>
  <p class="amre-success-p">Thanks for reaching out. Within 48 hours, you'll receive a personal CMA from Michael and Ania — not an algorithm. Watch your inbox for confirmation.</p>
</div>
```

## EmailJS configuration

Service and key are hardcoded at the top of `forms.js`. Templates live in a registry keyed by `data-form-type`.

| Form type | Lead template (to AMRE) | User auto-reply template |
|---|---|---|
| `contact` | `template_9y2zh4b` | `template_xwvinyi` |
| `valuation` | `template_p5rtsi8` | `template_8h3fkqu` |

| Setting | Value |
|---|---|
| Public key | `yWt3TMJ6ysOrH3vH1` |
| Service ID | `service_rvg801y` |
| SDK version | `@emailjs/browser@4` (CDN) |

Lead notifications go to `michael.abraham@compass.com`. Reply-to is set to the visitor's email so a normal reply lands in their inbox.

## Template variables sent on every submit

`forms.js` builds a single `templateParams` object and sends it to both templates — EmailJS only renders variables the template references, so it's fine that not every variable is used by both.

| Variable | Description | Used by |
|---|---|---|
| `to_name` | Visitor's first name | auto-reply (greeting) |
| `to_email` | Visitor's email | auto-reply (recipient) |
| `full_name` | "First Last" | lead |
| `first_name`, `last_name` | Split name | lead |
| `email`, `phone` | Contact info | lead |
| `message` | Visitor's message (contact form) | lead |
| `notes` | Visitor's notes (valuation form) | lead |
| `inquiry_type` | Chip selection: Buyer / Seller / Investor / Just Curious | lead (contact only) |
| `address` | Property address | lead (valuation only) |
| `property_type` | SFR / Condo / Multi-family / Land / Other | lead (valuation only) |
| `timeline` | ASAP / 1–3mo / 3–6mo / 6–12mo / Just exploring | lead (valuation only) |
| `property` | Pre-baked listing address (listing pages only) | lead via prepended message |
| `optin` | "Yes" / "No" | lead |
| `source` | Page path (set via `data-source`) | lead |
| `reply_to` | Visitor's email | both templates |

## Current site usage

| Page | Form type | Notes |
|---|---|---|
| `/` | valuation + contact | Banner valuation + footer "Send a message" |
| `/contact/` | contact | Primary contact entry point |
| `/buyers/` | contact | "Start a conversation" |
| `/sellers/` | valuation | Despite "Get a free valuation" heading; corrected May 2026 |
| `/home-valuation/` | valuation | Full valuation page |
| `/properties/fruitland-401/` | contact + property | Auto-prepends address to lead message |

## Adding a new form type

1. Create both templates in the EmailJS dashboard (lead + auto-reply).
2. Add the new entry to the `TEMPLATES` registry at the top of `forms.js`.
3. Build the form HTML following the variant patterns above with `data-form-type="{newtype}"`.
4. If the new form has fields not already in `buildParams()`, add them.

## Customization rules

- **Don't** edit the EmailJS credentials per-page. They're shared.
- **Don't** introduce a new public key or service ID. One per site.
- **Do** vary `data-source` to keep lead-source attribution clean.
- **Do** override the submit-button label by changing `<span class="amre-btn-text">Get my free valuation</span>` text.
- **Do** override the success heading/copy in the `.amre-success` block — that copy is per-form, not shared.

## Testing a new form

After deploying, submit a real test through the live form and confirm:

1. Lead email lands in `michael.abraham@compass.com` with all fields populated.
2. `source` field shows the correct page path.
3. Auto-reply lands in the test address with the right wording for the form type.
4. On listing pages, the `Inquiry about: …` line appears at the top of the lead message body.

If submission fails silently, open browser DevTools console — `forms.js` logs the EmailJS error response, which usually indicates a missing variable or a wrong template ID.

## Why this exists

Replaces the legacy Tally embeds (form IDs `aQZxXX` and `OD8jdg`) that previously powered every contact form on the site. Migration completed May 8, 2026. See commits `8747b1e` (forms.css), `05e2dbc` (forms.js), and the per-page migration commits for history.
