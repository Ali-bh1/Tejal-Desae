# Orchestration Plan: Full-Site Polish & Enrollment Flow

**Date:** 2026-03-02  
**Status:** PLANNING

---

## 1. Context & Current State

| Item | Finding |
|------|---------|
| Blush overlay opacity | `0.62–0.68` — too heavy, texture barely visible |
| Blush background-size | `auto` on main site sections, `130%` on program pages — inconsistent |
| Champagne subheadings | Using `var(--white)` or left as inherited — poor contrast on light bg |
| Blush subheadings | Using `var(--white)` — invisible on light bg |
| Money Energetics CTA | Links to `index.html#contact` (shared form) |
| Wealth Oracle CTA | Links to `index.html#contact` (same shared form) |
| Enrollment routing | `form.js` ALWAYS redirects to `video.html` → Stripe; no program awareness |
| video.html | Has hardcoded `buy.stripe.com/PAYMENT_LINK_ID` placeholder |
| form.js success | `showSuccess()` hardcodes Money Energetics Stripe URL |
| Security | Honeypot present, Web3Forms used, no XSS risks in static site |

---

## 2. Workstreams

### WS1 — CSS: Blush Background Opacity (Site-Wide)
Reduce all `rgba(var(--blush-rgb), 0.68)` and `rgba(249, 237, 240, 0.68)` to `0.50`.  
Reduce `rgba(249, 237, 240, 0.75)` to `0.52`.  
Also reduce `authority` section overlay from `0.62` → `0.48`.  
This applies to: `sections.css`, `program-page.css`.

### WS2 — CSS: Typography Theming (Program Pages)
- Blush-bg subheadings (`.program-section-title`, `.program-thread-sub`): Use `color: var(--coffee)` 
- Champagne-bg subheadings (modules `.program-section-title`): Use `color: #000` (pure black)
- This targets: `program-page.css`

### WS3 — CSS: Program Page Background Consistency
Match blush-bg to main site: `background-size: auto; background-position: center 35%; background-repeat: repeat;`
Fix the issue by using the same exact CSS pattern as `sections.css .authority`.
Targets: All blush sections in `program-page.css`.

### WS4 — Enrollment Flow: Program-Aware Routing
**Design:**
1. Money Energetics CTA → `video.html?program=money-energetics` (pre-enrol video gate)
2. Wealth Oracle CTA → `enrol.html?program=wealth-oracle` (direct form + payment)
3. `form.js`: Read `localStorage.getItem('tejal_program')` to route to correct Stripe link
4. `video.html`: Read URL param `program`, store in `localStorage('tejal_program')`; on proceed, route to program-specific Stripe link
5. `form.js` success message will reference program-specific Stripe URL

**Money Energetics flow:**
`money-energetics.html` → CTA → `video.html?program=money-energetics` → Watch video → Proceed → `index.html#apply` → Fill form → Submit → Correct Stripe link

**Wealth Oracle flow:**
`wealth-oracle.html` → CTA → `index.html#apply?program=wealth-oracle` → Fill form → Submit → Correct Stripe link

**Files affected:**
- `money-energetics.html` — Update CTA href
- `wealth-oracle.html` — Update CTA href
- `video.html` — Read URL param, store to localStorage, update proceed button
- `js/form.js` — Read localStorage program key, route to correct Stripe URL in success

### WS5 — Security & Professional Polish
- Validate no broken links in all 5 program pages
- Confirm video.html has proper `noindex` (already does ✅)
- Confirm honeypot is active in form.js (already does ✅)  
- Add `rel="noopener noreferrer"` to all external links
- Ensure CSP-safe inline event handling
- Update email in error message from placeholder to real (confirm with client — leave as-is if unknown)
- Catch and handle form draft loading errors (already wrapped in try/catch ✅)
- Confirm all images have alt text
- Add `loading="lazy"` to all `img` tags on program pages

---

## 3. Agent Assignment

| Agent | Workstream |
|-------|-----------|
| **frontend-specialist** | WS1, WS2, WS3 — CSS only |
| **backend-specialist** | WS4 — Enrollment routing logic in JS |
| **security-auditor** | WS5 — Security sweep + link audit |

---

## 4. File Change Matrix

| File | Workstream | Change |
|------|-----------|--------|
| `css/sections.css` | WS1 | Reduce blush overlay opacity |
| `css/program-page.css` | WS1, WS2, WS3 | Opacity, typography, bg-size consistency |
| `money-energetics.html` | WS4 | CTA href → `video.html?program=money-energetics` |
| `wealth-oracle.html` | WS4 | CTA href → `index.html#apply?program=wealth-oracle` |
| `video.html` | WS4 | Read program param, update proceed flow |
| `js/form.js` | WS4 | Program-aware Stripe routing |
| All `.html` files | WS5 | External link `rel` audit, `alt` attrs, lazy loading |

---

## 5. Implementation Order
1. WS1 + WS2 + WS3 (parallel CSS edits - no dependencies)
2. WS4 (JS routing - depends on CSS done first for CTAs)
3. WS5 (Security sweep - last, covers everything)
