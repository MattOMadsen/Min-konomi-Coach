import { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction, getCategoryColor } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
  onAskAI?: () => void;
}

export default function BudgetVisualizer({ transactions, onAskAI }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
    <>
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

        <div className="space-y-4">
          {categorySpending.length > 0 ? (
            categorySpending.map(([cat, amount]) => {
              const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
              const color = getCategoryColor(cat);
              
              return (
                <div 
                  key={cat} 
                  onClick={() => setSelectedCategory(cat)}
                  className="group cursor-pointer p-4 bg-gray-50 hover:bg-emerald-50 rounded-2xl transition-all"
                >
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
            })
          ) : (
            <div className="text-center py-12 text-gray-500">Ingen udgifter at vise endnu</div>
          )}
        </div>
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-white font-semibold text-xl">{selectedCategory}</h3>
              <button onClick={() => setSelectedCategory(null)} className="text-white text-3xl leading-none">×</button>
            </div>

            <div className="p-6">
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">Detaljeret visning for {selectedCategory} kommer snart...</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}