// 1 fil - 1 funktion
// Simpel og ren wrapper der bruger den nye robuste csvParser

import { parseBankCSV, type Transaction } from '../parsers/csvParser';

export const parseBankFile = async (file: File): Promise<Transaction[]> => {
  try {
    return await parseBankCSV(file);
  } catch (error) {
    console.error('Fejl ved parsing af bankfil:', error);
    throw new Error('Kunne ikke læse bankfilen. Prøv en anden CSV-fil.');
  }
};