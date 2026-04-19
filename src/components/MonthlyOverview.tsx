import { useMemo } from 'react';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onMonthClick?: (month: string) => void;
  selectedMonth?: string | null;
}

export default function MonthlyOverview({ transactions, onMonthClick, selectedMonth }: Props) {
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number; count: number }>();

    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);
      if (!map.has(monthKey)) {
        map.set(monthKey, { income: 0, expenses: 0, count: 0 });
      }
      const data = map.get(monthKey)!;
      data.count++;
      if (t.amount > 0) data.income += t.amount;
      else data.expenses += Math.abs(t.amount);
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expenses
      }));
  }, [transactions]);

  if (monthlyData.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <h3 className="text-2xl font-bold mb-6">📅 Månedlig Oversigt + Trend</h3>

      <div className="space-y-4">
        {monthlyData.map(({ month, income, expenses, balance, count }) => (
          <div 
            key={month} 
            onClick={() => onMonthClick?.(month)}
            className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition ${
              selectedMonth === month 
                ? 'bg-emerald-100 dark:bg-emerald-900 border border-emerald-300' 
                : 'bg-gray-50 hover:bg-emerald-50'
            }`}
          >
            <div>
              <div className="font-semibold text-lg">{month}</div>
              <div className="text-sm text-gray-500">{count} transaktioner</div>
            </div>
            
            <div className="flex gap-8 text-sm">
              <div className="text-right">
                <div className="text-emerald-600">Ind</div>
                <div className="font-semibold text-emerald-700">+{income.toLocaleString('da-DK')} kr</div>
              </div>
              <div className="text-right">
                <div className="text-red-600">Ud</div>
                <div className="font-semibold text-red-700">-{expenses.toLocaleString('da-DK')} kr</div>
              </div>
              <div className="text-right border-l pl-8">
                <div className="text-gray-600">Saldo</div>
                <div className={`font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {balance.toLocaleString('da-DK')} kr
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedMonth && (
        <div className="mt-4 text-center">
          <button 
            onClick={() => onMonthClick?.('')}
            className="text-sm text-emerald-600 hover:underline"
          >
            Vis alle måneder
          </button>
        </div>
      )}
    </div>
  );
}