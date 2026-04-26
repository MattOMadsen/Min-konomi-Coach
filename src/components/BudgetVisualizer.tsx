// src/components/BudgetVisualizer.tsx
import { useMemo, useState } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction, getCategoryColor } from '../utils/categorize';
import CategoryDetailModal from './CategoryDetailModal';

interface Props {
  transactions: Transaction[];
  onAskAI?: () => void;
}

export default function BudgetVisualizer({ transactions, onAskAI }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'pie'>('list');

  const { categorySpending, totalExpenses, totalIncome } = useMemo(() => {
    const map = new Map<string, number>();
    
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const category = categorizeTransaction(t.description);
      map.set(category, (map.get(category) || 0) + Math.abs(t.amount));
    });

    const spending = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const totalExp = spending.reduce((sum, [, amt]) => sum + amt, 0);
    const totalInc = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);

    return { categorySpending: spending, totalExpenses: totalExp, totalIncome: totalInc };
  }, [transactions]);

  const balance = totalIncome - totalExpenses;

  // Pie chart data
  const pieData = categorySpending.map(([cat, amount], index) => ({
    category: cat,
    amount,
    percent: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
    color: getCategoryColor(cat),
  }));

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold dark:text-white">📊 Budget & Udgifter</h2>
          
          <div className="flex items-center gap-4">
            {/* View toggle */}
            <div className="flex bg-gray-100 dark:bg-slate-800 rounded-2xl p-1">
              <button 
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 text-sm rounded-xl transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
              >
                Liste
              </button>
              <button 
                onClick={() => setViewMode('pie')}
                className={`px-4 py-1.5 text-sm rounded-xl transition ${viewMode === 'pie' ? 'bg-white dark:bg-slate-700 shadow' : ''}`}
              >
                Pie Chart
              </button>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-slate-400">Saldo</div>
              <div className={`text-4xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {balance.toLocaleString('da-DK')} kr
              </div>
            </div>
          </div>
        </div>

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {categorySpending.length > 0 ? (
              categorySpending.map(([cat, amount]) => {
                const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
                const color = getCategoryColor(cat);
                
                return (
                  <div 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className="group cursor-pointer p-4 bg-gray-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950 rounded-2xl transition-all border border-transparent hover:border-emerald-200"
                  >
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                        {cat}
                      </span>
                      <span className="font-semibold">{amount.toLocaleString('da-DK')} kr</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-2.5 rounded-full transition-all group-hover:brightness-110" style={{ width: `${percent}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-gray-500 dark:text-slate-400">Ingen udgifter at vise endnu</div>
            )}
          </div>
        )}

        {/* PIE CHART VIEW */}
        {viewMode === 'pie' && pieData.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-8 items-center justify-center py-4">
            <div className="relative w-80 h-80">
              <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
                {pieData.map((item, index) => {
                  const startAngle = pieData.slice(0, index).reduce((sum, d) => sum + d.percent * 3.6, 0);
                  const endAngle = startAngle + item.percent * 3.6;
                  
                  const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const largeArc = item.percent > 50 ? 1 : 0;
                  
                  const pathData = [
                    `M 100 100`,
                    `L ${x1} ${y1}`,
                    `A 80 80 0 ${largeArc} 1 ${x2} ${y2}`,
                    `Z`
                  ].join(' ');

                  return (
                    <path 
                      key={index}
                      d={pathData}
                      fill={item.color}
                      stroke="#fff"
                      strokeWidth="2"
                      className="cursor-pointer hover:brightness-110 transition-all"
                      onClick={() => setSelectedCategory(item.category)}
                    />
                  );
                })}
              </svg>
              
              {/* Center circle (donut) */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold dark:text-white">{totalExpenses.toLocaleString('da-DK')}</div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">kr i alt</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="space-y-3 min-w-[220px]">
              {pieData.map((item, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedCategory(item.category)}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 p-2 rounded-xl transition"
                >
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <div className="flex-1">
                    <div className="font-medium dark:text-white">{item.category}</div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">{item.percent}%</div>
                  </div>
                  <div className="font-semibold dark:text-white">{item.amount.toLocaleString('da-DK')} kr</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Category Detail Modal */}
      {selectedCategory && (
        <CategoryDetailModal
          category={selectedCategory}
          transactions={transactions}
          onClose={() => setSelectedCategory(null)}
          title={selectedCategory}
        />
      )}
    </>
  );
}