import { useState } from 'react';
import type { Transaction } from '../types';
import { detectAndParseCSV } from '../parsers/bankDetector';

export const useFileUpload = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const processFiles = async (files: File[]) => {
    setSelectedFiles(files);
    setTransactions([]);
    setIsLoading(true);
    setProgress(0);
    setStatus(`Behandler ${files.length} fil(er)...`);

    const allTransactions: Transaction[] = [];

    const promises = files.map(async (file, index) => {
      return new Promise<Transaction[]>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvText = e.target?.result as string;
          if (!csvText) return reject(new Error('Kunne ikke læse fil'));

          try {
            const parsed = detectAndParseCSV(csvText, file.name);
            setProgress(Math.round(((index + 1) / files.length) * 100));
            resolve(parsed);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error('Læsefejl'));
        reader.readAsText(file, 'utf-8');
      });
    });

    try {
      const results = await Promise.all(promises);
      results.forEach(parsed => allTransactions.push(...parsed));
      setTransactions(allTransactions);
      setStatus(`✅ ${allTransactions.length} transaktioner fra ${files.length} fil(er)`);
    } catch (err: any) {
      setStatus(`❌ Fejl: ${err.message}`);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    processFiles(Array.from(files));
  };

  return {
    transactions,
    isLoading,
    progress,
    status,
    selectedFiles,
    handleFileSelect,
    setTransactions,
  };
};