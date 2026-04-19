// 1 fil - 1 funktion
// Sikker og hurtig CSV-parser med simuleret progress (ingen worker-fejl)

import Papa from 'papaparse';

export interface Transaction {
  date: string;
  description: string;
  amount: number;
}

export interface ParseOptions {
  onProgress?: (progress: number, status: string) => void;
}

export const parseBankCSV = async (
  file: File,
  options: ParseOptions = {}
): Promise<Transaction[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      if (!csvText) {
        reject(new Error('Kunne ikke læse filen'));
        return;
      }

      const filename = file.name.toLowerCase();
      const delimiter = csvText.includes(';') ? ';' : ',';

      // Simuleret progress (0 → 100 %)
      let progress = 10;
      const progressInterval = setInterval(() => {
        progress = Math.min(95, progress + Math.random() * 15);
        options.onProgress?.(Math.round(progress), 'Behandler fil...');
      }, 80);

      Papa.parse(csvText, {
        delimiter,
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          clearInterval(progressInterval);
          options.onProgress?.(98, 'Færdiggør...');

          // MINIMAL RETTELSE: beskyt mod undefined results (fejl i csvParser.ts:49)
          let rows = (results?.data as Record<string, any>[]) ?? [];

          // Fallback til no-header hvis det er en Posteringer-fil
          if (rows.length < 8 || filename.includes('posteringer')) {
            Papa.parse(csvText, {
              delimiter,
              header: false,
              skipEmptyLines: true,
              complete: (noHeaderResults) => {
                const rawRows = (noHeaderResults?.data as any[][]) ?? [];
                const parsed = rawRows
                  .slice(1)
                  .map((row) => parseRow(row, true))
                  .filter((t): t is Transaction => t !== null);

                options.onProgress?.(100, 'Færdig!');
                resolve(parsed);
              }
            });
            return;
          }

          // Normal parsing
          const parsed = rows
            .map((row) => parseRow(row, false))
            .filter((t): t is Transaction => t !== null);

          options.onProgress?.(100, 'Færdig!');
          resolve(parsed);
        },
        error: (err) => {
          clearInterval(progressInterval);
          reject(err);
        }
      });
    };

    reader.onerror = () => reject(new Error('Kunne ikke læse filen'));
    reader.readAsText(file, 'utf-8');
  });
};

// Hjælpefunktion til parsing af én række (uændret)
const parseRow = (row: any, isNoHeader: boolean): Transaction | null => {
  let dateRaw: string;
  let descRaw: string;
  let amountRaw: string;

  if (isNoHeader) {
    dateRaw = row[3] || row[0] || '';
    descRaw = row[4] || row[9] || row[1] || '';
    amountRaw = row[5] || row[6] || row[2] || '';
  } else {
    dateRaw = row.Dato || row.Bogføringsdato || row.Posteringsdato || row.Date || '';
    descRaw = row.Tekst || row.Beskrivelse || row.Description || '';
    amountRaw = row.Beløb || row.Amount || '';
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