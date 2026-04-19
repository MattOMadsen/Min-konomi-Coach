import { useMemo } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction, getCategoryColor } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
  onCategoryClick?: (category: string) => void;
  onAskAI?: () => void;
}

export default function BudgetVisualizer({ transactions, onCategoryClick, onAskAI }: Props) {
  const { categorySpending, totalExpenses, totalIncome } = useMemo(() => {
    const map = new Map<string, number>();
    
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const category = categorizeTransaction(t.description);
      map.set(category, (map.get(category) || 0) + Math.abs(t.amount));
    });

    const spending = Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const totalExp = spending.reduce((sum, [, amt]) => sum + amt, 0);
    const totalInc = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    return { categorySpending: spending, totalExpenses: totalExp, totalIncome: totalInc };
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">📊 Budget & Udgifter</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">Saldo</div>
          <div className={`text-4xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {balance.toLocaleString('da-DK')} kr
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-emerald-600 text-sm font-medium">Indtægter</div>
          <div className="text-2xl font-bold text-emerald-700">+{totalIncome.toLocaleString('da-DK')} kr</div>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <div className="text-red-600 text-sm font-medium">Udgifter</div>
          <div className="text-2xl font-bold text-red-700">-{totalExpenses.toLocaleString('da-DK')} kr</div>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 text-center">
          <div className="text-gray-600 text-sm font-medium">Gns. pr. måned</div>
          <div className="text-2xl font-bold text-gray-900">-{Math.round(totalExpenses / 3).toLocaleString('da-DK')} kr</div>
        </div>
      </div>

      <div className="space-y-4">
        {categorySpending.map(([cat, amount]) => {
          const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
          const color = getCategoryColor(cat);
          
          return (
            <div key={cat} onClick={() => onCategoryClick?.(cat)} className="group cursor-pointer">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="font-medium flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  {cat}
                </span>
                <span className="font-semibold">{amount.toLocaleString('da-DK')} kr</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2.5 rounded-full transition-all group-hover:brightness-110" style={{ width: `${percent}%`, backgroundColor: color }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}