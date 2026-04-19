import Papa from 'papaparse';
import type { Transaction } from '../../types';
import { createTransaction } from '../utils';

export const parseAlmindeligEksporter = (csvText: string): Transaction[] => {
  const delimiter = csvText.includes(';') ? ';' : ',';
  let transactions: Transaction[] = [];

  Papa.parse(csvText, {
    delimiter,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = (results?.data as Record<string, any>[]) ?? [];
      transactions = rows
        .map(row => createTransaction(
          row.Dato || row.Bogføringsdato || row.Posteringsdato || '',
          row.Tekst || row.Beskrivelse || '',
          row.Beløb || row.Amount || ''
        ))
        .filter((t): t is Transaction => t !== null);
    }
  });

  if (transactions.length < 5) {
    Papa.parse(csvText, {
      delimiter,
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        const rawRows = (results?.data as any[][]) ?? [];
        transactions = rawRows
          .slice(1)
          .map(row => createTransaction(row[3] || row[0], row[4] || row[9] || row[1], row[5] || row[6] || row[2]))
          .filter((t): t is Transaction => t !== null);
      }
    });
  }

  return transactions;
};