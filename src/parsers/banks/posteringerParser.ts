// 1 fil - 1 funktion
// parsers/banks/posteringerParser.ts – Dedikeret parser kun til Posteringer CSV (ingen header, ; delimiter)

import Papa from 'papaparse';
import type { Transaction } from '../csvParser';

export const parsePosteringerCSV = (csvText: string): Transaction[] => {
  const delimiter = csvText.includes(';') ? ';' : ',';

  let transactions: Transaction[] = [];

  Papa.parse(csvText, {
    delimiter,
    header: false,
    skipEmptyLines: true,
    complete: (results) => {
      const rawRows = (results?.data as any[][]) ?? [];
      transactions = rawRows
        .slice(1) // skip header
        .map((row) => parsePosteringerRow(row))
        .filter((t): t is Transaction => t !== null);
    }
  });

  return transactions;
};

// Intern row-parser kun til Posteringer-formatet
const parsePosteringerRow = (row: any[]): Transaction | null => {
  const dateRaw = row[3] || row[0] || '';
  const descRaw = row[4] || row[9] || row[1] || '';
  const amountRaw = row[5] || row[6] || row[2] || '';

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