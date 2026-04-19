import { useMemo } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
  onAskAI: () => void;
}

export default function SmartBudgetGenerator({ transactions, onAskAI }: Props) {
  const analysis = useMemo(() => {
    const categoryMap = new Map<string, number>();
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      if (t.amount > 0) totalIncome += t.amount;
      else {
        totalExpenses += Math.abs(t.amount);
        const cat = categorizeTransaction(t.description);
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
      }
    });

    const topSpending = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const savingsPotential = Math.round(totalExpenses * 0.25); // 25% besparelse er realistisk

    return {
      totalIncome,
      totalExpenses,
      topSpending,
      savingsPotential,
      monthlyIncome: Math.round(totalIncome / 3),
      monthlyExpenses: Math.round(totalExpenses / 3),
    };
  }, [transactions]);

  if (transactions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl shadow-xl p-8 border border-emerald-200 dark:border-emerald-900">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-2xl font-bold">🧠 Smart Budget Generator</h3>
          <p className="text-emerald-700 dark:text-emerald-400">Personligt budgetforslag baseret på dine vaner</p>
        </div>
        <button 
          onClick={onAskAI}
          className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 transition"
        >
          Få AI-analyse →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Månedligt overblik */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6">
          <div className="text-sm text-gray-500 mb-2">Anbefalet månedligt budget</div>
          <div className="text-4xl font-bold text-emerald-600">
            {analysis.monthlyIncome.toLocaleString('da-DK')} kr
          </div>
          <div className="text-sm text-gray-500 mt-1">baseret på din indkomst</div>
        </div>

        {/* Besparelsespotentiale */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6">
          <div className="text-sm text-gray-500 mb-2">Besparelsespotentiale</div>
          <div className="text-4xl font-bold text-orange-600">
            {analysis.savingsPotential.toLocaleString('da-DK')} kr
          </div>
          <div className="text-sm text-gray-500 mt-1">pr. måned (25% reduktion)</div>
        </div>

        {/* Top anbefaling */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6">
          <div className="text-sm text-gray-500 mb-2">Største besparelse</div>
          <div className="text-2xl font-bold text-emerald-600">
            {analysis.topSpending[0]?.[0] || 'Ingen data'}
          </div>
          <div className="text-sm text-gray-500 mt-1">
            {analysis.topSpending[0] ? `${analysis.topSpending[0][1].toLocaleString('da-DK')} kr` : ''}
          </div>
        </div>
      </div>

      <div className="mt-8 text-sm text-emerald-700 dark:text-emerald-400">
        💡 <strong>Tip:</strong> Klik på "Få AI-analyse" for et fuldt personligt budgetforslag med konkrete handlinger.
      </div>
    </div>
  );
}