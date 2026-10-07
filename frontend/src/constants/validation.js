export const PHONE_REGEX = /^(\+91)?\d{10}$/;
export const PHONE_ERROR = 'Phone must be a 10-digit number, optionally starting with +91';
export const PHONE_HINT = '10 digits, e.g. 98450 11111 or +91 98450 11111';

export const isValidPhone = (value) => PHONE_REGEX.test(value.replace(/[\s-]/g, ''));
