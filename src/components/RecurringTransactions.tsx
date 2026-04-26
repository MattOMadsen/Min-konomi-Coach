// src/components/RecurringTransactions.tsx
import { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import CategoryDetailModal from './CategoryDetailModal';

interface Props {
  transactions: Transaction[];
}

export default function RecurringTransactions({ transactions }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const recurring = useMemo(() => {
    const descriptionCount = new Map<string, { count: number; total: number; lastDate: string }>();

    transactions.forEach(t => {
      if (t.amount >= 0) return;

      const key = t.description.toLowerCase().trim();
      const existing = descriptionCount.get(key);

      if (existing) {
        existing.count++;
        existing.total += Math.abs(t.amount);
        if (t.date > existing.lastDate) existing.lastDate = t.date;
      } else {
        descriptionCount.set(key, {
          count: 1,
          total: Math.abs(t.amount),
          lastDate: t.date
        });
      }
    });

    return Array.from(descriptionCount.entries())
      .filter(([_, data]) => data.count >= 2)
      .map(([description, data]) => ({
        description: description.charAt(0).toUpperCase() + description.slice(1),
        count: data.count,
        avgAmount: Math.round(data.total / data.count),
        lastDate: data.lastDate
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [transactions]);

  if (recurring.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔁</span>
        <div>
          <h3 className="text-2xl font-bold dark:text-white">Faste udgifter</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400">Automatisk genkendt • Klik for detaljer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recurring.map((item, index) => (
          <div 
            key={index} 
            onClick={() => setSelectedCategory(item.description)}
            className="flex justify-between items-center p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-950 transition border border-transparent hover:border-emerald-200"
          >
            <div>
              <div className="font-semibold dark:text-white">{item.description}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">
                {item.count} gange • sidst {item.lastDate}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-lg text-red-600 dark:text-red-400">
                -{item.avgAmount.toLocaleString('da-DK')} kr
              </div>
              <div className="text-xs text-gray-500 dark:text-slate-400">gennemsnit</div>
            </div>
          </div>
        ))}
      </div>

      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          transactions={transactions}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </div>
  );
}