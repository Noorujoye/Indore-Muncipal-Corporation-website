export const VALIDATION_RULES = {
    PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    GSTIN: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MOBILE: /^[6-9]\d{9}$/,
    AADHAAR: /^\d{12}$/,
    PINCODE: /^[1-9][0-9]{5}$/
};

import i18n from 'i18next';

const t = (key, defaultValue) => {
    if (i18n && typeof i18n.t === 'function') {
        return i18n.t(key, { defaultValue });
    }
    return defaultValue;
};

export const validateField = (name, value) => {
    if (name === 'profilePhoto') return "";
    if (!value) return t('validation.required', 'This field is required');

    switch (name) {
        case 'panNumber':
            return VALIDATION_RULES.PAN.test(value)
                ? ""
                : t('validation.invalidPan', 'Invalid PAN format (e.g., ABCDE1234F)');
        case 'gstinNumber':
            return VALIDATION_RULES.GSTIN.test(value)
                ? ""
                : t('validation.invalidGstin', 'Invalid GSTIN format');
        case 'email':
            return VALIDATION_RULES.EMAIL.test(value)
                ? ""
                : t('validation.invalidEmail', 'Invalid email address');
        case 'mobile':
            return VALIDATION_RULES.MOBILE.test(value)
                ? ""
                : t('validation.invalidMobile', 'Invalid mobile number (10 digits starting with 6-9)');
        case 'authorizedPersonAadhaar':
            return VALIDATION_RULES.AADHAAR.test(value)
                ? ""
                : t('validation.invalidAadhaar', 'Invalid Aadhaar (12 digits)');
        case 'bankIfsc':
            return VALIDATION_RULES.IFSC.test(value)
                ? ""
                : t('validation.invalidIfsc', 'Invalid IFSC Code');
        case 'pincode':
            return VALIDATION_RULES.PINCODE.test(value)
                ? ""
                : t('validation.invalidPincode', 'Invalid Pincode');
        case 'bankAccountNumber':
            return /^\d{9,18}$/.test(value)
                ? ""
                : t('validation.invalidAccountNumber', 'Invalid Account Number (9-18 digits)');
        default:
            return "";
    }
};
