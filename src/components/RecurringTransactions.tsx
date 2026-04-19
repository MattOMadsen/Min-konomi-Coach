import { useMemo } from 'react';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onRecurringClick?: (description: string) => void;
  selectedRecurring?: string | null;
}

export default function RecurringTransactions({ 
  transactions, 
  onRecurringClick, 
  selectedRecurring 
}: Props) {
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
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">🔄</span>
        <div>
          <h3 className="text-2xl font-bold">Faste udgifter</h3>
          <p className="text-sm text-gray-500">Automatisk genkendt • Klik for at se detaljer</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recurring.map((item, index) => {
          const isSelected = selectedRecurring === item.description.toLowerCase();
          
          return (
            <div 
              key={index} 
              onClick={() => onRecurringClick?.(item.description.toLowerCase())}
              className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer transition ${
                isSelected 
                  ? 'bg-emerald-100 dark:bg-emerald-900 border border-emerald-300' 
                  : 'bg-gray-50 hover:bg-emerald-50'
              }`}
            >
              <div>
                <div className="font-semibold">{item.description}</div>
                <div className="text-sm text-gray-500">
                  {item.count} gange • sidst {item.lastDate}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-red-600">
                  -{item.avgAmount.toLocaleString('da-DK')} kr
                </div>
                <div className="text-xs text-gray-500">gennemsnit</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}