import { useMemo } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
  onAskAI: () => void;
}

export default function SmartBudgetGenerator({ transactions, onAskAI }: Props) {
  const analysis = useMemo(() => {
    if (transactions.length === 0) return null;

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

    // Antal måneder i dataen
    const months = new Set(transactions.map(t => t.date.substring(0, 7)));
    const numberOfMonths = Math.max(1, months.size);

    const monthlyIncome = Math.round(totalIncome / numberOfMonths);
    const monthlyExpenses = Math.round(totalExpenses / numberOfMonths);

    // Foreslået månedsbudget (med 12% buffer)
    const suggestedBudget: Record<string, number> = {};
    categoryMap.forEach((amount, cat) => {
      const monthlyAvg = Math.round(amount / numberOfMonths);
      suggestedBudget[cat] = Math.round(monthlyAvg * 1.12);
    });

    // Opsparingspotentiale
    const currentSavings = monthlyIncome - monthlyExpenses;
    const recommendedSavings = Math.max(2000, Math.round(currentSavings * 0.7));
    const yearlySavings = recommendedSavings * 12;

    // Konkrete anbefalinger
    const recommendations: string[] = [];

    const takeawayAmount = categoryMap.get('Takeaway') || 0;
    const monthlyTakeaway = Math.round(takeawayAmount / numberOfMonths);
    if (monthlyTakeaway > 1200) {
      recommendations.push(`Du bruger ${monthlyTakeaway} kr/måned på Takeaway. Reducer med 30% og spar ${Math.round(monthlyTakeaway * 0.3)} kr.`);
    }

    const cafeAmount = categoryMap.get('Café') || 0;
    const monthlyCafe = Math.round(cafeAmount / numberOfMonths);
    if (monthlyCafe > 500) {
      recommendations.push(`Du bruger ${monthlyCafe} kr/måned på café. Lav kaffe hjemme og spar ca. ${Math.round(monthlyCafe * 0.4)} kr.`);
    }

    if (recommendations.length === 0) {
      recommendations.push("Du har en rigtig god balance. Fortsæt det gode arbejde!");
    }

    return {
      monthlyIncome,
      monthlyExpenses,
      suggestedBudget,
      recommendedSavings,
      yearlySavings,
      recommendations,
    };
  }, [transactions]);

  if (!analysis || transactions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl shadow-xl p-8 border border-emerald-200 dark:border-emerald-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-bold">🧠 Smart Budget Generator</h3>
          <p className="text-emerald-700 dark:text-emerald-400 mt-1">Personligt budgetforslag baseret på dine vaner</p>
        </div>
        <button 
          onClick={onAskAI}
          className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 transition whitespace-nowrap"
        >
          Få AI-analyse →
        </button>
      </div>

      {/* Oversigt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
          <div className="text-sm text-gray-500">Anbefalet månedligt budget</div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {analysis.monthlyIncome.toLocaleString('da-DK')} kr
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
          <div className="text-sm text-gray-500">Realistisk månedlig opsparing</div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {analysis.recommendedSavings.toLocaleString('da-DK')} kr
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
          <div className="text-sm text-gray-500">Årligt opsparingspotentiale</div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {analysis.yearlySavings.toLocaleString('da-DK')} kr
          </div>
        </div>
      </div>

      {/* Foreslået månedsbudget */}
      <div className="mb-8">
        <h4 className="font-semibold text-xl mb-4">Foreslået månedsbudget</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(analysis.suggestedBudget).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <span className="font-medium">{category}</span>
              <span className="font-bold text-emerald-600">{amount.toLocaleString('da-DK')} kr</span>
            </div>
          ))}
        </div>
      </div>

      {/* Anbefalinger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
        <h4 className="font-semibold text-xl mb-4">💡 Personlige anbefalinger</h4>
        <div className="space-y-4">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-2xl">
              <div className="text-emerald-600 mt-1">→</div>
              <p className="text-emerald-800 dark:text-emerald-200">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}