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
    const categoryCount = new Map<string, number>(); // Antal køb pr. kategori
    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      if (t.amount > 0) totalIncome += t.amount;
      else {
        totalExpenses += Math.abs(t.amount);
        const cat = categorizeTransaction(t.description);
        categoryMap.set(cat, (categoryMap.get(cat) || 0) + Math.abs(t.amount));
        categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1);
      }
    });

    const monthlyIncome = Math.round(totalIncome / 3);
    const monthlyExpenses = Math.round(totalExpenses / 3);

    // === REALISTISKE BEREGNINGER ===
    const takeawayAmount = categoryMap.get('Takeaway') || 0;
    const takeawayCount = categoryCount.get('Takeaway') || 0;
    const avgTakeawayPrice = takeawayCount > 0 ? Math.round(takeawayAmount / takeawayCount) : 85;
    const monthlyTakeawayOrders = Math.round(takeawayCount / 3);

    const cafeAmount = categoryMap.get('Café') || 0;
    const cafeCount = categoryCount.get('Café') || 0;
    const avgCafePrice = cafeCount > 0 ? Math.round(cafeAmount / cafeCount) : 52;
    const monthlyCafeVisits = Math.round(cafeCount / 3);

    // Foreslået budget (med 12% buffer)
    const suggestedBudget: Record<string, number> = {};
    categoryMap.forEach((amount, cat) => {
      const monthlyAvg = Math.round(amount / 3);
      suggestedBudget[cat] = Math.round(monthlyAvg * 1.12);
    });

    // Opsparingspotentiale
    const currentSavings = monthlyIncome - monthlyExpenses;
    const recommendedSavings = Math.max(2000, Math.round(currentSavings * 0.7));
    const yearlySavings = recommendedSavings * 12;

    // Konkrete, data-baserede anbefalinger
    const recommendations: string[] = [];

    if (monthlyTakeawayOrders > 6 && avgTakeawayPrice > 70) {
      const potentialSaving = Math.round(monthlyTakeawayOrders * avgTakeawayPrice * 0.35);
      recommendations.push(
        `Du køber takeaway ${monthlyTakeawayOrders} gange om måneden til gennemsnitligt ${avgTakeawayPrice} kr. ` +
        `Hvis du reducerer til ${Math.max(4, Math.floor(monthlyTakeawayOrders * 0.65))} gange, sparer du ca. ${potentialSaving} kr/måned.`
      );
    }

    if (monthlyCafeVisits > 5 && avgCafePrice > 45) {
      const potentialSaving = Math.round(monthlyCafeVisits * avgCafePrice * 0.45);
      recommendations.push(
        `Du besøger café ${monthlyCafeVisits} gange om måneden til ${avgCafePrice} kr i gennemsnit. ` +
        `Ved at lave kaffe hjemme 4 dage om ugen kan du spare ca. ${potentialSaving} kr/måned.`
      );
    }

    const subscriptionAmount = categoryMap.get('Abonnementer') || 0;
    const monthlySubs = Math.round(subscriptionAmount / 3);
    if (monthlySubs > 350) {
      recommendations.push(
        `Du bruger ${monthlySubs} kr/måned på abonnementer. Prøv at gennemgå dem – mange bliver glemt.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push("Du har en rigtig sund økonomi. Fortsæt det gode arbejde!");
    }

    return {
      monthlyIncome,
      monthlyExpenses,
      suggestedBudget,
      recommendedSavings,
      yearlySavings,
      recommendations,
      avgTakeawayPrice,
      monthlyTakeawayOrders,
      avgCafePrice,
      monthlyCafeVisits,
    };
  }, [transactions]);

  if (!analysis || transactions.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl shadow-xl p-8 border border-emerald-200 dark:border-emerald-900">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-3xl font-bold">🧠 Smart Budget Generator</h3>
          <p className="text-emerald-700 dark:text-emerald-400 mt-1">Realistisk budget baseret på dine egne vaner</p>
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

      {/* Foreslået budget */}
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

      {/* Data-baserede anbefalinger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
        <h4 className="font-semibold text-xl mb-4">💡 Personlige anbefalinger baseret på dine vaner</h4>
        <div className="space-y-4">
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="flex gap-3 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-2xl">
              <div className="text-emerald-600 mt-1">→</div>
              <p className="text-emerald-800 dark:text-emerald-200">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-sm text-emerald-700 dark:text-emerald-400">
        Alle tal er beregnet ud fra dine faktiske transaktioner • Opdateres automatisk når du uploader nye filer
      </div>
    </div>
  );
}