// 1 fil - 1 funktion
// parsers/banks/almindeligEksporterParser.ts – Dedikeret parser til almindelige / standard CSV-eksporter (header + fallback)

import Papa from 'papaparse';
import type { Transaction } from '../csvParser';

export const parseAlmindeligEksporterCSV = (csvText: string): Transaction[] => {
  const delimiter = csvText.includes(';') ? ';' : ',';

  let transactions: Transaction[] = [];

  // Først prøv med header (de fleste standard eksporter)
  Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = (results?.data as Record<string, any>[]) ?? [];
      transactions = rows
        .map((row) => parseAlmindeligRow(row, false))
        .filter((t): t is Transaction => t !== null);
    }
  });

  // Hvis for få rækker → automatisk fallback til no-header (dækker alle generiske filer)
  if (transactions.length < 5) {
    Papa.parse(csvText, {
      delimiter,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = (results?.data as any[][]) ?? [];
        transactions = rawRows
          .slice(1)
          .map((row) => parseAlmindeligRow(row, true))
          .filter((t): t is Transaction => t !== null);
      }
    });
  }

  return transactions;
};

// Intern row-parser kun til almindelige/standard eksporter
const parseAlmindeligRow = (row: any, isNoHeader: boolean): Transaction | null => {
  let dateRaw: string;
  let descRaw: string;
  let amountRaw: string;

  if (isNoHeader) {
    dateRaw = row[3] || row[0] || '';
    descRaw = row[4] || row[9] || row[1] || '';
    amountRaw = row[5] || row[6] || row[2] || '';
  } else {
    dateRaw = row.Dato || row.Bogføringsdato || row.Posteringsdato || row.Date || row.Transaktionsdato || row.Betalingsdato || '';
    descRaw = row.Tekst || row.Beskrivelse || row.Description || '';
    amountRaw = row.Beløb || row.Amount || row.Belob || row.Sum || '';
  }

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