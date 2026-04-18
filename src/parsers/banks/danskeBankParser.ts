// 1 fil - 1 funktion
// parsers/banks/danskeBankParser.ts – Dedikeret parser kun til Danske Bank CSV (header + specifikke kolonner)

import Papa from 'papaparse';
import type { Transaction } from '../csvParser';

export const parseDanskeBankCSV = (csvText: string): Transaction[] => {
  const delimiter = csvText.includes(';') ? ';' : ',';

  let transactions: Transaction[] = [];

  Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = (results?.data as Record<string, any>[]) ?? [];
      transactions = rows
        .map((row) => parseDanskeBankRow(row))
        .filter((t): t is Transaction => t !== null);
    }
  });

  return transactions;
};

// Intern row-parser kun til Danske Bank-formatet (dækker både Eksporter og almindelige udtog)
const parseDanskeBankRow = (row: Record<string, any>): Transaction | null => {
  const dateRaw = row.Dato || row.Bogføringsdato || row.Posteringsdato || row.Transaktionsdato || '';
  const descRaw = row.Tekst || row.Beskrivelse || row.Description || '';
  const amountRaw = row.Beløb || row.Amount || row.Belob || row.Sum || '';

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