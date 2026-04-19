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

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <h3 className="text-2xl font-bold mb-6">🔥 Dine største udgifter</h3>

      <div className="space-y-6">
        {insights.map(([category, amount], index) => {
          const percent = Math.round((amount / totalExpenses) * 100);
          let advice = '';

          if (category === 'Takeaway') advice = 'Prøv at lave mad hjemme 3-4 aftener om ugen';
          else if (category === 'Dagligvarer') advice = 'Lav indkøbsliste og køb ind én gang om ugen';
          else if (category === 'Café') advice = 'Lav kaffe hjemme – spar 800-1200 kr/måned';
          else advice = 'Overvej om dette er nødvendigt';

          return (
            <div key={index} className="border-l-4 border-emerald-500 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-lg">{category}</div>
                  <div className="text-3xl font-bold text-gray-900 mt-1">{amount.toLocaleString('da-DK')} kr</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{percent}% af udgifter</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">
                💡 {advice}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}