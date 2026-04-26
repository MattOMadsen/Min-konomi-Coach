import { useMemo, useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';
import { useGrokAI } from '../hooks/useGrokAI';

interface Props {
  transactions: Transaction[];
  onAskAI: (prompt?: string) => void;
}

export default function SmartBudgetGenerator({ transactions, onAskAI }: Props) {
  const { callGrok, isLoading: isGrokLoading, lastUsedGrok, hasApiKey } = useGrokAI();
  const [grokSuggestions, setGrokSuggestions] = useState<any>(null);

  const localAnalysis = useMemo(() => {
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

    const months = new Set(transactions.map(t => t.date.substring(0, 7)));
    const numberOfMonths = Math.max(1, months.size);

    const medianMonthlyIncome = Math.round(totalIncome / numberOfMonths);
    const medianMonthlyExpenses = Math.round(totalExpenses / numberOfMonths);
    const recommendedMonthlyBudget = Math.round(medianMonthlyExpenses * 1.25);
    const recommendedSavings = Math.max(3000, Math.round(medianMonthlyIncome * 0.20));

    const suggestedBudget: Record<string, number> = {};
    categoryMap.forEach((amount, cat) => {
      const monthlyAvg = Math.round(amount / numberOfMonths);
      suggestedBudget[cat] = cat.toLowerCase().includes('husleje') 
        ? monthlyAvg 
        : Math.round(monthlyAvg * 1.10);
    });

    return {
      medianMonthlyIncome,
      medianMonthlyExpenses,
      recommendedMonthlyBudget,
      recommendedSavings,
      yearlySavings: recommendedSavings * 12,
      suggestedBudget,
      recommendations: ["Lokal analyse aktiv"],
      numberOfMonths,
    };
  }, [transactions]);

  useEffect(() => {
    if (transactions.length === 0 || !hasApiKey) return;

    const fetchGrok = async () => {
      const prompt = `Giv et realistisk månedligt budgetforslag som JSON baseret på disse transaktioner.`;
      const result = await callGrok(prompt);
      if (result.usedGrok && result.content) {
        try {
          const parsed = JSON.parse(result.content.replace(/```json|```/g, '').trim());
          setGrokSuggestions(parsed);
        } catch {}
      }
    };
    fetchGrok();
  }, [transactions, callGrok, hasApiKey]);

  const analysis = grokSuggestions || localAnalysis;
  const usingGrok = lastUsedGrok && grokSuggestions;

  if (!analysis) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 rounded-3xl shadow-xl p-8 border border-emerald-200 dark:border-emerald-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-3xl font-bold">Smart Budget Generator</h3>
          <p className="text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-2">
            {usingGrok ? '🤖 Grok AI-analyse' : '📊 Lokal analyse (fallback)'}
            {isGrokLoading && <span className="animate-pulse text-xs">• Henter...</span>}
          </p>
        </div>
        <button 
          onClick={() => {
            const prompt = `Giv mig en fuld personlig økonomisk analyse baseret på mine transaktioner. Inkluder anbefalet månedligt budget, realistisk opsparing, top 3 besparelsesmuligheder og eventuelle advarsler.`;
            onAskAI(prompt);
          }}
          className="px-5 py-2 bg-emerald-600 text-white rounded-2xl text-sm font-medium hover:bg-emerald-700 transition whitespace-nowrap"
        >
          Få fuld AI-analyse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
          <div className="text-sm text-gray-500">Anbefalet månedligt budget</div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {(analysis.recommendedMonthlyBudget || analysis.recommendedBudget || 0).toLocaleString('da-DK')} kr
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
          <div className="text-sm text-gray-500">Realistisk månedlig opsparing</div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {(analysis.recommendedSavings || analysis.savingsGoal || 0).toLocaleString('da-DK')} kr
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow">
          <div className="text-sm text-gray-500">Årligt opsparingspotentiale</div>
          <div className="text-4xl font-bold text-emerald-600 mt-2">
            {(analysis.yearlySavings || ((analysis.recommendedSavings || 0) * 12)).toLocaleString('da-DK')} kr
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h4 className="font-semibold text-xl mb-4">Foreslået månedsbudget pr. kategori</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(analysis.suggestedBudget || {}).map(([category, amount]) => (
            <div key={category} className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800">
              <span className="font-medium">{category}</span>
              <span className="font-bold text-emerald-600">{(amount as number).toLocaleString('da-DK')} kr</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
        <h4 className="font-semibold text-xl mb-4">Personlige anbefalinger</h4>
        <div className="space-y-4">
          {(analysis.recommendations || []).map((rec: string, index: number) => (
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