// 1 fil - 1 funktion
// Tidsbaseret udgiftsanalyse – måned for måned

import type { Transaction } from '../../parsers/csvParser';

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

export const analyzeTimeData = (transactions: Transaction[]): string => {
  const monthlyData = new Map<string, { income: number; expenses: number; count: number }>();

  transactions.forEach(t => {
    const monthKey = t.date.substring(0, 7); // "2026-04"

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { income: 0, expenses: 0, count: 0 });
    }

    const data = monthlyData.get(monthKey)!;
    data.count++;

    if (t.amount > 0) {
      data.income += t.amount;
    } else {
      data.expenses += Math.abs(t.amount);
    }
  });

  if (monthlyData.size === 0) {
    return "Ingen transaktioner fundet til tidsanalyse.";
  }

  let response = `**Tidsbaseret udgiftsanalyse**\n\n`;

  // Sortér månederne kronologisk
  const sortedMonths = Array.from(monthlyData.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  sortedMonths.forEach(([monthKey, data]) => {
    const monthName = 
      monthKey === '2026-04' ? 'April 2026' :
      monthKey === '2026-05' ? 'Maj 2026' : 'Juni 2026';

    response += `${monthName}:\n`;
    response += `   Indtægter: ${formatAmount(data.income)} kr\n`;
    response += `   Udgifter:  ${formatAmount(data.expenses)} kr\n`;
    response += `   Transaktioner: ${data.count} stk.\n\n`;
  });

  // Samlet over 3 måneder
  const totalIncome = sortedMonths.reduce((sum, [, data]) => sum + data.income, 0);
  const totalExpenses = sortedMonths.reduce((sum, [, data]) => sum + data.expenses, 0);
  const totalBalance = totalIncome - totalExpenses;

  response += `**Samlet over 3 måneder:**\n`;
  response += `Indtægter: ${formatAmount(totalIncome)} kr\n`;
  response += `Udgifter:  ${formatAmount(totalExpenses)} kr\n`;
  response += `Netto:     ${formatAmount(totalBalance)} kr\n`;

  return response;
};