/**
 * AEROTECH Advanced Form Validation System
 * Provides comprehensive form validation with real-time feedback
 */

class FormValidator {
    constructor() {
        this.forms = new Map();
        this.validators = this.getDefaultValidators();
        this.init();
    }

    init() {
        // Find and initialize all forms with validation
        document.querySelectorAll('[data-validate]').forEach((form) => {
            this.initializeForm(form);
        });
        
        // Setup custom validation patterns
        this.setupCustomPatterns();
    }

    initializeForm(form) {
        const formId = form.id || 'form_' + Date.now();
        form.id = formId;
        
        const formData = {
            element: form,
            fields: new Map(),
            valid: false
        };
        
        // Initialize fields
        form.querySelectorAll('input, textarea, select').forEach((field) => {
            this.initializeField(field, formData);
        });
        
        // Setup form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit(formData);
        });
        
        this.forms.set(formId, formData);
    }

    initializeField(field, formData) {
        const fieldData = {
            element: field,
            rules: this.parseValidationRules(field),
            valid: false,
            touched: false,
            errors: []
        };
        
        formData.fields.set(field.name || field.id, fieldData);
        
        // Setup real-time validation
        field.addEventListener('input', () => {
            fieldData.touched = true;
            this.validateField(fieldData);
            this.updateFieldUI(fieldData);
        });
        
        field.addEventListener('blur', () => {
            fieldData.touched = true;
            this.validateField(fieldData);
            this.updateFieldUI(fieldData);
        });
        
        field.addEventListener('focus', () => {
            this.clearFieldErrors(fieldData);
        });
    }

    parseValidationRules(field) {
        const rules = [];
        
        // Required
        if (field.hasAttribute('required')) {
            rules.push({ type: 'required', message: 'Это поле обязательно для заполнения' });
        }
        
        // Email
        if (field.type === 'email') {
            rules.push({ type: 'email', message: 'Введите корректный email адрес' });
        }
        
        // Phone
        if (field.type === 'tel' || field.hasAttribute('data-phone')) {
            rules.push({ type: 'phone', message: 'Введите корректный номер телефона' });
        }
        
        // Min length
        if (field.hasAttribute('minlength')) {
            const min = parseInt(field.getAttribute('minlength'));
            rules.push({ 
                type: 'minlength', 
                value: min,
                message: `Минимум ${min} символов` 
            });
        }
        
        // Max length
        if (field.hasAttribute('maxlength')) {
            const max = parseInt(field.getAttribute('maxlength'));
            rules.push({ 
                type: 'maxlength', 
                value: max,
                message: `Максимум ${max} символов` 
            });
        }
        
        // Pattern
        if (field.hasAttribute('pattern')) {
            const pattern = field.getAttribute('pattern');
            const message = field.getAttribute('data-pattern-message') || 'Неверный формат';
            rules.push({ 
                type: 'pattern', 
                value: new RegExp(pattern),
                message: message 
            });
        }
        
        // Custom rules from data attributes
        if (field.hasAttribute('data-validate-rules')) {
            try {
                const customRules = JSON.parse(field.getAttribute('data-validate-rules'));
                rules.push(...customRules);
            } catch (e) {
                console.error('[FormValidator] Invalid custom rules:', e);
            }
        }
        
        return rules;
    }

    validateField(fieldData) {
        const { element, rules } = fieldData;
        const value = element.value.trim();
        const errors = [];
        
        for (const rule of rules) {
            const validator = this.validators[rule.type];
            
            if (validator && !validator(value, rule.value, element)) {
                errors.push(rule.message);
            }
        }
        
        fieldData.errors = errors;
        fieldData.valid = errors.length === 0;
        
        return fieldData.valid;
    }

    getDefaultValidators() {
        return {
            required: (value) => value.length > 0,
            
            email: (value) => {
                if (!value) return true; // Skip if empty (required handles this)
                const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return regex.test(value);
            },
            
            phone: (value) => {
                if (!value) return true;
                // Russian phone format
                const regex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/;
                return regex.test(value.replace(/[\s\-\(\)]/g, ''));
            },
            
            minlength: (value, min) => {
                if (!value) return true;
                return value.length >= min;
            },
            
            maxlength: (value, max) => {
                if (!value) return true;
                return value.length <= max;
            },
            
            pattern: (value, pattern) => {
                if (!value) return true;
                return pattern.test(value);
            },
            
            url: (value) => {
                if (!value) return true;
                try {
                    new URL(value);
                    return true;
                } catch {
                    return false;
                }
            },
            
            number: (value) => {
                if (!value) return true;
                return !isNaN(value) && isFinite(value);
            },
            
            integer: (value) => {
                if (!value) return true;
                return Number.isInteger(Number(value));
            },
            
            min: (value, min) => {
                if (!value) return true;
                return Number(value) >= min;
            },
            
            max: (value, max) => {
                if (!value) return true;
                return Number(value) <= max;
            },
            
            match: (value, fieldName, element) => {
                if (!value) return true;
                const matchField = element.form.querySelector(`[name="${fieldName}"]`);
                return matchField && value === matchField.value;
            }
        };
    }

    updateFieldUI(fieldData) {
        const { element, valid, touched, errors } = fieldData;
        
        if (!touched) return;
        
        // Remove previous state
        element.classList.remove('field-valid', 'field-invalid');
        
        // Remove old error messages
        const oldError = element.parentElement.querySelector('.field-error');
        if (oldError) {
            oldError.remove();
        }
        
        if (valid) {
            element.classList.add('field-valid');
        } else if (errors.length > 0) {
            element.classList.add('field-invalid');
            
            // Show first error
            const errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            errorEl.textContent = errors[0];
            element.parentElement.appendChild(errorEl);
        }
    }

    clearFieldErrors(fieldData) {
        const { element } = fieldData;
        
        // Remove error class but keep valid state
        element.classList.remove('field-invalid');
        
        // Remove error message
        const errorEl = element.parentElement.querySelector('.field-error');
        if (errorEl) {
            errorEl.remove();
        }
    }

    validateForm(formData) {
        let allValid = true;
        
        formData.fields.forEach((fieldData) => {
            fieldData.touched = true;
            const valid = this.validateField(fieldData);
            this.updateFieldUI(fieldData);
            
            if (!valid) {
                allValid = false;
            }
        });
        
        formData.valid = allValid;
        return allValid;
    }

    async handleSubmit(formData) {
        const { element } = formData;
        
        // Validate all fields
        if (!this.validateForm(formData)) {
            // Scroll to first error
            const firstError = element.querySelector('.field-invalid');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            
            // Track validation error
            if (window.AerotechAnalytics) {
                window.AerotechAnalytics.track('form_validation_failed', {
                    formId: element.id
                });
            }
            
            return;
        }
        
        // Get form data
        const data = this.getFormData(formData);
        
        // Track submission
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('form_submitted', {
                formId: element.id,
                fields: Object.keys(data)
            });
        }
        
        // Show loading state
        this.setFormLoading(element, true);
        
        try {
            // Submit form
            const success = await this.submitForm(element, data);
            
            if (success) {
                this.showFormSuccess(element);
                element.reset();
                
                // Reset field states
                formData.fields.forEach((fieldData) => {
                    fieldData.touched = false;
                    fieldData.valid = false;
                    fieldData.errors = [];
                    fieldData.element.classList.remove('field-valid', 'field-invalid');
                });
            } else {
                this.showFormError(element, 'Произошла ошибка при отправке формы');
            }
        } catch (error) {
            console.error('[FormValidator] Submit error:', error);
            this.showFormError(element, 'Произошла ошибка при отправке формы');
        } finally {
            this.setFormLoading(element, false);
        }
    }

    getFormData(formData) {
        const data = {};
        
        formData.fields.forEach((fieldData, name) => {
            data[name] = fieldData.element.value;
        });
        
        return data;
    }

    async submitForm(form, data) {
        const endpoint = form.getAttribute('action');
        
        if (endpoint) {
            // Submit to endpoint
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            return response.ok;
        } else {
            // Simulate submission
            await new Promise(resolve => setTimeout(resolve, 1500));
            return true;
        }
    }

    setFormLoading(form, loading) {
        const submitBtn = form.querySelector('[type="submit"]');
        
        if (loading) {
            form.classList.add('form-loading');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.dataset.originalText = submitBtn.textContent;
                submitBtn.textContent = 'Отправка...';
            }
        } else {
            form.classList.remove('form-loading');
            if (submitBtn) {
                submitBtn.disabled = false;
                if (submitBtn.dataset.originalText) {
                    submitBtn.textContent = submitBtn.dataset.originalText;
                }
            }
        }
    }

    showFormSuccess(form) {
        let message = form.querySelector('.form-message');
        
        if (!message) {
            message = document.createElement('div');
            message.className = 'form-message';
            form.appendChild(message);
        }
        
        message.textContent = 'Форма успешно отправлена!';
        message.className = 'form-message form-success';
        
        setTimeout(() => {
            message.className = 'form-message';
        }, 5000);
    }

    showFormError(form, errorText) {
        let message = form.querySelector('.form-message');
        
        if (!message) {
            message = document.createElement('div');
            message.className = 'form-message';
            form.appendChild(message);
        }
        
        message.textContent = errorText;
        message.className = 'form-message form-error';
        
        setTimeout(() => {
            message.className = 'form-message';
        }, 5000);
    }

    setupCustomPatterns() {
        // Russian phone number formatter
        document.querySelectorAll('input[type="tel"], input[data-phone]').forEach((input) => {
            input.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 0) {
                    if (value[0] === '8') {
                        value = '7' + value.slice(1);
                    }
                    
                    if (value[0] === '7') {
                        value = '+7 (' + value.slice(1);
                    }
                    
                    if (value.length > 6) {
                        value = value.slice(0, 6) + ') ' + value.slice(6);
                    }
                    
                    if (value.length > 11) {
                        value = value.slice(0, 11) + '-' + value.slice(11);
                    }
                    
                    if (value.length > 14) {
                        value = value.slice(0, 14) + '-' + value.slice(14, 16);
                    }
                }
                
                e.target.value = value;
            });
        });
    }

    // Public API
    validate(formId) {
        const formData = this.forms.get(formId);
        if (formData) {
            return this.validateForm(formData);
        }
        return false;
    }

    reset(formId) {
        const formData = this.forms.get(formId);
        if (formData) {
            formData.element.reset();
            formData.fields.forEach((fieldData) => {
                fieldData.touched = false;
                fieldData.valid = false;
                fieldData.errors = [];
                this.clearFieldErrors(fieldData);
            });
        }
    }

    addCustomValidator(name, validator) {
        this.validators[name] = validator;
    }
}

// Initialize form validator
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechFormValidator = new FormValidator();
});

// Add form validation styles
const formStyles = document.createElement('style');
formStyles.textContent = `
    .field-valid {
        border-color: #00c851 !important;
    }
    
    .field-invalid {
        border-color: #ff4444 !important;
    }
    
    .field-error {
        display: block;
        margin-top: 4px;
        font-size: 12px;
        color: #ff4444;
        animation: errorSlide 0.3s ease-out;
    }
    
    @keyframes errorSlide {
        from {
            opacity: 0;
            transform: translateY(-4px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .form-message {
        display: none;
        padding: 12px 16px;
        border-radius: 6px;
        margin-top: 16px;
        font-size: 14px;
    }
    
    .form-success {
        display: block;
        background: rgba(0, 200, 81, 0.1);
        border: 1px solid #00c851;
        color: #00c851;
    }
    
    .form-error {
        display: block;
        background: rgba(255, 68, 68, 0.1);
        border: 1px solid #ff4444;
        color: #ff4444;
    }
    
    .form-loading {
        opacity: 0.7;
        pointer-events: none;
    }
`;
document.head.appendChild(formStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormValidator;
}
