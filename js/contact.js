/* =========================================================
   ChaloChale - contact.js
   Contact Page-specific functionality.
   Frontend-only form validation and success feedback.
   ========================================================= */

(() => {
    "use strict";

    // ---------- DOM References ----------
    const dom = {};
    let lastFocusedElement = null;

    // Field configuration: maps each field to its error element + validation rule
    const FIELD_CONFIG = {
        name: {
            field: null,
            error: null,
            required: true,
            validate(value) {
                const v = value.trim();
                if (!v) return "Please enter your name.";
                if (v.length < 2) return "Please enter at least 2 characters for your name.";
                return "";
            }
        },
        email: {
            field: null,
            error: null,
            required: true,
            validate(value) {
                const v = value.trim();
                if (!v) return "Please enter a valid email address.";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                    return "Please enter a valid email address.";
                }
                return "";
            }
        },
        phone: {
            field: null,
            error: null,
            required: false,
            validate(value) {
                const v = value.trim();
                if (!v) return ""; // optional, empty is valid
                if (!/^[+\d\s\-()]{7,20}$/.test(v)) {
                    return "Please enter a valid phone number.";
                }
                return "";
            }
        },
        subject: {
            field: null,
            error: null,
            required: true,
            validate(value) {
                if (!value) return "Please choose a subject.";
                return "";
            }
        },
        message: {
            field: null,
            error: null,
            required: true,
            validate(value) {
                const v = value.trim();
                if (!v) return "Please enter your message (minimum 10 characters).";
                if (v.length < 10) return "Please enter your message (minimum 10 characters).";
                return "";
            }
        }
    };

    // ---------- Helpers ----------

    const escapeHTML = (str = "") =>
        String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");

    const cacheDom = () => {
        dom.form = document.getElementById("contact-form");
        dom.status = document.getElementById("form-status");

        Object.keys(FIELD_CONFIG).forEach((key) => {
            FIELD_CONFIG[key].field = document.getElementById(`contact-${key}`);
            FIELD_CONFIG[key].error = document.getElementById(`contact-${key}-error`);
        });
    };

    // ---------- Field Error UI ----------

    const showFieldError = (config, message) => {
        if (!config.field || !config.error) return;
        config.error.textContent = message;
        config.error.hidden = false;
        config.field.classList.add("field-invalid");
        config.field.setAttribute("aria-invalid", "true");
    };

    const clearFieldError = (config) => {
        if (!config.field || !config.error) return;
        config.error.textContent = "";
        config.error.hidden = true;
        config.field.classList.remove("field-invalid");
        config.field.setAttribute("aria-invalid", "false");
    };

    const clearAllFieldErrors = () => {
        Object.values(FIELD_CONFIG).forEach(clearFieldError);
    };

    // ---------- Form Status UI ----------

    const showFormStatus = (message, type = "") => {
        if (!dom.status) return;
        dom.status.textContent = message;
        dom.status.classList.remove("success", "error");
        if (type) dom.status.classList.add(type);

        // Make it programmatically focusable for screen reader announcement
        if (!dom.status.hasAttribute("tabindex")) {
            dom.status.setAttribute("tabindex", "-1");
        }
        dom.status.focus();
    };

    const clearFormStatus = () => {
        if (!dom.status) return;
        dom.status.textContent = "";
        dom.status.classList.remove("success", "error");
    };

    // ---------- Validation ----------

    const validateField = (key) => {
        const config = FIELD_CONFIG[key];
        if (!config || !config.field) return true;
        const message = config.validate(config.field.value);
        if (message) {
            showFieldError(config, message);
            return false;
        }
        clearFieldError(config);
        return true;
    };

    const validateForm = () => {
        let firstInvalidKey = null;
        const keys = Object.keys(FIELD_CONFIG);
        for (const key of keys) {
            const ok = validateField(key);
            if (!ok && firstInvalidKey === null) {
                firstInvalidKey = key;
            }
        }
        return { ok: firstInvalidKey === null, firstInvalidKey };
    };

    // ---------- Live Re-validation on User Interaction ----------

    const setupLiveValidation = () => {
        Object.keys(FIELD_CONFIG).forEach((key) => {
            const config = FIELD_CONFIG[key];
            if (!config.field) return;

            // Validate on blur (when user leaves the field)
            config.field.addEventListener("blur", () => {
                if (config.field.value !== "" || config.required) {
                    validateField(key);
                }
            });

            // Clear errors as the user starts correcting
            const clearOnInput = () => {
                if (config.field.classList.contains("field-invalid")) {
                    clearFieldError(config);
                }
            };

            if (config.field.tagName === "SELECT") {
                config.field.addEventListener("change", clearOnInput);
            } else {
                config.field.addEventListener("input", clearOnInput);
            }
        });
    };

    // ---------- Submit Handler ----------

    const handleSubmit = (event) => {
        event.preventDefault();

        const { ok, firstInvalidKey } = validateForm();

        if (!ok) {
            showFormStatus("Please correct the highlighted fields and try again.", "error");
            // Focus first invalid field
            const firstInvalid = FIELD_CONFIG[firstInvalidKey];
            if (firstInvalid && firstInvalid.field) {
                firstInvalid.field.focus();
            }
            return;
        }

        // Frontend-only success: no actual submission
        const name = FIELD_CONFIG.name.field.value.trim();
        const safeName = escapeHTML(name);
        const message = `Thank you, ${safeName}! Your message has been received.`;

        showFormStatus(message, "success");
        resetValidationState();
        if (dom.form) dom.form.reset();
    };

    // ---------- Reset ----------

    const resetValidationState = () => {
        clearAllFieldErrors();
        // Keep status visible — it's the success message
    };

    // ---------- Init ----------

    const initContactPage = () => {
        cacheDom();

        if (!dom.form) return;

        lastFocusedElement = document.activeElement;

        dom.form.addEventListener("submit", handleSubmit);
        setupLiveValidation();
    };

    // Register with main.js
    if (typeof window.ChaloChaleRegister === "function") {
        window.ChaloChaleRegister("contact", initContactPage);
    }
})();