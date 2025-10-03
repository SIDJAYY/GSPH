// Government Services Management System - Login Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function initializePage() {
    // Add loading animation to buttons
    addLoadingStates();
    
    // Initialize form validation
    initializeFormValidation();
    
    // Add smooth scrolling
    addSmoothScrolling();
}

function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
    
    // Social login buttons (only target real social buttons)
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        button.addEventListener('click', handleSocialLogin);
    });
    
    // Email input validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', clearEmailError);
    }
    
    // Password input validation
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('blur', validatePassword);
        passwordInput.addEventListener('input', clearPasswordError);
    }
    
    // Register toggle
    const showRegister = document.getElementById('showRegister');
    if (showRegister) {
        showRegister.addEventListener('click', showRegisterForm);
    }
    const cancelRegister = document.getElementById('cancelRegister');
    if (cancelRegister) {
        cancelRegister.addEventListener('click', hideRegisterForm);
    }
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegisterSubmit);
    }
    const regPassword = document.getElementById('regPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    if (regPassword) {
        regPassword.addEventListener('input', function(){
            validateRegPassword(this);
            updatePasswordChecklist(this.value);
            const cp = document.getElementById('confirmPassword');
            if (cp && cp.value) { validateConfirmPassword(true); }
        });
        regPassword.addEventListener('blur', function(){
            validateRegPassword(this, true);
            updatePasswordChecklist(this.value);
            const cp = document.getElementById('confirmPassword');
            if (cp && cp.value) { validateConfirmPassword(true); }
        });
    }
    if (confirmPassword) {
        confirmPassword.addEventListener('input', function(){ validateConfirmPassword(true); });
        confirmPassword.addEventListener('blur', function(){ validateConfirmPassword(true); });
    }
    const toggles = document.querySelectorAll('.toggle-password');
    toggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (!input) return;
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            const icon = btn.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            }
        });
    });
    const noMiddleName = document.getElementById('noMiddleName');
    if (noMiddleName) {
        noMiddleName.addEventListener('change', function() {
            const middle = document.getElementById('middleName');
            const asterisk = document.getElementById('middleAsterisk');
            if (!middle) return;
            middle.disabled = this.checked;
            middle.required = !this.checked;
            if (asterisk) {
                asterisk.style.display = this.checked ? 'none' : 'inline';
            }
            if (this.checked) middle.value = '';
        });
    }

    // Terms modal wiring
    const openTerms = document.getElementById('openTerms');
    const footerTerms = document.getElementById('footerTerms');
    const termsModal = document.getElementById('termsModal');
    const closeTerms = document.getElementById('closeTerms');
    const closeTermsBottom = document.getElementById('closeTermsBottom');
    const openPrivacy = document.getElementById('openPrivacy');
    const footerPrivacy = document.getElementById('footerPrivacy');
    const privacyModal = document.getElementById('privacyModal');
    const closePrivacy = document.getElementById('closePrivacy');
    const closePrivacyBottom = document.getElementById('closePrivacyBottom');
    function showTerms() {
        if (!termsModal) return;
        termsModal.classList.remove('hidden');
        termsModal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    }
    function hideTerms() {
        if (!termsModal) return;
        termsModal.classList.add('hidden');
        termsModal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
    if (openTerms) openTerms.addEventListener('click', showTerms);
    if (footerTerms) footerTerms.addEventListener('click', showTerms);
    if (closeTerms) closeTerms.addEventListener('click', hideTerms);
    if (closeTermsBottom) closeTermsBottom.addEventListener('click', hideTerms);
    if (termsModal) {
        termsModal.addEventListener('click', (e) => {
            if (e.target === termsModal) hideTerms();
        });
    }

    function showPrivacy() {
        if (!privacyModal) return;
        privacyModal.classList.remove('hidden');
        privacyModal.classList.add('flex');
        document.body.classList.add('overflow-hidden');
    }
    function hidePrivacy() {
        if (!privacyModal) return;
        privacyModal.classList.add('hidden');
        privacyModal.classList.remove('flex');
        document.body.classList.remove('overflow-hidden');
    }
    if (openPrivacy) openPrivacy.addEventListener('click', showPrivacy);
    if (footerPrivacy) footerPrivacy.addEventListener('click', showPrivacy);
    if (closePrivacy) closePrivacy.addEventListener('click', hidePrivacy);
    if (closePrivacyBottom) closePrivacyBottom.addEventListener('click', hidePrivacy);
    if (privacyModal) {
        privacyModal.addEventListener('click', (e) => {
            if (e.target === privacyModal) hidePrivacy();
        });
    }
}

function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const dateTimeString = now.toLocaleDateString('en-US', options).toUpperCase();
    const dateTimeElement = document.getElementById('currentDateTime');
    
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeString;
    }
}

function addLoadingStates() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.hasAttribute('data-no-loading')) return;
            if (this.type === 'submit' || this.classList.contains('social-btn')) {
                showLoadingState(this);
            }
        });
    });
}

function showLoadingState(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading"></span> Processing...';
    button.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
    }, 2000);
}

function initializeFormValidation() {
    // Add real-time validation
    const inputs = document.querySelectorAll('input[required]');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            validateField(this);
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.name;
    
    // Remove existing error styling
    field.classList.remove('border-red-500', 'ring-red-500');
    field.classList.add('border-gray-300', 'ring-custom-secondary');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    if (fieldName === 'email') {
        validateEmail(field);
    }
}

function validateEmail(input) {
    const email = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        showFieldError(input, 'Please enter a valid email address');
        return false;
    }
    
    clearEmailError(input);
    return true;
}

function clearEmailError(input) {
    input.classList.remove('border-red-500', 'ring-red-500');
    input.classList.add('border-gray-300', 'ring-custom-secondary');
    
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function validatePassword(input) {
    const password = input.value.trim();
    
    if (password && password.length < 6) {
        showFieldError(input, 'Password must be at least 6 characters long');
        return false;
    }
    
    clearPasswordError(input);
    return true;
}

function clearPasswordError(input) {
    input.classList.remove('border-red-500', 'ring-red-500');
    input.classList.add('border-gray-300', 'ring-custom-secondary');
    
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function showFieldError(field, message) {
    field.classList.remove('border-gray-300', 'ring-custom-secondary');
    field.classList.add('border-red-500', 'ring-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message text-red-500 text-sm mt-1';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function handleLoginSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const email = form.email.value.trim();
    const password = form.password.value.trim();
    
    // Validate email
    if (!validateEmail(form.email)) {
        return;
    }
    
    // Validate password
    if (!validatePassword(form.password)) {
        return;
    }
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    showLoadingState(submitButton);
    
    // Simulate successful login and show OTP modal
    showNotification('Login successful! Sending OTP...', 'success');
    openOtpModal();
    // Reset button state
    submitButton.innerHTML = 'Login';
    submitButton.disabled = false;
}

function handleSocialLogin(event) {
    const button = event.target.closest('button');
    const buttonText = button.textContent.trim();
    
    // Show loading state
    showLoadingState(button);
    
    // Simulate social login
    setTimeout(() => {
        console.log('Social login attempt:', buttonText);
        
        // Show appropriate message based on button
        if (buttonText.includes('Google')) {
            showNotification('Google login initiated...', 'info');
        } else if (buttonText.includes('Facebook')) {
            showNotification('Facebook login is currently unavailable. Please use email login.', 'warning');
        } else if (buttonText.includes('Apple')) {
            showNotification('Apple login initiated...', 'info');
        }
        
        // Reset button state
        setTimeout(() => {
            button.innerHTML = button.innerHTML.replace('<span class="loading"></span> Processing...', '');
            button.disabled = false;
        }, 2000);
    }, 1000);
}

function showRegisterForm() {
    const container = document.getElementById('registerFormContainer');
    const mainCard = document.querySelector('.glass-card');
    if (container && mainCard) {
        container.classList.remove('hidden');
        // Optionally dim the main card
        mainCard.classList.add('opacity-40');
    }
}

function hideRegisterForm() {
    const container = document.getElementById('registerFormContainer');
    const mainCard = document.querySelector('.glass-card');
    if (container && mainCard) {
        container.classList.add('hidden');
        mainCard.classList.remove('opacity-40');
    }
}

function handleRegisterSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const data = serializeForm(form);
    if (!validateRegPassword(document.getElementById('regPassword'), true)) return;
    if (!validateConfirmPassword(true)) return;
    // reCAPTCHA v2 validation
    const captchaResponse = window.grecaptcha ? window.grecaptcha.getResponse() : '';
    if (!captchaResponse) {
        showNotification('Please complete the reCAPTCHA.', 'warning');
        return;
    }
    if (!document.getElementById('agreeTerms').checked || !document.getElementById('agreePrivacy').checked) {
        showNotification('You must agree to the Terms and Privacy Policy.', 'warning');
        return;
    }
    if (data.regPassword !== data.confirmPassword) {
        showNotification('Passwords do not match.', 'error');
        return;
    }
    showNotification('Registration submitted!', 'success');
    hideRegisterForm();
}

function validateRegPassword(inputEl, showMessage = false) {
    if (!inputEl) return false;
    const value = inputEl.value || '';
    const isValid = /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value) && /[^A-Za-z0-9]/.test(value) && value.length >= 10;
    // Clear previous message
    const parent = inputEl.parentNode;
    const existing = parent.querySelector('.pwd-error');
    if (existing) existing.remove();
    inputEl.classList.remove('border-red-500', 'ring-red-500');
    if (!isValid && showMessage) {
        inputEl.classList.add('border-red-500', 'ring-red-500');
        // No verbose error text per request; visual cue only
    }
    return isValid;
}

function validateConfirmPassword(showMessage = false) {
    const pwd = document.getElementById('regPassword');
    const confirm = document.getElementById('confirmPassword');
    if (!pwd || !confirm) return false;
    const matches = (confirm.value || '') === (pwd.value || '');
    const wrapper = confirm.parentNode; // .relative wrapper
    // Place error message AFTER the wrapper so absolute eye icon stays aligned
    const existing = wrapper.parentNode.querySelector('.confirm-error');
    if (existing && existing.previousElementSibling !== wrapper) {
        existing.remove();
    }
    confirm.classList.remove('border-red-500', 'ring-red-500');
    if (!matches && showMessage) {
        confirm.classList.add('border-red-500', 'ring-red-500');
        let msg = wrapper.parentNode.querySelector('.confirm-error');
        if (!msg) {
            msg = document.createElement('div');
            msg.className = 'confirm-error text-red-500 text-sm mt-1';
            // insert after wrapper
            if (wrapper.nextSibling) {
                wrapper.parentNode.insertBefore(msg, wrapper.nextSibling);
            } else {
                wrapper.parentNode.appendChild(msg);
            }
        }
        msg.textContent = 'Passwords do not match.';
    }
    return matches;
}

function updatePasswordChecklist(value) {
    const checks = {
        length: value.length >= 10,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[^A-Za-z0-9]/.test(value)
    };
    const list = document.getElementById('pwdChecklist');
    if (!list) return;
    Object.keys(checks).forEach(key => {
        const item = list.querySelector(`.req-item[data-check="${key}"]`);
        if (!item) return;
        if (checks[key]) {
            item.classList.add('met');
        } else {
            item.classList.remove('met');
        }
    });
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    
    // Set notification style based on type
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return 'check-circle';
        case 'error':
            return 'exclamation-circle';
        case 'warning':
            return 'exclamation-triangle';
        default:
            return 'info-circle';
    }
}

function addSmoothScrolling() {
    // Add smooth scrolling to all anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Utility function for form data serialization
function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    return data;
}

// Utility function for API calls
async function makeAPICall(url, data, method = 'POST') {
    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        showNotification('Network error. Please try again.', 'error');
        throw error;
    }
}

// Export functions for use in other scripts
window.GSM = {
    showNotification,
    validateEmail,
    makeAPICall
};

// OTP modal logic
let otpIntervalId = null;
let otpExpiresAt = null;

function openOtpModal() {
    const modal = document.getElementById('otpModal');
    const resend = document.getElementById('resendOtp');
    const error = document.getElementById('otpError');
    const submit = document.getElementById('submitOtp');
    if (!modal) return;
    error.classList.add('hidden');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
    startOtpTimer(180); // 3 minutes
    resend.disabled = true;
    submit.disabled = false;
    const inputs = Array.from(document.querySelectorAll('#otpInputs .otp-input'));
    inputs.forEach(i => i.value = '');
    setupOtpInputs(inputs);
    if (inputs[0]) inputs[0].focus();
}

function closeOtpModal() {
    const modal = document.getElementById('otpModal');
    if (!modal) return;
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
    stopOtpTimer();
}

function startOtpTimer(seconds) {
    otpExpiresAt = Date.now() + seconds * 1000;
    updateOtpTimer();
    if (otpIntervalId) clearInterval(otpIntervalId);
    otpIntervalId = setInterval(updateOtpTimer, 1000);
}

function stopOtpTimer() {
    if (otpIntervalId) clearInterval(otpIntervalId);
    otpIntervalId = null;
}

function updateOtpTimer() {
    const timerEl = document.getElementById('otpTimer');
    const resend = document.getElementById('resendOtp');
    const submit = document.getElementById('submitOtp');
    const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
    const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
    const ss = String(remaining % 60).padStart(2, '0');
    if (timerEl) timerEl.textContent = `${mm}:${ss}`;
    if (remaining === 0) {
        if (resend) resend.disabled = false;
        if (submit) submit.disabled = true;
        stopOtpTimer();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cancelOtp = document.getElementById('cancelOtp');
    const otpForm = document.getElementById('otpForm');
    const resend = document.getElementById('resendOtp');
    const modal = document.getElementById('otpModal');
    if (cancelOtp) cancelOtp.addEventListener('click', closeOtpModal);
    if (resend) resend.addEventListener('click', () => {
        showNotification('A new OTP has been sent to your email.', 'info');
        resend.disabled = true;
        startOtpTimer(180);
    });
    if (otpForm) otpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = collectOtpCode();
        const error = document.getElementById('otpError');
        if (!code || code.length !== 6) {
            error.textContent = 'Please enter the 6-digit OTP.';
            error.classList.remove('hidden');
            return;
        }
        if (document.getElementById('submitOtp').disabled) {
            error.textContent = 'OTP expired. Please resend a new OTP.';
            error.classList.remove('hidden');
            return;
        }
        error.classList.add('hidden');
        showNotification('OTP verified! Redirecting...', 'success');
        setTimeout(() => {
            closeOtpModal();
            window.location.href = 'dashboard.php';
        }, 800);
    });
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeOtpModal();
        });
    }
});

function setupOtpInputs(inputs) {
    inputs.forEach((input, idx) => {
        input.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0,1);
            e.target.value = value;
            if (value && idx < inputs.length - 1) inputs[idx + 1].focus();
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && idx > 0) {
                inputs[idx - 1].focus();
            }
        });
        input.addEventListener('paste', (e) => {
            const text = (e.clipboardData || window.clipboardData).getData('text');
            if (!text) return;
            const digits = text.replace(/\D/g, '').slice(0, inputs.length).split('');
            inputs.forEach((i, iIdx) => { i.value = digits[iIdx] || ''; });
            e.preventDefault();
            const nextIndex = Math.min(digits.length, inputs.length - 1);
            inputs[nextIndex].focus();
        });
    });
}

function collectOtpCode() {
    const inputs = Array.from(document.querySelectorAll('#otpInputs .otp-input'));
    return inputs.map(i => i.value).join('');
}
