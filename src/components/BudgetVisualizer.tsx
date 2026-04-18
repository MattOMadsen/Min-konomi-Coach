// 1 fil - 1 funktion
// components/BudgetVisualizer.tsx – Ren, fejlsikker version (fixer 500 Internal Server Error)

import { useMemo, useState } from 'react';
import type { Transaction } from '../parsers/csvParser';

interface BudgetVisualizerProps {
  transactions: Transaction[];
  onCategoryClick?: (category: string) => void;
  onAskAI?: (question: string) => void;
}

export default function BudgetVisualizer({ 
  transactions, 
  onCategoryClick = () => {}, 
  onAskAI = () => {} 
}: BudgetVisualizerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const categoryColors: Record<string, string> = {
    Takeaway: '#ef4444',
    Dagligvarer: '#f59e0b',
    Café: '#8b5cf6',
    'Benzin & bil': '#10b981',
    Husleje: '#3b82f6',
    Abonnementer: '#ec4899',
    Diverse: '#64748b',
  };

  const { categorySpending, totalExpenses, totalIncome, monthlyAvg } = useMemo(() => {
    const map = new Map<string, number>();

    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const desc = t.description.toLowerCase();
      let category = 'Diverse';

      if (desc.includes('takeaway') || desc.includes('wolt') || desc.includes('just eat')) category = 'Takeaway';
      else if (desc.includes('netto') || desc.includes('føtex') || desc.includes('rema')) category = 'Dagligvarer';
      else if (desc.includes('café') || desc.includes('coffee')) category = 'Café';
      else if (desc.includes('benzin') || desc.includes('shell')) category = 'Benzin & bil';
      else if (desc.includes('husleje') || desc.includes('leje')) category = 'Husleje';
      else if (desc.includes('netflix') || desc.includes('spotify')) category = 'Abonnementer';

      map.set(category, (map.get(category) || 0) + Math.abs(t.amount));
    });

    const spending = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    const totalExp = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const totalInc = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const monthlyAverage = totalExp / 3;

    return { 
      categorySpending: spending, 
      totalExpenses: totalExp, 
      totalIncome: totalInc,
      monthlyAvg: monthlyAverage 
    };
  }, [transactions]);

  const pieSegments = useMemo(() => {
    if (totalExpenses === 0) return '';
    let start = 0;
    return categorySpending
      .map(([cat, amount]) => {
        const percent = (amount / totalExpenses) * 100;
        const color = categoryColors[cat] || '#64748b';
        const segment = `${color} ${start}% ${start + percent}%`;
        start += percent;
        return segment;
      })
      .join(', ');
  }, [categorySpending, totalExpenses]);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-emerald-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          📊 Budgetoversigt
          <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-2xl font-medium">
            {transactions.length} poster
          </span>
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
        >
          {isExpanded ? 'Vis mindre ▲' : 'Vis mere ▼'}
        </button>
      </div>

      {/* Pie chart */}
      <div className="flex justify-center mb-8">
        <div
          className="w-40 h-40 rounded-full relative flex items-center justify-center shadow-inner"
          style={{ background: `conic-gradient(${pieSegments})` }}
        >
          <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center text-center">
            <div className="text-xs text-gray-500">Saldo</div>
            <div className="text-2xl font-bold text-emerald-700">
              {(totalIncome - totalExpenses).toLocaleString('da-DK')} kr
            </div>
          </div>
        </div>
      </div>

      {/* Samlet oversigt */}
      <div className="grid grid-cols-3 gap-4 mb-8 text-center">
        <div>
          <div className="text-xs text-emerald-600">Indtægter</div>
          <div className="text-xl font-semibold text-emerald-700">+{totalIncome.toLocaleString('da-DK')} kr</div>
        </div>
        <div>
          <div className="text-xs text-red-600">Udgifter</div>
          <div className="text-xl font-semibold text-red-700">-{totalExpenses.toLocaleString('da-DK')} kr</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Gns. pr. måned</div>
          <div className="text-xl font-semibold text-gray-700">-{monthlyAvg.toLocaleString('da-DK')} kr</div>
        </div>
      </div>

      {/* Progress bars */}
      <div className={`space-y-5 transition-all ${isExpanded ? '' : 'max-h-80 overflow-hidden'}`}>
        {categorySpending.map(([category, amount]) => {
          const percent = totalExpenses > 0 ? Math.min(100, Math.round((amount / totalExpenses) * 100)) : 0;
          const color = categoryColors[category] || '#64748b';

          return (
            <div key={category} className="group">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                  {category}
                </span>
                <span className="font-medium text-gray-900">{amount.toLocaleString('da-DK')} kr</span>
              </div>
              <div 
                className="h-3 bg-gray-100 rounded-full overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-300 transition-all"
                onClick={() => onCategoryClick(category)}
              >
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${percent}%`, backgroundColor: color }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>{percent}% af udgifterne</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAskAI(`Fortæl mig mere om mine udgifter til ${category}`);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 underline text-xs"
                >
                  Spørg AI →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {categorySpending.length === 0 && (
        <p className="text-center text-gray-400 py-12">Ingen udgifter fundet endnu</p>
      )}

      <div className="mt-8 text-center text-xs text-emerald-600">
        Klik på en bar for at filtrere listen • Spørg AI direkte om en kategori
      </div>
    </div>
  );
}