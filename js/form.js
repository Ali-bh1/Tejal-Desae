/**
 * Multi-Step Application Form
 * Handles: step navigation, per-step validation, progress bar, Web3Forms submission.
 * Routes to the correct Razorpay payment link based on which program the user enrolled for.
 *
 * SETUP INSTRUCTIONS (for Tejal):
 * ───────────────────────────────────────────────────────────
 * 1. Log in to Razorpay Dashboard → Payment Links → Create New
 * 2. Create one link per program with the correct amount & description
 * 3. Copy the Short URL (e.g. https://rzp.io/l/yourlink)
 * 4. Paste each link into RAZORPAY_LINKS below
 * 5. DO NOT change the program key names (money-energetics, etc.)
 * ───────────────────────────────────────────────────────────
 */

const ContactForm = (() => {
    const ENDPOINT = 'https://api.web3forms.com/submit';

    // Replace with your Web3Forms access key (register at web3forms.com)
    const ACCESS_KEY = '5c1e2ca1-ad51-4e82-9e77-e00ca2ad6fd9';

    // ─── Razorpay Payment Links ─────────────────────────────────
    // HOW: Razorpay Dashboard → Payment Links → Create → copy Short URL
    // FORMAT: https://rzp.io/l/your-link-here
    const RAZORPAY_LINKS = {
        'money-energetics': 'https://rzp.io/l/MONEY_ENERGETICS',   // €555 — TODO: replace
        'wealth-oracle': 'https://rzp.io/l/WEALTH_ORACLE',      // €1,555 — TODO: replace
        'divine-wealth': 'https://rzp.io/l/DIVINE_WEALTH',      // TODO: replace
        'sovereign-mentor': 'https://rzp.io/l/SOVEREIGN_MENTOR',   // TODO: replace
        'inner-sanctum': 'https://rzp.io/l/INNER_SANCTUM',      // TODO: replace
    };
    const PAYMENT_FALLBACK = 'https://rzp.io/l/MONEY_ENERGETICS'; // TODO: replace
    // ─────────────────────────────────────────────────

    // localStorage key for draft autosave
    const STORAGE_KEY = 'tejal_form_draft';

    // sessionStorage key set by video.html or wealth-oracle.html CTAs
    const PROGRAM_KEY = 'tejal_program';

    // State
    let currentStep = 0;
    const totalSteps = 4;

    // DOM refs
    let form, steps, progressSteps, connectors, backBtn, nextBtn, submitBtn;
    let successMsg, errorMsg;

    /**
     * Resolve which Razorpay link to use based on the enrolled program.
     * Reads from sessionStorage first (set by apply page hidden field logic),
     * then URL params as fallback.
     */
    function resolvePaymentLink() {
        // Primary: read from sessionStorage (set by apply page on load)
        let program = sessionStorage.getItem(PROGRAM_KEY);

        if (!program) {
            // Fallback 1: standard query string
            program = new URLSearchParams(window.location.search).get('program');
        }

        if (!program) {
            // Fallback 2: param after hash (e.g. index.html#apply?program=wealth-oracle)
            const hashQuery = window.location.hash.split('?')[1];
            if (hashQuery) {
                program = new URLSearchParams(hashQuery).get('program');
            }
        }

        return RAZORPAY_LINKS[program] || PAYMENT_FALLBACK;
    }

    /**
     * Resolve a human-readable program name for the email subject.
     */
    function resolveEmailSubject() {
        let program = sessionStorage.getItem(PROGRAM_KEY);
        if (!program) program = new URLSearchParams(window.location.search).get('program');
        if (!program) {
            const hashQuery = window.location.hash.split('?')[1];
            if (hashQuery) program = new URLSearchParams(hashQuery).get('program');
        }
        program = program || 'unknown';

        const labels = {
            'money-energetics': 'Money Energetics (€555)',
            'wealth-oracle': 'Wealth Oracle (€1,555)',
            'divine-wealth': 'Divine Wealth',
            'sovereign-mentor': 'Sovereign Mentor',
            'inner-sanctum': 'Inner Sanctum',
        };
        const label = labels[program] || 'Program Application';
        return `New Application — ${label} — Tejal Desae`;
    }

    /**
     * Initialize form
     */
    function init() {
        form = document.getElementById('application-form');
        if (!form) return;

        steps = form.querySelectorAll('.form-step');
        progressSteps = document.querySelectorAll('.progress-step');
        connectors = document.querySelectorAll('.progress-connector');
        backBtn = form.querySelector('.btn-step-back');
        nextBtn = form.querySelector('.btn-step-next');
        submitBtn = form.querySelector('.form-submit');
        successMsg = form.querySelector('.form-success');
        errorMsg = form.querySelector('.form-error');

        bindEvents();
        loadDraft();
        updateUI();
    }

    /**
     * Bind events
     */
    function bindEvents() {
        nextBtn?.addEventListener('click', goNext);
        backBtn?.addEventListener('click', goBack);
        form.addEventListener('submit', handleSubmit);

        // Auto-save on input
        form.addEventListener('input', saveDraft);

        // Range slider live value display
        const rangeInput = form.querySelector('input[type="range"]');
        const rangeValue = form.querySelector('.range-value');
        if (rangeInput && rangeValue) {
            rangeInput.addEventListener('input', () => {
                rangeValue.textContent = rangeInput.value;
            });
        }
    }

    /**
     * Persistence — draft autosave
     */
    function saveDraft() {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            // Never persist honeypot or access key
            if (key !== 'access_key' && key !== '_honeypot') {
                data[key] = value;
            }
        });
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                step: currentStep,
                data: data
            }));
        } catch (e) {
            // localStorage unavailable (e.g. private browsing) — fail silently
        }
    }

    function loadDraft() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;

            const { step, data } = JSON.parse(saved);

            // Populate fields
            Object.keys(data).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (!input) return;

                if (input.type === 'radio') {
                    const radio = form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                    if (radio) radio.checked = true;
                } else if (input.type === 'checkbox') {
                    input.checked = data[key] === 'on';
                } else {
                    input.value = data[key];
                }
            });

            // Restore step position
            if (typeof step === 'number' && step >= 0 && step < totalSteps) {
                currentStep = step;
            }

            // Sync range display
            const rangeInput = form.querySelector('input[type="range"]');
            const rangeValue = form.querySelector('.range-value');
            if (rangeInput && rangeValue) {
                rangeValue.textContent = rangeInput.value;
            }
        } catch (e) {
            // Corrupted draft — start fresh
            clearDraft();
        }
    }

    function clearDraft() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) { /* ignore */ }
    }

    /**
     * Go to next step (with validation)
     */
    function goNext() {
        if (!validateCurrentStep()) return;
        if (currentStep < totalSteps - 1) {
            currentStep++;
            updateUI();
            scrollToForm();
        }
    }

    /**
     * Go to previous step
     */
    function goBack() {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
            scrollToForm();
        }
    }

    /**
     * Update all UI elements for current step
     */
    function updateUI() {
        // Show/hide step panels
        steps.forEach((step, i) => {
            step.classList.toggle('active', i === currentStep);
        });

        // Update progress bar
        progressSteps.forEach((ps, i) => {
            ps.classList.remove('active', 'completed');
            if (i === currentStep) ps.classList.add('active');
            if (i < currentStep) ps.classList.add('completed');
        });

        // Update connectors
        connectors.forEach((c, i) => {
            c.classList.toggle('filled', i < currentStep);
        });

        // Show/hide nav buttons
        backBtn.classList.toggle('hidden', currentStep === 0);

        const isLastStep = currentStep === totalSteps - 1;
        nextBtn.style.display = isLastStep ? 'none' : '';
        submitBtn.style.display = isLastStep ? '' : 'none';
    }

    /**
     * Scroll to form top on step change
     */
    function scrollToForm() {
        const formTop = form.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: formTop, behavior: 'smooth' });
    }

    /**
     * Validate current step's required fields
     */
    function validateCurrentStep() {
        const activeStep = steps[currentStep];
        const requiredFields = activeStep.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            // Check radio groups
            if (field.type === 'radio') {
                const name = field.name;
                const groupChecked = activeStep.querySelector(`input[name="${name}"]:checked`);
                if (!groupChecked) {
                    const group = field.closest('.radio-group');
                    if (group) {
                        group.style.outline = '1px solid #c0392b';
                        group.style.outlineOffset = '4px';
                        setTimeout(() => {
                            group.style.outline = '';
                            group.style.outlineOffset = '';
                        }, 3000);
                    }
                    isValid = false;
                }
                return; // Radio validated as group
            }

            if (!field.value.trim()) {
                field.style.borderColor = '#c0392b';
                isValid = false;
                field.addEventListener('input', () => {
                    field.style.borderColor = '';
                }, { once: true });
            }
        });

        // Validate email format
        const emailField = activeStep.querySelector('input[type="email"]');
        if (emailField && emailField.value && !isValidEmail(emailField.value)) {
            emailField.style.borderColor = '#c0392b';
            isValid = false;
        }

        return isValid;
    }

    /**
     * Handle form submission
     */
    async function handleSubmit(e) {
        e.preventDefault();
        if (!validateCurrentStep()) return;

        // Honeypot check (bot protection)
        const honeypot = form.querySelector('[name="_honeypot"]')?.value;
        if (honeypot) {
            // Bot detected — fail silently to avoid revealing the check
            return;
        }

        hideMessages();
        setLoading(true);

        try {
            const formData = new FormData(form);
            formData.append('access_key', ACCESS_KEY);
            formData.append('subject', resolveEmailSubject());
            formData.append('from_name', 'Tejal Desae Website');

            const response = await fetch(ENDPOINT, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                const paymentUrl = resolvePaymentLink();

                // Clear draft and enrolled program from storage
                clearDraft();
                try { sessionStorage.removeItem(PROGRAM_KEY); } catch (e) { /* ignore */ }

                showSuccess(paymentUrl);
                form.reset();

                // Reset to step 1
                currentStep = 0;
                updateUI();

                // Redirect to Razorpay after 3 seconds
                setTimeout(() => {
                    window.location.href = paymentUrl;
                }, 3000);
            } else {
                showError('Something went wrong. Please try again or email hello@tejaldesae.com directly.');
            }
        } catch (error) {
            // Log in dev; suppress details in production to avoid leaking info
            console.error('[Form] Submission error:', error);
            showError('A network error occurred. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showSuccess(paymentUrl) {
        if (!successMsg) return;

        // Sanitize paymentUrl — only allow https:// Razorpay URLs
        const safeUrl = /^https:\/\/rzp\.io\//.test(paymentUrl)
            ? paymentUrl
            : '#';

        successMsg.innerHTML = `
            <div class="success-content">
                <h3>Application Received</h3>
                <p>Redirecting you to secure payment in 3 seconds...</p>
                <a href="${safeUrl}" class="success-fallback">Click here if you aren't redirected automatically &rarr;</a>
            </div>
        `;
        successMsg.classList.add('show');
        successMsg.classList.remove('hidden');
    }

    function showError(message) {
        if (errorMsg) {
            // Sanitize message — do not render HTML from external sources
            errorMsg.textContent = message;
            errorMsg.classList.add('show');
        }
    }

    function hideMessages() {
        successMsg?.classList.remove('show');
        errorMsg?.classList.remove('show');
    }

    function setLoading(isLoading) {
        if (!submitBtn) return;
        submitBtn.disabled = isLoading;
        submitBtn.textContent = isLoading ? 'SENDING...' : 'SUBMIT & PROCEED TO PAYMENT';
    }

    return { init };
})();

export default ContactForm;
