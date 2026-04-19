import type { Transaction } from '../types';

export const normalizeDate = (dateRaw: string): string => {
  const clean = String(dateRaw).trim().replace(/-/g, '.');
  const parts = clean.split('.');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(p => p.trim());
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return String(dateRaw).trim();
};

export const normalizeAmount = (amountRaw: string): number => {
  const clean = String(amountRaw)
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/\s/g, '')
    .replace(/[^0-9.-]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
};

export const createTransaction = (dateRaw: string, descRaw: string, amountRaw: string): Transaction | null => {
  const date = normalizeDate(dateRaw);
  const amount = normalizeAmount(amountRaw);
  if (!date || amount === 0) return null;

  return {
    date,
    description: String(descRaw || 'Uden beskrivelse').trim(),
    amount,
  };
};