# Tejal Desae Website — Setup Guide

This document covers every integration needed to take the website from a local build to a fully operational, revenue-generating platform. Follow each section in order.

---

## Table of Contents

1. [Web3Forms — Contact Form](#1-web3forms--contact-form)
2. [Downloading Form Submissions as Excel](#2-downloading-form-submissions-as-excel)
3. [Stripe — Payment Gateway](#3-stripe--payment-gateway)
4. [TidyCal — Booking & Discovery Calls](#4-tidycal--booking--discovery-calls)
5. [Going Live (Hosting)](#5-going-live-hosting)

---

## 1. Web3Forms — Contact Form

The application form on the site submits directly to Web3Forms. This routes every response to your email inbox with zero backend code.

### Steps

1. Go to [web3forms.com](https://web3forms.com) and sign up with the email address you want submissions sent to.
2. After signing in, Web3Forms will generate a unique **Access Key** for your email.
3. Open `js/form.js` and locate the following line near the top of the file:

```js
const ACCESS_KEY = 'YOUR_ACCESS_KEY_HERE';
```

4. Replace `'YOUR_ACCESS_KEY_HERE'` with your actual key:

```js
const ACCESS_KEY = 'a1b2c3d4-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
```

5. Save the file. Every form submission will now be emailed to your inbox automatically.

> **Spam Filter**: Web3Forms includes basic bot protection via a honeypot field already built into the form. No additional setup is needed.

---

## 2. Downloading Form Submissions as Excel

Every application submitted through your website is automatically logged and stored in your **Web3Forms Dashboard**. You can download all responses as an Excel/CSV file at any time.

### How to Export

1. Log in to your account at [web3forms.com](https://web3forms.com).
2. Go to the **Forms** or **Submissions** section.
3. Select your form.
4. Click the **Export** button (usually located at the top right of the submissions table).
5. Choose **Excel (.xlsx)** or **CSV** format.
6. The file will download to your computer containing every captured application field.

### Benefits of Dashboard Export

- **Security**: Submissions are stored on secure Web3Forms servers, not in your browser.
- **Reliability**: Data is never lost if you clear your browser cache or switch computers.
- **Centralized**: All submissions are always available in one place.

---

## 3. Stripe — Payment Gateway

After a visitor submits the application form, they are automatically redirected to a Stripe payment page. No Stripe developer account or code is required — use **Stripe Payment Links**.

### Steps

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and create or log in to your account.
2. In the left sidebar, navigate to **Products → Payment Links**.
3. Click **+ New** and configure your product:
   - Add a product name (e.g., "Sovereign Rising — Discovery Call Deposit")
   - Set the price and currency
   - Click **Create Link**
4. Stripe will give you a URL that looks like: `https://buy.stripe.com/xxxxxxxxx`
5. Open `js/form.js` and find this line (it appears twice):

```js
const stripeUrl = 'https://buy.stripe.com/PAYMENT_LINK_ID';
```

6. Replace both occurrences with your actual Stripe Payment Link:

```js
const stripeUrl = 'https://buy.stripe.com/your_actual_link_here';
```

7. Save the file.

### Result

After form submission, clients are automatically redirected to your Stripe payment page within 3 seconds. A fallback link is shown in the success message if the redirect does not trigger.

### Multiple Products

If you offer more than one programme with different price points, create a separate Payment Link in Stripe for each one. You can then update the redirect URL conditionally based on which programme the client selects in the form.

---

## 4. TidyCal — Booking & Discovery Calls

TidyCal handles calendar scheduling for discovery calls and strategy sessions.

### Steps

1. Go to [tidycal.com](https://tidycal.com) and sign in.
2. Create a booking type (e.g., "30-Minute Discovery Call") and configure your availability.
3. Once published, TidyCal gives you a public booking URL:
   `https://tidycal.com/yourname/discovery-call`

### Option A — Direct Link (Recommended)

Update the CTA buttons that should open a booking page. In `index.html`, locate the button text you want to link and update `href`:

```html
<a href="https://tidycal.com/yourname/discovery-call" target="_blank" class="btn-primary">
    Book a Discovery Call
</a>
```

### Option B — Embedded Widget

If you want the calendar to appear directly on the page without a redirect, TidyCal provides an embed snippet. Add this inside the relevant section in `index.html`:

```html
<!-- TidyCal Embed -->
<div class="tidycal-embed" data-path="yourname/discovery-call"></div>
<script src="https://asset-tidycal.b-cdn.net/js/embed.js" async></script>
```

Replace `yourname/discovery-call` with your actual TidyCal path.

---

## 5. Going Live (Hosting)

The site is a static HTML/CSS/JS project — no server or database is required. Any static hosting provider works.

### Recommended: Netlify (Free)

1. Go to [netlify.com](https://netlify.com) and create a free account.
2. Drag and drop the entire project folder onto the Netlify dashboard.
3. Your site goes live instantly at a `*.netlify.app` URL.
4. To connect a custom domain (e.g., `tejaldesae.com`), go to **Domain Settings** and follow the DNS instructions.

### Alternative: Vercel

1. Go to [vercel.com](https://vercel.com), sign in with GitHub.
2. Import the project repository.
3. Vercel deploys automatically on every push.

---

*For any technical questions related to this setup, contact the developer.*
