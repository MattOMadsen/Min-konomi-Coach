import type { Transaction } from '../types';

interface Props {
  category: string | null;
  transactions: Transaction[];
  onClose: () => void;
}

export default function CategoryDetailModal({ category, transactions, onClose }: Props) {
  if (!category) return null;

  const categoryTransactions = transactions
    .filter(t => t.amount < 0 && t.description.toLowerCase().includes(category.toLowerCase()))
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const avg = categoryTransactions.length > 0 ? Math.round(total / categoryTransactions.length) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-semibold text-xl">{category}</h3>
          <button onClick={onClose} className="text-white text-3xl leading-none">×</button>
        </div>

        <div className="p-6">
          {/* Statistik */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-sm text-gray-500">Antal</div>
              <div className="text-2xl font-bold">{categoryTransactions.length}</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-sm text-gray-500">Gennemsnit</div>
              <div className="text-2xl font-bold">{avg.toLocaleString('da-DK')} kr</div>
            </div>
            <div className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-sm text-gray-500">I alt</div>
              <div className="text-2xl font-bold text-red-600">-{total.toLocaleString('da-DK')} kr</div>
            </div>
          </div>

          {/* Seneste transaktioner */}
          <h4 className="font-semibold mb-3">Seneste transaktioner</h4>
          <div className="max-h-72 overflow-auto space-y-2">
            {categoryTransactions.length > 0 ? (
              categoryTransactions.slice(0, 10).map((t, index) => (
                <div key={index} className="flex justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
                  <div>{t.date} • {t.description}</div>
                  <div className="font-medium text-red-600">-{Math.abs(t.amount).toLocaleString('da-DK')} kr</div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 py-4">Ingen transaktioner fundet i denne kategori.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 dark:bg-slate-700 rounded-2xl hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
}