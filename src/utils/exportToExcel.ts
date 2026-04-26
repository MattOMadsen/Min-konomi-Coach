// src/utils/exportToExcel.ts
import * as XLSX from 'xlsx';
import type { Transaction } from '../types';
import { categorizeTransaction } from './categorize';

export const exportToExcel = (transactions: Transaction[]) => {
  if (transactions.length === 0) return;

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const balance = totalIncome - totalExpenses;

  // Top kategorier
  const categoryMap = new Map<string, number>();
  transactions.forEach(t => {
    if (t.amount >= 0) return;
    const cat = categorizeTransaction(t.description);
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
  });
  const topCategories = Array.from(categoryMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Sheet 1: Oversigt
  const summaryData = [
    ['Min Økonomi Coach - Rapport'],
    ['Genereret:', new Date().toLocaleDateString('da-DK', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    })],
    [],
    ['ØKONOMISK OVERSIGT'],
    ['Samlet indtægt', totalIncome],
    ['Samlet udgift', totalExpenses],
    ['Saldo', balance],
    [],
    ['TOP 8 UDGIFTSKATEGORIER'],
    ...topCategories.map(([cat, amount]) => [cat, amount]),
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  wsSummary['!cols'] = [{ wch: 25 }, { wch: 18 }];

  // Sheet 2: Alle transaktioner
  const transData = [
    ['Dato', 'Beskrivelse', 'Beløb (kr)', 'Type', 'Kategori'],
    ...transactions.map(t => [
      t.date,
      t.description,
      t.amount,
      t.amount >= 0 ? 'Indtægt' : 'Udgift',
      categorizeTransaction(t.description)
    ]),
  ];

  const wsTransactions = XLSX.utils.aoa_to_sheet(transData);
  wsTransactions['!cols'] = [
    { wch: 12 },
    { wch: 50 },
    { wch: 14 },
    { wch: 12 },
    { wch: 18 },
  ];

  // Opret workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Oversigt');
  XLSX.utils.book_append_sheet(wb, wsTransactions, 'Transaktioner');

  // Gem fil
  XLSX.writeFile(wb, `min-oekonomi-${new Date().toISOString().split('T')[0]}.xlsx`);
};