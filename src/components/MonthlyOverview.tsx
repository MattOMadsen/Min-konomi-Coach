import { useMemo } from 'react';
import type { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
}

export default function MonthlyOverview({ transactions }: Props) {
  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number; expenses: number; count: number }>();

    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7);

      if (!map.has(monthKey)) {
        map.set(monthKey, { income: 0, expenses: 0, count: 0 });
      }

      const data = map.get(monthKey)!;
      data.count++;

      if (t.amount > 0) {
        data.income += t.amount;
      } else {
        data.expenses += Math.abs(t.amount);
      }
    });

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => ({
        month,
        ...data,
        balance: data.income - data.expenses
      }));
  }, [transactions]);

  if (monthlyData.length === 0) return null;

  // Beregn max værdi til grafen
  const maxBalance = Math.max(...monthlyData.map(d => Math.abs(d.balance)), 1000);

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
      <h3 className="text-2xl font-bold mb-6">📅 Månedlig Oversigt + Trend</h3>

      {/* Linjegraf */}
      <div className="mb-8 h-48 relative">
        <svg viewBox="0 0 600 180" className="w-full h-full">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line 
              key={i}
              x1="40" 
              y1={30 + i * 30} 
              x2="580" 
              y2={30 + i * 30} 
              stroke="#e2e8f0" 
              strokeWidth="1" 
            />
          ))}

          {/* Linje */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={monthlyData.map((d, i) => {
              const x = 60 + (i * (520 / Math.max(monthlyData.length - 1, 1)));
              const y = 150 - ((d.balance / maxBalance) * 110);
              return `${x},${y}`;
            }).join(' ')}
          />

          {/* Punkter */}
          {monthlyData.map((d, i) => {
            const x = 60 + (i * (520 / Math.max(monthlyData.length - 1, 1)));
            const y = 150 - ((d.balance / maxBalance) * 110);
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="5" fill="#10b981" />
                <text x={x} y={y - 12} textAnchor="middle" fontSize="11" fill="#64748b">
                  {d.balance.toLocaleString('da-DK')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Månedlig oversigt */}
      <div className="space-y-4">
        {monthlyData.map(({ month, income, expenses, balance, count }) => (
          <div key={month} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
            <div>
              <div className="font-semibold text-lg">{month}</div>
              <div className="text-sm text-gray-500">{count} transaktioner</div>
            </div>
            
            <div className="flex gap-8 text-sm">
              <div className="text-right">
                <div className="text-emerald-600">Ind</div>
                <div className="font-semibold text-emerald-700">+{income.toLocaleString('da-DK')} kr</div>
              </div>
              <div className="text-right">
                <div className="text-red-600">Ud</div>
                <div className="font-semibold text-red-700">-{expenses.toLocaleString('da-DK')} kr</div>
              </div>
              <div className="text-right border-l pl-8">
                <div className="text-gray-600">Saldo</div>
                <div className={`font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {balance.toLocaleString('da-DK')} kr
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}