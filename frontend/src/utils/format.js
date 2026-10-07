import { CURRENCY, LOCALE } from '@/constants/app';

const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
const compactCurrencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
});
const numberFormatter = new Intl.NumberFormat(LOCALE);
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' });
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });

export const formatCurrency = (value) => currencyFormatter.format(Number(value ?? 0));
export const formatCompactCurrency = (value) => compactCurrencyFormatter.format(Number(value ?? 0));
export const formatNumber = (value) => numberFormatter.format(Number(value ?? 0));
export const formatDate = (iso) => (iso ? dateFormatter.format(new Date(iso)) : '—');
export const formatDateTime = (iso) => (iso ? dateTimeFormatter.format(new Date(iso)) : '—');
export const formatShortDate = (iso) => (iso ? shortDateFormatter.format(new Date(iso)) : '');
