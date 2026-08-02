/**
 * form.js — Multi-step application form with Web3Forms + Razorpay routing (Revamped 2026)
 *
 * SETUP:
 * 1. Web3Forms key is already set below (register at web3forms.com to get yours)
 * 2. Create Razorpay Payment Links at dashboard.razorpay.com → Payment Links
 * 3. Replace the placeholder URLs in RAZORPAY_LINKS with your real Short URLs
 * 4. Do NOT change the key names (e.g. 'money-energetics')
 */

const ENDPOINT   = 'https://api.web3forms.com/submit';
const ACCESS_KEY = '5eb90167-6d6e-4872-9d00-1d73aee4786b';

// ── Razorpay Payment Links ───────────────────────────────────────
// Replace placeholder values with real Razorpay Short URLs (https://rzp.io/l/...)
const RAZORPAY_LINKS = {
  'money-energetics': 'https://rzp.io/l/MONEY_ENERGETICS',   // €555   — TODO: replace
  'wealth-oracle':    'https://rzp.io/l/WEALTH_ORACLE',      // €1,555 — TODO: replace
  'divine-wealth':    'https://rzp.io/l/DIVINE_WEALTH',      // TODO: replace
  'sovereign-mentor': 'https://rzp.io/l/SOVEREIGN_MENTOR',   // TODO: replace
  'inner-sanctum':    'https://rzp.io/l/INNER_SANCTUM',      // TODO: replace
};
const PAYMENT_FALLBACK = 'https://rzp.io/l/MONEY_ENERGETICS'; // TODO: replace

// Program display names for email subject
const PROGRAM_NAMES = {
  'money-energetics': 'Money Energetics (€555)',
  'wealth-oracle':    'Wealth Oracle (€1,555)',
  'divine-wealth':    'Divine Wealth',
  'sovereign-mentor': 'Sovereign Mentor',
  'inner-sanctum':    'Inner Sanctum',
};

// sessionStorage key set by each apply page / assessment
const PROGRAM_KEY = 'tejal_program';
const STORAGE_KEY = 'tejal_form_draft';

// ── State ────────────────────────────────────────────────────────
let currentStep = 0;
const TOTAL_STEPS = 4;

// ── DOM refs ─────────────────────────────────────────────────────
let form, steps, progressSteps, connectors, backBtn, nextBtn, submitBtn;
let successMsg, errorMsg;

export function initForm() {
  form = document.getElementById('application-form');
  if (!form) return; // not on a page with the form

  steps         = Array.from(form.querySelectorAll('.form-step'));
  progressSteps = Array.from(document.querySelectorAll('.progress-step'));
  connectors    = Array.from(document.querySelectorAll('.progress-connector'));
  backBtn       = form.querySelector('.btn-back');
  nextBtn       = form.querySelector('.btn-step-next');
  submitBtn     = form.querySelector('.form-submit');
  successMsg    = form.querySelector('.form-success');
  errorMsg      = form.querySelector('.form-error');

  // Range slider live display
  const rangeInput   = form.querySelector('input[type="range"]');
  const rangeDisplay = document.getElementById('range-display');
  if (rangeInput && rangeDisplay) {
    rangeInput.addEventListener('input', () => {
      rangeDisplay.textContent = rangeInput.value;
    });
  }

  // Restore draft
  restoreDraft();

  // Auto-save on input
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  // Navigation buttons
  if (nextBtn)   nextBtn.addEventListener('click', handleNext);
  if (backBtn)   backBtn.addEventListener('click', handleBack);
  if (submitBtn) form.addEventListener('submit', handleSubmit);

  renderStep(0);
}

// ── Step rendering ────────────────────────────────────────────────
function renderStep(step) {
  currentStep = step;

  steps.forEach((s, i) => {
    s.classList.toggle('active', i === step);
  });

  progressSteps.forEach((ps, i) => {
    ps.classList.toggle('active',    i === step);
    ps.classList.toggle('completed', i < step);
  });

  connectors.forEach((c, i) => {
    c.classList.toggle('filled', i < step);
  });

  // Show/hide nav buttons
  if (backBtn) {
    backBtn.classList.toggle('hidden', step === 0);
  }
  if (nextBtn && submitBtn) {
    const isLast = step === TOTAL_STEPS - 1;
    nextBtn.classList.toggle('hidden',   isLast);
    submitBtn.classList.toggle('hidden', !isLast);
  }
}

// ── Validation ────────────────────────────────────────────────────
function validateStep(step) {
  const currentStepEl = steps[step];
  if (!currentStepEl) return true;

  let valid = true;

  // Required text/email/tel inputs
  currentStepEl.querySelectorAll('input[required], textarea[required], select[required]').forEach(el => {
    if (!el.value.trim()) {
      el.style.borderColor = 'rgba(180,60,40,.6)';
      valid = false;
    } else {
      el.style.borderColor = '';
    }
  });

  // Required radio groups — find all radio inputs marked required, check if any in group is checked
  const radioNames = new Set();
  currentStepEl.querySelectorAll('input[type="radio"][required]').forEach(r => radioNames.add(r.name));
  radioNames.forEach(name => {
    const checked = currentStepEl.querySelector(`input[name="${name}"]:checked`);
    const group   = currentStepEl.querySelector(`input[name="${name}"]`)?.closest('.radio-group') ||
                    currentStepEl.querySelector(`input[name="${name}"]`)?.closest('.form-group');
    if (!checked) {
      if (group) group.style.outline = '1px solid rgba(180,60,40,.5)';
      valid = false;
    } else {
      if (group) group.style.outline = '';
    }
  });

  // Required checkboxes
  currentStepEl.querySelectorAll('input[type="checkbox"][required]').forEach(cb => {
    if (!cb.checked) {
      cb.closest('.checkbox-option').style.outline = '1px solid rgba(180,60,40,.5)';
      valid = false;
    } else {
      cb.closest('.checkbox-option').style.outline = '';
    }
  });

  // Email format
  const emailEl = currentStepEl.querySelector('input[type="email"]');
  if (emailEl && emailEl.value.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim())) {
      emailEl.style.borderColor = 'rgba(180,60,40,.6)';
      valid = false;
    }
  }

  return valid;
}

// ── Navigation ────────────────────────────────────────────────────
function handleNext() {
  if (!validateStep(currentStep)) return;
  if (currentStep < TOTAL_STEPS - 1) renderStep(currentStep + 1);
  window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
}

function handleBack() {
  if (currentStep > 0) renderStep(currentStep - 1);
  window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 120, behavior: 'smooth' });
}

// ── Submission ────────────────────────────────────────────────────
async function handleSubmit(e) {
  e.preventDefault();
  if (!validateStep(currentStep)) return;

  // Honeypot check
  const honeypot = form.querySelector('input[name="_honeypot"]');
  if (honeypot && honeypot.value) return;

  const program     = sessionStorage.getItem(PROGRAM_KEY) || 'money-energetics';
  const programName = PROGRAM_NAMES[program] || program;

  // Build payload
  const data = new FormData(form);
  const payload = {
    access_key:   ACCESS_KEY,
    subject:      `New Application — ${programName} — Tejal Desae`,
    program_name: programName,
    from_name:    'Tejal Desae Website',
    botcheck:     '',
  };

  // Collect all form fields (for both email and sheet)
  const extraFields = {};
  data.forEach((value, key) => {
    if (key !== 'access_key' && key !== '_honeypot' && key !== 'botcheck') {
      payload[key] = value;
      extraFields[key] = value;
    }
  });

  // Attach assessment results if available
  const topType = sessionStorage.getItem('tejal_top_type');
  const scores  = sessionStorage.getItem('tejal_scores');
  if (topType)  payload['wealth_expansion_profile'] = topType;
  if (scores)   payload['expansion_scores']         = scores;

  // Disable submit
  submitBtn.disabled    = true;
  submitBtn.textContent = 'Submitting…';
  if (errorMsg) { errorMsg.classList.add('hidden'); errorMsg.textContent = ''; }

  try {
    const res  = await fetch(ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const json = await res.json();

    if (json.success) {
      // Clear draft
      try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}

      // Log to Google Sheet (fire-and-forget — doesn't block the UI)
      logApplicationToSheet(extraFields, program, topType, scores);

      // Show success
      if (successMsg) {
        successMsg.classList.remove('hidden');
        successMsg.innerHTML = '<p>✦ Your application has been received. Redirecting to payment…</p>';
      }

      // Hide form body
      steps.forEach(s => (s.style.display = 'none'));
      document.querySelector('.form-progress')?.style && (document.querySelector('.form-progress').style.display = 'none');
      submitBtn.style.display = 'none';
      if (backBtn) backBtn.style.display = 'none';

      // Redirect to Razorpay after 3s
      setTimeout(() => {
        const paymentUrl = getPaymentUrl(program);
        if (paymentUrl) window.location.href = paymentUrl;
      }, 3000);

    } else {
      throw new Error(json.message || 'Submission failed');
    }
  } catch (err) {
    submitBtn.disabled    = false;
    submitBtn.textContent = 'Submit Application →';
    if (errorMsg) {
      errorMsg.classList.remove('hidden');
      errorMsg.textContent = 'Something went wrong. Please try again or contact us directly.';
    }
    console.error('Form error:', err);
  }
}

/**
 * Logs the application to Google Sheets via lead-service.
 * Non-blocking — failures are silently caught.
 */
function logApplicationToSheet(fields, program, topType, scores) {
  import('./lead-service.js').then(({ sendLead }) => {
    // Only log to sheet (email is already handled by Web3Forms above)
    sendLead({
      source:      'Application Form',
      firstName:   fields.firstName || fields.name || '',
      lastName:    fields.lastName || '',
      email:       fields.email || '',
      phone:       fields.phone || '',
      program:     program,
      archetype:   topType || '',
      scores:      scores || '',
      extraFields: fields,
    });
  }).catch(() => {});
}

// ── Payment URL resolver ──────────────────────────────────────────
function getPaymentUrl(program) {
  const url = RAZORPAY_LINKS[program] || PAYMENT_FALLBACK;
  // Security: only allow rzp.io URLs
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'rzp.io') return url;
  } catch (_) {}
  return null;
}

// ── Draft persistence ─────────────────────────────────────────────
function saveDraft() {
  try {
    const data = {};
    new FormData(form).forEach((v, k) => { data[k] = v; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

function restoreDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([k, v]) => {
      const el = form.elements[k];
      if (!el) return;
      if (el.type === 'checkbox' || el.type === 'radio') {
        const match = form.querySelector(`[name="${k}"][value="${v}"]`);
        if (match) match.checked = true;
      } else if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA' || el.type === 'text' || el.type === 'email' || el.type === 'tel' || el.type === 'range') {
        el.value = v;
        // Refresh range display
        if (el.type === 'range') {
          const disp = document.getElementById('range-display');
          if (disp) disp.textContent = v;
        }
      }
    });
  } catch (_) {}
}
