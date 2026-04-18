// 1 fil - 1 funktion
// parsers/banks/lunarParser.ts – Dedikeret parser kun til Lunar CSV (header + specifikke kolonner)

import Papa from 'papaparse';
import type { Transaction } from '../csvParser';

export const parseLunarCSV = (csvText: string): Transaction[] => {
  const delimiter = csvText.includes(';') ? ';' : ',';

  let transactions: Transaction[] = [];

  Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = (results?.data as Record<string, any>[]) ?? [];
      transactions = rows
        .map((row) => parseLunarRow(row))
        .filter((t): t is Transaction => t !== null);
    }
  });

  return transactions;
};

// Intern row-parser kun til Lunar-formatet
const parseLunarRow = (row: Record<string, any>): Transaction | null => {
  const dateRaw = row.Dato || row.Bogføringsdato || row.Transaktionsdato || row.Betalingsdato || row.Dato || '';
  const descRaw = row.Tekst || row.Beskrivelse || row.Betalingsmodtager || row.Modtager || row.Notat || '';
  const amountRaw = row.Beløb || row.Amount || row.Belob || row.Sum || row.Beløb || '';

  if (!dateRaw || !amountRaw) return null;

  // Dato
  const cleanDate = String(dateRaw).trim().replace(/-/g, '.');
  const parts = cleanDate.split('.');
  let date = '';
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts.map(p => p.trim());
    date = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  } else {
    date = String(dateRaw).trim();
  }

  // Beløb
  const cleanAmount = String(amountRaw)
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/\s/g, '')
    .replace(/[^0-9.-]/g, '');

  const amount = parseFloat(cleanAmount);
  if (isNaN(amount) || amount === 0) return null;

  return {
    date,
    description: String(descRaw || 'Uden beskrivelse').trim(),
    amount,
  };
};