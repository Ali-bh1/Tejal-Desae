# Tejal Desae — Website Setup & Operations Guide

A premium static website for identity & wealth manifestation mentor Tejal Desae. No backend required — runs on pure HTML/CSS/JS with third-party integrations for payments, forms, and bookings.

---

## Table of Contents

1. [How the Website Works](#1-how-the-website-works)
2. [Razorpay — Payment Gateway](#2-razorpay--payment-gateway)
3. [Web3Forms — Application Form](#3-web3forms--application-form)
4. [Images & Video — Asset Placement](#4-images--video--asset-placement)
5. [TidyCal — Discovery Calls](#5-tidycal--discovery-calls)
6. [Going Live (Hosting)](#6-going-live-hosting)

---

## 1. How the Website Works

### Site Map

| Page | URL | Purpose |
|------|-----|---------|
| Homepage | `index.html` | Hero, About, Programs overview, Testimonials, Contact form |
| Money Energetics | `money-energetics.html` | Program details (€555 · 6 weeks) |
| Wealth Oracle | `wealth-oracle.html` | Program details (€1,555 · 10 weeks) |
| Divine Wealth | `divine-wealth.html` | Program details (by invitation) |
| Sovereign Mentor | `sovereign-mentor.html` | Program details (by invitation) |
| Inner Sanctum | `inner-sanctum.html` | Program details (waitlist only) |
| Video Gate | `video.html` | VSL video before Money Energetics application |
| Privacy Policy | `privacy-policy.html` | GDPR compliant privacy policy |

### Dedicated Application Pages

Each program has its own application page with the exact same multi-step form as the homepage. This lets you see **which program** a user applied for in your email inbox.

| Apply Page | For Program | How Users Get There |
|------------|-------------|---------------------|
| `apply-money-energetics.html` | Money Energetics | Via video gate (`video.html`) or bottom CTA |
| `apply-wealth-oracle.html` | Wealth Oracle | Direct from program page CTAs |
| `apply-divine-wealth.html` | Divine Wealth | Direct from program page CTAs |
| `apply-sovereign-mentor.html` | Sovereign Mentor | Direct from program page CTAs |
| `apply-inner-sanctum.html` | Inner Sanctum | Direct from program page CTAs |

### Enrollment Flows

**Money Energetics (Video Gate Flow):**
```
User clicks "Enrol Now" on program page
    → Watches VSL video on video.html
    → Clicks "Continue to Application"
    → Fills multi-step form on apply-money-energetics.html
    → Form submits to Web3Forms (you get an email)
    → User is redirected to Razorpay payment link (€555)
```

**All Other Programs (Direct Flow):**
```
User clicks "Enrol Now" / "Express Interest" / "Join Waitlist"
    → Fills multi-step form on apply-[program].html
    → Form submits to Web3Forms (you get an email)
    → User is redirected to Razorpay payment link
```

### How You Know Which Program They Applied For

Every form submission includes a hidden field called `program_name`. In your Web3Forms inbox, you will see entries like:
- **Subject:** `New Application — Money Energetics (€555) — Tejal Desae`
- **Subject:** `New Application — Wealth Oracle (€1,555) — Tejal Desae`
- **Subject:** `New Application — Divine Wealth — Tejal Desae`

---

## 2. Razorpay — Payment Gateway

After a visitor submits the application form, they are automatically redirected to a Razorpay payment page. No coding is required — use **Razorpay Payment Links**.

### Creating Payment Links

1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Payment Links** in the left sidebar
3. Click **+ Create Payment Link**
4. Configure:
   - **Amount**: Set the price for the program (e.g., ₹46,000 for €555 equivalent, or use EUR if your account supports it)
   - **Title**: e.g., "Money Energetics — 6-Week Wealth Reset"
   - **Description**: Brief program description
   - **Accept Partial Payments**: Optional — enable if you want installments
5. Click **Create Link**
6. Razorpay gives you a **Short URL** like: `https://rzp.io/l/your-link`

### Pasting Payment Links Into the Website

Open `js/form.js` and locate this section near the top:

```js
const RAZORPAY_LINKS = {
    'money-energetics': 'https://rzp.io/l/MONEY_ENERGETICS',   // €555 — TODO: replace
    'wealth-oracle':    'https://rzp.io/l/WEALTH_ORACLE',      // €1,555 — TODO: replace
    'divine-wealth':    'https://rzp.io/l/DIVINE_WEALTH',      // TODO: replace
    'sovereign-mentor': 'https://rzp.io/l/SOVEREIGN_MENTOR',   // TODO: replace
    'inner-sanctum':    'https://rzp.io/l/INNER_SANCTUM',      // TODO: replace
};
const PAYMENT_FALLBACK = 'https://rzp.io/l/MONEY_ENERGETICS'; // TODO: replace
```

Replace each placeholder with your actual Razorpay Short URL. For example:

```js
'money-energetics': 'https://rzp.io/l/tejal-money-energetics',
```

Also update `PAYMENT_FALLBACK` with your default payment link (used as a safety net).

> **Important:** Do NOT change the key names (e.g., `'money-energetics'`). Only change the URL values.

### Testing Payments

1. Razorpay offers a **Test Mode** — create test payment links first
2. Submit a test application form on any apply page
3. Verify you are redirected to the correct Razorpay link after 3 seconds
4. Switch to **Live Mode** in Razorpay when ready to accept real payments

---

## 3. Web3Forms — Application Form

The application form submits directly to Web3Forms. Every response is emailed to your inbox with zero backend code.

### Setup

1. Go to [web3forms.com](https://web3forms.com) and sign up with the email you want submissions sent to
2. Web3Forms generates a unique **Access Key**
3. Open `js/form.js` and find:

```js
const ACCESS_KEY = '5c1e2ca1-ad51-4e82-9e77-e00ca2ad6fd9';
```

4. Replace with your actual key if different
5. Save the file — submissions will now email you automatically

### Downloading Submissions as Excel

1. Log in to [web3forms.com](https://web3forms.com)
2. Go to **Forms** → **Submissions**
3. Click **Export** → choose **Excel (.xlsx)** or **CSV**
4. The file includes every application field plus the `program_name`

> **Spam Protection**: A honeypot field is built into the form — no CAPTCHA needed.

---

## 4. Images & Video — Asset Placement

### Letter from Tejal — Photos

The "A Letter from Tejal" section on the homepage shows two personal photos. To replace the placeholders:

1. Save your two photos as:
   - `images/tejal-letter-1.jpg` — First photo (e.g., portrait)
   - `images/tejal-letter-2.jpg` — Second photo (e.g., lifestyle/speaking)

2. In `index.html`, find the Letter from Tejal section and update the `src` attributes:

```html
<img src="images/tejal-letter-1.jpg" alt="Tejal Desae" loading="lazy">
<img src="images/tejal-letter-2.jpg" alt="Tejal Desae" loading="lazy">
```

> **Recommended dimensions**: 600×800px or larger. JPEG format. Keep file size under 500KB for fast loading.

### VSL Video (Video Sales Letter)

The video gate page (`video.html`) plays a video before users can apply for Money Energetics.

1. Save your video file as: `assets/videos/tejal-vsl.mp4`
2. Create the folder if it doesn't exist: `assets/videos/`
3. The video element in `video.html` references this path automatically

> **Video tips**: MP4 format, H.264 codec. Keep under 50MB for good web performance. Consider also uploading to YouTube/Vimeo and embedding if the file is large.

### Hero Background Image

The main homepage hero uses: `images/hero-new-bg.jpg`

To change it, simply replace this file with your preferred image (recommended: 1920×1080px minimum, dark/moody tone works best with the overlay).

---

## 5. TidyCal — Discovery Calls

TidyCal handles calendar scheduling for discovery calls.

### Setup

1. Go to [tidycal.com](https://tidycal.com) and sign in
2. Create a booking type (e.g., "30-Minute Discovery Call")
3. Once published, TidyCal gives you a public URL like: `https://tidycal.com/yourname/discovery-call`

### Updating the Link

The discovery call link appears on every program page in the "Book a Discovery Call" button. The current link is:

```
https://tidycal.com/tejjalsdeesai1/money-energetics-reading-a-personal-human-design-diagnostic-with-tejal-desae
```

To change it, search for `tidycal.com` across all HTML files and update the URL.

---

## 6. Going Live (Hosting)

The site is a static HTML/CSS/JS project — no server or database required.

### Recommended: Netlify (Free)

1. Go to [netlify.com](https://netlify.com) and create a free account
2. Drag and drop the entire project folder onto the Netlify dashboard
3. Your site goes live instantly at a `*.netlify.app` URL
4. To connect a custom domain (e.g., `tejaldesae.com`), go to **Domain Settings** and follow the DNS instructions

### Alternative: Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub
2. Import the project repository
3. Vercel auto-deploys on every push

### File Structure

```
├── index.html                    # Homepage
├── money-energetics.html         # Program page
├── wealth-oracle.html            # Program page
├── divine-wealth.html            # Program page
├── sovereign-mentor.html         # Program page
├── inner-sanctum.html            # Program page
├── video.html                    # VSL video gate
├── privacy-policy.html           # Privacy policy
├── apply-money-energetics.html   # Dedicated apply form
├── apply-wealth-oracle.html      # Dedicated apply form
├── apply-divine-wealth.html      # Dedicated apply form
├── apply-sovereign-mentor.html   # Dedicated apply form
├── apply-inner-sanctum.html      # Dedicated apply form
├── css/
│   ├── variables.css             # Design tokens (colors, fonts)
│   ├── base.css                  # Reset & global styles
│   ├── layout.css                # Navigation, footer, grid
│   ├── sections.css              # Homepage sections
│   ├── program-page.css          # Program page styles
│   └── responsive.css            # Mobile breakpoints
├── js/
│   ├── main.js                   # App entry point
│   ├── form.js                   # Form logic + Razorpay routing
│   └── navigation.js             # Nav, scroll, mobile menu
├── images/                       # All site images
│   ├── hero-new-bg.jpg
│   ├── tejal-letter-1.jpg        # ← Add your photo here
│   └── tejal-letter-2.jpg        # ← Add your photo here
└── assets/
    └── videos/
        └── tejal-vsl.mp4         # ← Add your VSL video here
```

---

*For technical questions, contact the developer.*
