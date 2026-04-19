import { useMemo } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
}

export default function SmartInsights({ transactions }: Props) {
  const insights = useMemo(() => {
    const map = new Map<string, number>();

    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const category = categorizeTransaction(t.description);
      map.set(category, (map.get(category) || 0) + Math.abs(t.amount));
    });

    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  }, [transactions]);

  if (insights.length === 0) return null;

  const totalExpenses = insights.reduce((sum, [, amt]) => sum + amt, 0);

  const getAdvice = (category: string): string => {
    const lower = category.toLowerCase();

    if (lower.includes('husleje') || lower.includes('leje')) {
      return 'Husleje er en fast udgift. Overvej om du kan finde en billigere bolig på sigt.';
    }
    if (lower.includes('takeaway')) {
      return 'Prøv at lave mad hjemme 3-4 aftener om ugen – det kan spare dig mange penge.';
    }
    if (lower.includes('dagligvarer')) {
      return 'Lav indkøbsliste og køb ind én gang om ugen for at undgå impulskøb.';
    }
    if (lower.includes('café') || lower.includes('coffee')) {
      return 'Lav kaffe hjemme – det kan spare dig 800-1500 kr om måneden.';
    }
    if (lower.includes('benzin')) {
      return 'Overvej samkørsel eller cykel på korte ture.';
    }
    if (lower.includes('abonnement')) {
      return 'Gennemgå dine abonnementer – mange bliver glemt og brugt sjældent.';
    }
    
    return 'Overvej om dette er en fast eller variabel udgift.';
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-slate-800">
      <h3 className="text-2xl font-bold mb-6 dark:text-white">🔥 Dine største udgifter</h3>

      <div className="space-y-6">
        {insights.map(([category, amount], index) => {
          const percent = Math.round((amount / totalExpenses) * 100);
          const advice = getAdvice(category);

          return (
            <div key={index} className="border-l-4 border-emerald-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg dark:text-white">{category}</div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                    {amount.toLocaleString('da-DK')} kr
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">{percent}% af udgifter</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 p-3 rounded-xl">
                💡 {advice}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}