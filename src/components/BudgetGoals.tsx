import { useState } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
}

export default function BudgetGoals({ transactions }: Props) {
  const [goals, setGoals] = useState<Record<string, number>>({
    'Takeaway': 2000,
    'Dagligvarer': 3500,
    'Café': 800,
    'Benzin': 1500,
    'Husleje': 10000,
    'Abonnementer': 600,
  });

  const [showEdit, setShowEdit] = useState(false);

  const currentSpending = new Map<string, number>();

  transactions.forEach(t => {
    if (t.amount >= 0) return;
    const category = categorizeTransaction(t.description);
    currentSpending.set(category, (currentSpending.get(category) || 0) + Math.abs(t.amount));
  });

  const getStatus = (cat: string, goal: number) => {
    const spent = currentSpending.get(cat) || 0;
    const percent = Math.round((spent / goal) * 100);
    
    if (percent >= 100) return { color: 'text-red-600', text: 'Over budget', percent };
    if (percent >= 85) return { color: 'text-orange-600', text: 'Tæt på grænsen', percent };
    return { color: 'text-emerald-600', text: 'Inden for budget', percent };
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">🎯 Budgetmål</h3>
        <button onClick={() => setShowEdit(!showEdit)} className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-2xl transition">
          {showEdit ? 'Gem' : 'Rediger mål'}
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(goals).map(([category, goal]) => {
          const spent = currentSpending.get(category) || 0;
          const status = getStatus(category, goal);

          return (
            <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div className="flex-1">
                <div className="font-semibold">{category}</div>
                <div className="text-sm text-gray-500">Mål: {goal.toLocaleString('da-DK')} kr</div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg">{spent.toLocaleString('da-DK')} kr</div>
                <div className={`text-sm ${status.color}`}>{status.text} ({status.percent}%)</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}