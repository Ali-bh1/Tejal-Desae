# Tejal Desae — Website Complete Guide

> **For non-technical readers:** This guide explains everything about your website in plain language — what it does, how the pieces fit together, and exactly how to get it live on the internet with the full backend working.

---

## Table of Contents

1. [What Was Built](#1-what-was-built)
2. [How the Website Works](#2-how-the-website-works)
3. [Your File Structure](#3-your-file-structure)
4. [Before You Go Live — Checklist](#4-before-you-go-live--checklist)
5. [Hosting — The Simple Option (Railway)](#5-hosting--the-simple-option-railway)
6. [Setting Up Your Domain](#6-setting-up-your-domain)
7. [Adding Your Portrait Photo](#7-adding-your-portrait-photo)
8. [Adding Your Razorpay Payment Links](#8-adding-your-razorpay-payment-links)
9. [Adding Your VSL Video](#9-adding-your-vsl-video)
10. [The Admin Dashboard](#10-the-admin-dashboard)
11. [Understanding the Assessment System](#11-understanding-the-assessment-system)
12. [What Happens When Someone Enrols](#12-what-happens-when-someone-enrols)
13. [Maintaining Your Website](#13-maintaining-your-website)
14. [Troubleshooting Common Issues](#14-troubleshooting-common-issues)

---

## 1. What Was Built

Your website is a **complete premium web application** — not just a simple website. Here is what it includes:

### The Frontend (what visitors see)
- **Homepage** — hero with your portrait, about section, all 5 programs, testimonials, application form
- **5 Program pages** — Money Energetics, Wealth Oracle, Divine Wealth, Sovereign Mentor, Inner Sanctum
- **Wealth Expansion Assessment** — 8-question quiz that reveals each visitor's wealth archetype
- **Personalised Report** — an animated profile report showing their results with insights and next steps
- **Video gate** — a page that plays your VSL video before the Money Energetics application
- **Privacy Policy** — GDPR compliant

### The Backend (the invisible engine)
- **Database** — stores every lead, their assessment answers, their scores, and report history
- **Scoring engine** — calculates archetype results on the server (visitors can never see or manipulate it)
- **Admin dashboard** — a private, password-protected area where you can see all your leads, their profiles, search and filter them, add coaching notes, and export to a spreadsheet
- **Security** — industry-standard security protecting all data

### The Design
- New brand: deep forest green + champagne gold
- Premium typography: Cormorant Garamond (elegant serif) + Jost (clean sans)
- Fully responsive — works on desktop, tablet, and mobile
- Smooth animations, scroll reveals, and a grain texture for a luxury feel

---

## 2. How the Website Works

Here is the complete journey a visitor takes:

```
1. Visitor lands on your homepage
   ↓
2. They scroll through your story and programs
   ↓
3. They click "Learn More" on a program → goes to that program's page
   ↓
4. They click "Enrol Now" or "Express Interest"
   ↓
5. Money Energetics only: they watch your VSL video first
   ↓
6. They take the Wealth Expansion Assessment (8 questions, ~3 minutes)
   ↓
7. They enter their name, email, and phone
   ↓
8. Their answers are scored ON THE SERVER (secure — not visible to them)
   ↓
9. They see their personalised Wealth Expansion Profile report
   ↓
10. They click "Continue to Enrolment" → redirected to Razorpay payment
   ↓
11. Payment completed
   ↓
12. Their lead data, assessment, and report are stored in your database
   ↓
13. You see everything in your Admin Dashboard
```

### The 5 Archetypes

The assessment identifies one of 5 wealth patterns:

| Archetype | Pattern | Theme |
|-----------|---------|-------|
| **The Guard** | More money feels risky, so you keep safe and small | Safety |
| **The Prover** | You feel like you have to earn the right to have it | Worthiness |
| **The Hider** | Being seen feels risky, so you stay a little small | Visibility |
| **The Giver** | You're amazing at giving — keeping it is the hard part | Receiving |
| **The Gripper** | If you're not holding on tight, it feels like it'll slip away | Ease |

---

## 3. Your File Structure

Here is what every folder and file does, explained simply:

```
Tejal-Desae/
│
├── index.html                    ← Your homepage
├── money-energetics.html         ← Money Energetics program page
├── wealth-oracle.html            ← Wealth Oracle program page
├── divine-wealth.html            ← Divine Wealth program page
├── sovereign-mentor.html         ← Sovereign Mentor program page
├── inner-sanctum.html            ← Inner Sanctum program page
│
├── apply-money-energetics.html   ← Sends people to the assessment (Money Energetics)
├── apply-wealth-oracle.html      ← Sends people to the assessment (Wealth Oracle)
├── apply-divine-wealth.html      ← Sends people to the assessment (Divine Wealth)
├── apply-sovereign-mentor.html   ← Sends people to the assessment (Sovereign Mentor)
├── apply-inner-sanctum.html      ← Sends people to the assessment (Inner Sanctum)
│
├── assessment.html               ← The Wealth Expansion Assessment (8 questions)
├── report.html                   ← The personalised client report
├── video.html                    ← VSL video gate (before Money Energetics)
├── privacy-policy.html           ← GDPR privacy policy
│
├── css/                          ← All the styling (colours, fonts, layout)
│   ├── variables.css             ← Your brand colours and fonts defined here
│   ├── base.css                  ← Buttons, animations, basic styles
│   ├── layout.css                ← Navigation and footer
│   ├── sections.css              ← Every homepage section styled here
│   ├── program-page.css          ← Program page specific styles
│   └── responsive.css            ← Mobile/tablet adjustments
│
├── js/                           ← All the interactive code
│   ├── main.js                   ← Starts everything up
│   ├── navigation.js             ← Navigation scrolling and hamburger menu
│   ├── animations.js             ← Scroll reveal, stat counters, page loader
│   └── form.js                   ← The application form + Razorpay redirect
│
├── images/                       ← All your images (add portrait here)
│   ├── hero-new-bg.jpg           ← Hero section background
│   ├── coffee-bg.jpg             ← Dark section background texture
│   ├── blush-bg.jpg              ← Light section background texture
│   ├── tejal-letter-1.jpg        ← Your photo (About section, left)
│   ├── tejal-letter-2.jpg        ← Your photo (About section, right)
│   └── ...                       ← Other background images
│
├── server/                       ← The backend (the invisible engine)
│   ├── .env.example              ← Template for your private settings
│   ├── package.json              ← List of software the backend needs
│   ├── README.md                 ← Technical server documentation
│   │
│   ├── src/                      ← The backend source code
│   │   ├── index.js              ← The main server file
│   │   ├── db/
│   │   │   ├── schema.sql        ← Database structure (tables and columns)
│   │   │   ├── migrate.js        ← Creates the database tables
│   │   │   └── seed.js           ← Creates your first admin account
│   │   ├── services/
│   │   │   └── scoring.js        ← Assessment scoring algorithm (private)
│   │   ├── middleware/
│   │   │   ├── auth.js           ← Login/logout security
│   │   │   ├── rateLimiter.js    ← Prevents brute force attacks
│   │   │   └── validate.js       ← Checks all input is valid
│   │   └── routes/
│   │       ├── assessment.js     ← Handles assessment submissions
│   │       ├── auth.js           ← Admin login/logout
│   │       └── admin.js          ← Admin dashboard data
│   │
│   └── public/admin/             ← Your admin dashboard
│       ├── index.html            ← Admin login page
│       ├── dashboard.css         ← Admin dashboard styles
│       └── dashboard.js          ← Admin dashboard functionality
│
└── assets/videos/                ← Create this folder and add your VSL video
    └── tejal-vsl.mp4             ← Your VSL video goes here (you need to add it)
```

---

## 4. Before You Go Live — Checklist

Work through these in order. You need to do all of them before the site is ready.

**Content you need to add:**
- [ ] **Your portrait photo** — see [Section 7](#7-adding-your-portrait-photo)
- [ ] **Your Razorpay payment links** — see [Section 8](#8-adding-your-razorpay-payment-links)
- [ ] **Your VSL video** — see [Section 9](#9-adding-your-vsl-video)

**Hosting you need to set up:**
- [ ] Create a Railway account — see [Section 5](#5-hosting--the-simple-option-railway)
- [ ] Deploy the backend
- [ ] Connect your domain — see [Section 6](#6-setting-up-your-domain)
- [ ] Create your admin password

---

## 5. Hosting — The Simple Option (Railway)

**What is Railway?** Railway is a hosting platform that runs your website and its database in the cloud. It is beginner-friendly, affordable (~$10-20/month), and handles all the technical complexity for you.

**Why Railway?** Because your website has a backend (a server + database), you cannot use simple static hosting like GitHub Pages or Netlify alone. Railway handles both.

### Step 1 — Create a Railway account

1. Go to **railway.app**
2. Click **Sign Up**
3. Sign up with your GitHub account (recommended) or email

### Step 2 — Connect your GitHub repository

1. In Railway, click **New Project**
2. Choose **Deploy from GitHub repo**
3. Select `Tejal-Desae` from the list
4. Railway will detect it automatically

### Step 3 — Add a PostgreSQL database

1. In your Railway project, click **+ New**
2. Choose **Database → Add PostgreSQL**
3. Railway creates a database automatically
4. Click on the database → **Variables** tab → copy the `DATABASE_URL` value (you'll need it in Step 5)

### Step 4 — Configure the server settings

1. Click on your web service in Railway
2. Go to **Settings** tab
3. Set the **Root Directory** to: `server`
4. Set the **Start Command** to: `npm start`
5. Set the **Build Command** to: `npm install`

### Step 5 — Add your environment variables

Environment variables are like private settings — passwords and keys that your server needs to work. They are never stored in your code files.

1. In Railway, click your web service → **Variables** tab
2. Add each of the following:

| Variable Name | What it is | How to get it |
|---------------|-----------|---------------|
| `DATABASE_URL` | Your database address | Copy from the PostgreSQL service (Step 3) |
| `NODE_ENV` | Environment type | Type: `production` |
| `PORT` | Port number | Type: `3000` |
| `JWT_SECRET` | Security key for login sessions | Generate one (see below) |
| `CSRF_SECRET` | Security key for form protection | Generate one (see below) |
| `ALLOWED_ORIGINS` | Your website domain | e.g. `https://tejaldesae.com` |
| `ADMIN_EMAIL` | Your admin login email | e.g. `tejal@tejaldesae.com` |
| `ADMIN_PASSWORD` | Your admin login password | Choose a strong password |

**To generate a security key (JWT_SECRET and CSRF_SECRET):**
1. Go to **randomkeygen.com**
2. Copy a key from the "256-bit WEP Keys" section
3. Use a different key for JWT_SECRET and CSRF_SECRET

### Step 6 — Create the database tables

1. In Railway, click on your web service
2. Go to the **Settings** tab → find **Shell** or open the Railway CLI
3. Run this command:
   ```
   npm run db:migrate
   ```
4. Then run:
   ```
   npm run db:seed
   ```
   This creates your admin account using the ADMIN_EMAIL and ADMIN_PASSWORD you set above.

### Step 7 — Get your Railway URL

1. In Railway, click your web service
2. Click **Settings** → **Domains**
3. Click **Generate Domain** — Railway gives you a free URL like `tejal-desae.up.railway.app`
4. Your site is now live at that URL!

---

## 6. Setting Up Your Domain

**What is a domain?** A domain is your website address — like `tejaldesae.com`. You probably already own one.

### If you already have a domain (e.g. on GoDaddy, Namecheap, Cloudflare)

1. In Railway → your web service → **Settings** → **Domains** → **Custom Domain**
2. Type your domain: `tejaldesae.com`
3. Railway will show you a **CNAME record** — it looks like:
   ```
   Type:  CNAME
   Name:  @  (or www)
   Value: something.railway.app
   ```
4. Log in to where you bought your domain (GoDaddy, Namecheap, etc.)
5. Find **DNS Settings** or **Manage DNS**
6. Add a new CNAME record with the values Railway gave you
7. Wait up to 24 hours for it to activate (usually much faster)

### If you don't have a domain yet

1. Go to **namecheap.com** or **cloudflare.com/products/registrar/**
2. Search for your desired domain (e.g. `tejaldesae.com`)
3. Purchase it (~$10-15/year)
4. Follow the steps above to connect it

---

## 7. Adding Your Portrait Photo

Your homepage hero has a slot ready for your portrait. Currently it shows a placeholder.

**Step 1 — Prepare your photo**
- Use a high-quality photo of yourself, ideally full-length or three-quarter length
- Good lighting, professional quality
- Save it as a JPEG file
- Recommended size: at least 800px wide, 1200px tall (portrait orientation)
- Keep the file size under 500KB (use **squoosh.app** to compress if needed)

**Step 2 — Add it to the project**
- Name the file: `tejal-portrait.jpg`
- Place it in the `images/` folder

**Step 3 — Uncomment the image in the code**
1. Open `index.html` in a text editor
2. Find this line (around line 90):
   ```html
   <!-- <img src="images/tejal-portrait.jpg" alt="Tejal Desae" class="hero-portrait"> -->
   ```
3. Remove the `<!--` at the start and `-->` at the end:
   ```html
   <img src="images/tejal-portrait.jpg" alt="Tejal Desae" class="hero-portrait">
   ```
4. Also delete (or leave) the placeholder div below it — it won't show once the image is active

**Step 4 — Upload to Railway**
- Commit the new image file to GitHub (drag and drop in the GitHub website)
- Railway will automatically redeploy

---

## 8. Adding Your Razorpay Payment Links

Razorpay is the payment system your website uses. After someone completes the assessment, they are redirected to a Razorpay payment page.

### Step 1 — Create your Razorpay account

1. Go to **razorpay.com** and sign up
2. Complete your KYC (identity verification) — required to accept payments
3. Switch to **Live Mode** when ready to accept real payments (use Test Mode while setting up)

### Step 2 — Create a Payment Link for each program

For each program, repeat these steps:

1. In Razorpay Dashboard → **Payment Links** → **+ Create Payment Link**
2. Set:
   - **Amount**: the program price (e.g. ₹46,000 for €555, or use EUR if your account supports it)
   - **Title**: e.g. "Money Energetics — 6-Week Wealth Reset"
   - **Description**: brief description
3. Click **Create** → Razorpay gives you a **Short URL** like `https://rzp.io/l/your-link-here`
4. Copy this URL

### Step 3 — Add the links to the website

1. Open the file `js/form.js` in a text editor
2. Find this section near the top:
   ```javascript
   const RAZORPAY_LINKS = {
     'money-energetics': 'https://rzp.io/l/MONEY_ENERGETICS',   // TODO: replace
     'wealth-oracle':    'https://rzp.io/l/WEALTH_ORACLE',      // TODO: replace
     'divine-wealth':    'https://rzp.io/l/DIVINE_WEALTH',      // TODO: replace
     'sovereign-mentor': 'https://rzp.io/l/SOVEREIGN_MENTOR',   // TODO: replace
     'inner-sanctum':    'https://rzp.io/l/INNER_SANCTUM',      // TODO: replace
   };
   ```
3. Replace each placeholder URL with your real Razorpay Short URL:
   ```javascript
   const RAZORPAY_LINKS = {
     'money-energetics': 'https://rzp.io/l/your-actual-link',
     'wealth-oracle':    'https://rzp.io/l/your-actual-link',
     'divine-wealth':    'https://rzp.io/l/your-actual-link',
     'sovereign-mentor': 'https://rzp.io/l/your-actual-link',
     'inner-sanctum':    'https://rzp.io/l/your-actual-link',
   };
   ```
4. Save the file and commit to GitHub

> **Important:** Do NOT change the key names in quotes (like `'money-energetics'`). Only change the URL values.

---

## 9. Adding Your VSL Video

The video gate (`video.html`) plays before the Money Energetics application. It unlocks the "Continue" button after the visitor watches 80% of the video.

### Step 1 — Prepare your video

- Format: **MP4** (H.264 codec)
- Keep under **50MB** for good web performance
- If your video is larger, consider uploading to YouTube/Vimeo and embedding it instead

### Step 2 — Add the video file

1. Create a folder called `assets` in your project, then inside it create a folder called `videos`
2. The full path should be: `assets/videos/`
3. Name your video file: `tejal-vsl.mp4`
4. Place it at: `assets/videos/tejal-vsl.mp4`

### Step 3 — Upload to your hosting

- Commit the video file to GitHub
- Railway will serve it automatically

> **If your video is too large for GitHub (>100MB):** Use a video hosting service instead:
> 1. Upload to **Vimeo** (recommended for premium feel) or YouTube (unlisted)
> 2. Get the embed code
> 3. Open `video.html` and replace the `<video>` element with the embed `<iframe>` from Vimeo/YouTube

---

## 10. The Admin Dashboard

Your admin dashboard is at: `https://yourdomain.com/admin`

It is completely private — only you can access it with your password.

### Logging in

1. Go to `https://yourdomain.com/admin`
2. Enter the email and password you set as `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Railway

### What you can do

**Overview (Dashboard tab)**
- See total leads and assessment completions at a glance
- See which programs have the most interest
- See which archetypes are most common among your leads
- See the 10 most recent leads

**Leads tab**
- See every person who completed the assessment
- Search by name or email
- Filter by program or archetype
- Click any lead to see their full profile

**Lead detail panel (click any lead)**
- Their name, email, phone, program
- Their archetype and expansion score
- Their category scores (which patterns are strongest)
- Their report view history (when they looked at their report)
- **Coaching notes** — add private notes only you can see
- Click "View Full Submission" to see their raw answers and the hidden coaching data

**Export CSV button**
- Downloads all your leads as a spreadsheet
- Opens in Excel or Google Sheets
- Includes archetype, scores, and all contact details

**Audit Log tab**
- A complete record of every admin action (who logged in, when, what they did)

---

## 11. Understanding the Assessment System

### Why the scoring happens on the server

Unlike most quizzes (where the scoring happens in the visitor's browser), your assessment scoring happens on **your server** in a file called `server/src/services/scoring.js`. This means:

- Visitors **cannot see or manipulate** their scores
- The coaching notes and internal flags are **never sent to the browser**
- The algorithm is completely private — no one can copy it

### What clients see vs. what you see

**Client report (`report.html`) shows:**
- Their archetype name and tag line
- Their expansion score (0-100)
- Their category breakdown bars
- Their personalised insights
- Their hidden strength
- Their next step recommendation
- A CTA to continue to enrolment

**Admin submission view shows additionally:**
- Their raw answers (Q1: A, Q2: C, etc.)
- All category scores as numbers
- Internal flags (e.g. "trauma adjacent", "burnout risk")
- Auto-generated coaching notes per archetype
- Your custom coaching notes

---

## 12. What Happens When Someone Enrols

Here is the exact technical flow when someone clicks "Enrol":

1. They click **"Enrol Now"** on a program page
2. Their program is stored in their browser session
3. **Money Energetics only:** they go to `video.html` first, watch your VSL
4. They land on `assessment.html` (via the apply page)
5. They answer 8 questions
6. They enter their name, email, and phone
7. Their answers are sent to your server (`POST /api/assessment/submit`)
8. Your server scores them using `scoring.js` (private)
9. Their lead and assessment are saved to your PostgreSQL database
10. The server returns their result (archetype + score — NOT the coaching notes)
11. They are redirected to `report.html?id=THEIR_SUBMISSION_ID`
12. They see their personalised report
13. They click "Continue to Enrolment"
14. They are redirected to your **Razorpay payment link** for that program
15. They complete payment on Razorpay
16. You receive a notification from Razorpay
17. You can see their full profile in your admin dashboard

---

## 13. Maintaining Your Website

### Making small text changes

1. Go to your GitHub repository (`github.com/Ali-bh1/Tejal-Desae`)
2. Find the HTML file you want to edit (e.g. `index.html`)
3. Click the pencil icon ✏️ to edit
4. Make your changes
5. Click **Commit changes**
6. Railway will automatically redeploy within 1-2 minutes

### Updating program prices

Prices appear in two places:
1. In the HTML file for that program (e.g. `money-energetics.html`) — for display
2. In `js/form.js` — in the `PROGRAM_NAMES` object (for the email subject line)

For Razorpay amounts, you update them in your Razorpay dashboard.

### Adding testimonials

Open `index.html`, find the testimonials section, and copy one of the existing `<div class="marquee-card">` blocks, then change the text.

### Changing your brand colours

Open `css/variables.css`. The two main colours are:
```css
--forest: #154230;   /* The dark green */
--gold:   #e6d3a3;   /* The champagne gold */
```
Change the hex codes to update all colours site-wide.

### Backing up your database

In Railway:
1. Click your PostgreSQL database
2. Go to **Backups** tab
3. Click **Create Backup** (Railway also does automatic daily backups on paid plans)

---

## 14. Troubleshooting Common Issues

**The website looks unstyled or broken**
- Clear your browser cache (Ctrl + Shift + R on Windows, Cmd + Shift + R on Mac)
- Check that Railway deployment succeeded (no red errors in Railway dashboard)

**The assessment doesn't save to the database**
- Check Railway logs (click your web service → **Logs** tab) for error messages
- Verify all your environment variables are set correctly in Railway
- Make sure `npm run db:migrate` was run

**I can't log in to the admin dashboard**
- Make sure you ran `npm run db:seed` after setting your ADMIN_EMAIL and ADMIN_PASSWORD
- If you need to reset your password: in Railway shell, run `npm run db:seed` again after changing ADMIN_PASSWORD in Railway variables

**The payment redirect doesn't work**
- Check that you've replaced the placeholder URLs in `js/form.js` with your real Razorpay links
- Make sure your Razorpay account is in Live Mode (not Test Mode)

**The video won't play**
- Check the file is at exactly `assets/videos/tejal-vsl.mp4`
- Check the file size isn't too large (over 100MB won't upload to GitHub — use Vimeo instead)
- The "Continue" button will unlock after 4 seconds as a fallback even if the video errors

**Someone completed the assessment but I don't see them in the admin**
- Check Railway logs for any errors during submission
- The assessment also works without the backend (client-side fallback) — in that case, leads won't be saved to the database. This only happens if the backend is not running.

**My domain isn't working**
- DNS changes can take up to 48 hours
- Check the CNAME record is exactly as Railway specified
- Try `dig yourdomain.com` in a terminal or use **dnschecker.org** to see DNS propagation

---

## Quick Reference

| What you want to do | Where to do it |
|---------------------|----------------|
| See all your leads | Admin dashboard → Leads tab |
| Export leads to Excel | Admin dashboard → Export CSV button |
| Add coaching notes to a lead | Admin dashboard → click the lead |
| Change your portrait | Add `images/tejal-portrait.jpg`, edit `index.html` |
| Change Razorpay links | Edit `js/form.js` |
| Change program content | Edit the relevant `.html` file |
| Change prices | Edit the HTML file + Razorpay dashboard |
| Add your VSL video | Add `assets/videos/tejal-vsl.mp4` |
| Log into admin | `yourdomain.com/admin` |
| Reset admin password | Change `ADMIN_PASSWORD` in Railway → run `npm run db:seed` |
| Check for errors | Railway dashboard → your service → Logs tab |

---

## Support

If you run into issues beyond what this guide covers, share the error message from Railway Logs with your developer. The most important information is always in the Logs tab.

---

*Built with care for the woman who has already decided. — 2026*
