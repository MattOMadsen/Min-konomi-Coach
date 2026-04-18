// 1 fil - 1 funktion
// Pæn, overskuelig transaktionstabel med totaler og farver

import type { Transaction } from '../parsers/csvParser';

interface TransactionTableProps {
  transactions: Transaction[];
}

export default function TransactionTable({ transactions }: TransactionTableProps) {
  // Beregn totaler
  const totalIn = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOut = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const balance = totalIn - totalOut;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      {/* Header med totaler */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h3 className="font-semibold text-xl text-gray-900">
          Dine transaktioner ({transactions.length} stk.)
        </h3>

        <div className="flex flex-wrap gap-6 text-sm">
          <div>
            <span className="text-emerald-600 font-medium">Ind: </span>
            <span className="font-semibold text-emerald-700">
              {totalIn.toFixed(2)} kr
            </span>
          </div>
          <div>
            <span className="text-red-600 font-medium">Ud: </span>
            <span className="font-semibold text-red-700">
              {totalOut.toFixed(2)} kr
            </span>
          </div>
          <div className="font-medium">
            Saldo:{' '}
            <span className={balance >= 0 ? 'text-emerald-600' : 'text-red-600'}>
              {balance.toFixed(2)} kr
            </span>
          </div>
        </div>
      </div>

      {/* Tabel */}
      <div className="max-h-[500px] overflow-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr className="border-b">
              <th className="text-left py-4 px-4 font-medium text-gray-600">Dato</th>
              <th className="text-left py-4 px-4 font-medium text-gray-600">Beskrivelse</th>
              <th className="text-right py-4 px-4 font-medium text-gray-600">Beløb</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4 whitespace-nowrap text-gray-700">
                  {t.date}
                </td>
                <td className="py-4 px-4 text-gray-700">
                  {t.description}
                </td>
                <td className={`py-4 px-4 text-right font-medium whitespace-nowrap ${
                  t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)} kr
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length === 0 && (
        <p className="text-center text-gray-500 py-12">
          Ingen transaktioner fundet i filen
        </p>
      )}
    </div>
  );
}