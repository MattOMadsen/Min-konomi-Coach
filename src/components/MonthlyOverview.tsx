// src/components/MonthlyOverview.tsx
import { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';
import CategoryDetailModal from './CategoryDetailModal';

interface Props {
  transactions: Transaction[];
}

export default function MonthlyOverview({ transactions }: Props) {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number; count: number; categories: Map<string, number> }>();

    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);
      if (!map.has(monthKey)) {
        map.set(monthKey, { income: 0, expenses: 0, count: 0, categories: new Map() });
      }
      const data = map.get(monthKey)!;
      data.count++;
      if (t.amount > 0) data.income += t.amount;
      else data.expenses += Math.abs(t.amount);

      // Kategorier pr. måned
      const cat = categorizeTransaction(t.description);
      const currentCatTotal = data.categories.get(cat) || 0;
      data.categories.set(cat, currentCatTotal + Math.abs(t.amount));
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expenses,
        topCategories: Array.from(data.categories.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
      }));
  }, [transactions]);

  if (monthlyData.length === 0) return null;

  const selectedMonthData = selectedMonth 
    ? monthlyData.find(m => m.month === selectedMonth) 
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
      <h3 className="text-2xl font-bold mb-6 dark:text-white">📅 Månedlig Oversigt + Trend</h3>

      <div className="space-y-4">
        {monthlyData.map(({ month, income, expenses, balance, count, topCategories }) => (
          <div 
            key={month} 
            onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
            className={`p-5 rounded-2xl cursor-pointer transition-all border ${
              selectedMonth === month 
                ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700' 
                : 'bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 border-transparent'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-semibold text-xl dark:text-white">{month}</div>
                <div className="text-sm text-gray-500 dark:text-slate-400">{count} transaktioner</div>
              </div>
              <div className={`font-bold text-lg ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {balance >= 0 ? '+' : ''}{balance.toLocaleString('da-DK')} kr
              </div>
            </div>

            <div className="flex gap-6 text-sm">
              <div><span className="text-emerald-600">Ind: </span><span className="font-semibold">+{income.toLocaleString('da-DK')} kr</span></div>
              <div><span className="text-red-600">Ud: </span><span className="font-semibold">-{expenses.toLocaleString('da-DK')} kr</span></div>
            </div>

            {/* Top kategorier når måneden er valgt */}
            {selectedMonth === month && topCategories.length > 0 && (
              <div className="mt-4 pt-4 border-t dark:border-slate-700">
                <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-2">Største kategorier denne måned</div>
                <div className="flex flex-wrap gap-2">
                  {topCategories.map(([cat, amount]) => (
                    <div 
                      key={cat}
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); }}
                      className="px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-sm border border-gray-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer transition"
                    >
                      {cat}: {amount.toLocaleString('da-DK')} kr
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}