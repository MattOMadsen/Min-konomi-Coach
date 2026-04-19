import * as XLSX from 'xlsx';
import type { Transaction } from '../types';

export const exportToExcel = (transactions: Transaction[]) => {
  if (transactions.length === 0) return;

  const totalIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const balance = totalIncome - totalExpenses;

  const data = [
    ['Min Økonomi Coach - Rapport'],
    ['Genereret:', new Date().toLocaleDateString('da-DK')],
    [],
    ['Dato', 'Beskrivelse', 'Beløb (kr)', 'Type'],
    ...transactions.map(t => [
      t.date,
      t.description,
      t.amount,
      t.amount >= 0 ? 'Indtægt' : 'Udgift'
    ]),
    [],
    ['Samlet indtægt', totalIncome],
    ['Samlet udgift', totalExpenses],
    ['Saldo', balance],
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  
  ws['!cols'] = [
    { wch: 12 },
    { wch: 45 },
    { wch: 14 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Transaktioner');

  XLSX.writeFile(wb, `min-oekonomi-${new Date().toISOString().split('T')[0]}.xlsx`);
};