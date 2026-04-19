// 1 fil - 1 funktion
// parsers/csvWorker.ts – Web Worker der nu bruger den nye modulære bank-detector (én fil pr. bank-type)

import type { Transaction } from './csvParser';
import { detectAndParseCSV } from './bankDetector';

self.onmessage = (e: MessageEvent) => {
  if (!e?.data) {
    self.postMessage({ type: 'error', error: 'Ingen data modtaget i worker' });
    return;
  }

  const { csvText, filename } = e.data;

  if (!csvText) {
    self.postMessage({ type: 'error', error: 'Ingen CSV-tekst modtaget' });
    return;
  }

  self.postMessage({ type: 'progress', progress: 5, status: 'Starter parsing...' });

  try {
    // Bruger nu den nye bankDetector (håndterer Posteringer + alle andre banker automatisk)
    const transactions = detectAndParseCSV(csvText, filename);

    self.postMessage({ type: 'progress', progress: 98, status: 'Færdiggør...' });
    self.postMessage({ type: 'progress', progress: 100, status: 'Færdig!' });
    self.postMessage({ type: 'complete', transactions });
  } catch (err) {
    self.postMessage({ type: 'error', error: (err as Error).message });
  }
};