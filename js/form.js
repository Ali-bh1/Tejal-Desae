/**
 * Multi-Step Application Form
 * Handles: step navigation, per-step validation, progress bar, Web3Forms submission
 */

const ContactForm = (() => {
    const ENDPOINT = 'https://api.web3forms.com/submit';

    // Replace with your Web3Forms access key (register at web3forms.com)
    const ACCESS_KEY = '5c1e2ca1-ad51-4e82-9e77-e00ca2ad6fd9';

    // localStorage keys
    const STORAGE_KEY = 'tejal_form_draft';

    // State
    let currentStep = 0;
    const totalSteps = 4;

    // DOM refs
    let form, steps, progressSteps, connectors, backBtn, nextBtn, submitBtn;
    let successMsg, errorMsg;

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
     * Persistence logic
     */
    function saveDraft() {
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            // Don't save honeypot or sensitive temp keys
            if (key !== 'access_key' && key !== '_honeypot') {
                data[key] = value;
            }
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            step: currentStep,
            data: data
        }));
    }

    function loadDraft() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) return;

        try {
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

            // Restore step
            currentStep = step;

            // Sync range display
            const rangeInput = form.querySelector('input[type="range"]');
            const rangeValue = form.querySelector('.range-value');
            if (rangeInput && rangeValue) {
                rangeValue.textContent = rangeInput.value;
            }
        } catch (e) {
            console.error('Failed to load draft:', e);
        }
    }

    function clearDraft() {
        localStorage.removeItem(STORAGE_KEY);
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
                    // Highlight the radio group
                    const group = field.closest('.radio-group');
                    if (group) {
                        group.style.outline = '1px solid #e74c3c';
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
                field.style.borderColor = '#e74c3c';
                isValid = false;
                field.addEventListener('input', () => {
                    field.style.borderColor = '';
                }, { once: true });
            }
        });

        // Validate email
        const emailField = activeStep.querySelector('input[type="email"]');
        if (emailField && emailField.value && !isValidEmail(emailField.value)) {
            emailField.style.borderColor = '#e74c3c';
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
            console.warn('Honeypot triggered');
            return;
        }

        hideMessages();
        setLoading(true);

        try {
            const formData = new FormData(form);
            formData.append('access_key', ACCESS_KEY);
            formData.append('subject', 'New Application — Tejal Desae Website');
            formData.append('from_name', 'Tejal Desae Website');

            const response = await fetch(ENDPOINT, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                clearDraft();
                showSuccess();
                form.reset();
                // Reset to step 1
                currentStep = 0;
                updateUI();

                // Redirect logic
                const stripeUrl = 'https://buy.stripe.com/PAYMENT_LINK_ID'; // USER: Change this
                setTimeout(() => {
                    window.location.href = stripeUrl;
                }, 3000);
            } else {
                showError('Something went wrong. Please try again or email hello@tejaldesae.com directly.');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showSuccess() {
        if (successMsg) {
            const stripeUrl = 'https://buy.stripe.com/PAYMENT_LINK_ID'; // USER: Change this
            successMsg.innerHTML = `
                <div class="success-content">
                    <h3>Application Received</h3>
                    <p>Redirecting you to secure payment in 3 seconds...</p>
                    <a href="${stripeUrl}" class="success-fallback">Click here if you aren't redirected automatically &rarr;</a>
                </div>
            `;
            successMsg.classList.add('show');
            successMsg.classList.remove('hidden');
        }
    }

    function showError(message) {
        if (errorMsg) {
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
