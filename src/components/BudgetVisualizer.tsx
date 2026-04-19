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

  // Beregn vinkler til pie chart
  const total = categorySpending.reduce((sum, [, amount]) => sum + amount, 0);
  let cumulativeAngle = 0;

  const pieSegments = categorySpending.map(([cat, amount], index) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    const angle = (amount / total) * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;

    const color = getCategoryColor(cat);
    
    return {
      cat,
      amount,
      percentage: Math.round(percentage),
      color,
      startAngle,
      endAngle: cumulativeAngle,
    };
  });

  // SVG Pie Chart
  const createPieSlice = (startAngle: number, endAngle: number, color: string) => {
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    const x1 = 50 + 40 * Math.cos(startRad);
    const y1 = 50 + 40 * Math.sin(startRad);
    const x2 = 50 + 40 * Math.cos(endRad);
    const y2 = 50 + 40 * Math.sin(endRad);
    
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">📊 Budget & Udgifter</h2>
        <div className="text-right">
          <div className="text-sm text-gray-500">Saldo</div>
          <div className={`text-3xl sm:text-4xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {balance.toLocaleString('da-DK')} kr
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="flex flex-col items-center">
          <div className="relative w-64 h-64 mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {pieSegments.map((segment, index) => (
                <path
                  key={index}
                  d={createPieSlice(segment.startAngle, segment.endAngle, segment.color)}
                  fill={segment.color}
                  className="cursor-pointer hover:brightness-110 transition-all"
                  onClick={() => onCategoryClick?.(segment.cat)}
                />
              ))}
              {/* Donut hole */}
              <circle cx="50" cy="50" r="22" fill="white" className="dark:fill-slate-900" />
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalExpenses.toLocaleString('da-DK')}
                </div>
                <div className="text-sm text-gray-500">kr udgifter</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste over kategorier */}
        <div className="space-y-4">
          {categorySpending.length > 0 ? (
            categorySpending.map(([cat, amount], index) => {
              const percent = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0;
              const color = getCategoryColor(cat);
              
              return (
                <div 
                  key={index} 
                  onClick={() => onCategoryClick?.(cat)}
                  className="group flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl cursor-pointer hover:bg-emerald-50 dark:hover:bg-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }}></div>
                    <span className="font-semibold text-lg">{cat}</span>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-xl">{amount.toLocaleString('da-DK')} kr</div>
                    <div className="text-sm text-gray-500">{percent}%</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 text-gray-500">
              Ingen udgifter at vise endnu
            </div>
          )}
        </div>
      </div>

      {/* Oversigt */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950 rounded-2xl p-5 text-center">
          <div className="text-emerald-600 text-sm font-medium">Indtægter</div>
          <div className="text-2xl font-bold text-emerald-700">+{totalIncome.toLocaleString('da-DK')} kr</div>
        </div>
        <div className="bg-red-50 dark:bg-red-950 rounded-2xl p-5 text-center">
          <div className="text-red-600 text-sm font-medium">Udgifter</div>
          <div className="text-2xl font-bold text-red-700">-{totalExpenses.toLocaleString('da-DK')} kr</div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 text-center">
          <div className="text-gray-600 text-sm font-medium">Gns. pr. måned</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            -{Math.round(totalExpenses / 3).toLocaleString('da-DK')} kr
          </div>
        </div>
      </div>
    </div>
  );
}