import type { Transaction } from '../parsers/csvParser';

interface Props {
  transactions: Transaction[];
  onCategoryFilter?: (category: string) => void;
  onDelete?: (index: number) => void;
  onEdit?: (index: number) => void;
  onDuplicate?: (index: number) => void;   // Ny prop
}

export default function TransactionTable({ 
  transactions, 
  onCategoryFilter, 
  onDelete, 
  onEdit, 
  onDuplicate 
}: Props) {
  const totalIn = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = totalIn - totalOut;

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-semibold text-2xl">Dine transaktioner</h3>
          <p className="text-sm text-gray-500">{transactions.length} poster</p>
        </div>
        
        <div className="flex gap-6 text-sm bg-gray-50 px-6 py-3 rounded-2xl">
          <div><span className="text-emerald-600">Ind: </span><span className="font-semibold text-emerald-700">+{totalIn.toLocaleString('da-DK')} kr</span></div>
          <div><span className="text-red-600">Ud: </span><span className="font-semibold text-red-700">-{totalOut.toLocaleString('da-DK')} kr</span></div>
          <div className="font-semibold border-l pl-6">Saldo: <span className={balance >= 0 ? 'text-emerald-600' : 'text-red-600'}>{balance.toLocaleString('da-DK')} kr</span></div>
        </div>
      </div>

      <div className="max-h-[520px] overflow-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="text-left py-4 px-5 font-medium text-gray-600">Dato</th>
              <th className="text-left py-4 px-5 font-medium text-gray-600">Beskrivelse</th>
              <th className="text-right py-4 px-5 font-medium text-gray-600">Beløb</th>
              <th className="w-28 text-center">Handling</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-12 text-gray-400">Ingen transaktioner</td></tr>
            ) : (
              transactions.map((t, index) => (
                <tr key={index} className="hover:bg-gray-50 group">
                  <td className="py-4 px-5 text-gray-700 whitespace-nowrap">{t.date}</td>
                  <td className="py-4 px-5 text-gray-700">{t.description}</td>
                  <td className={`py-4 px-5 text-right font-medium whitespace-nowrap ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.amount >= 0 ? '+' : ''}{t.amount.toLocaleString('da-DK')} kr
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex gap-1 justify-center">
                      {onDuplicate && (
                        <button 
                          onClick={() => onDuplicate(index)}
                          className="opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-700 p-2 transition"
                          title="Duplikér"
                        >
                          📋
                        </button>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(index)}
                          className="opacity-0 group-hover:opacity-100 text-emerald-600 hover:text-emerald-700 p-2 transition"
                          title="Rediger"
                        >
                          ✏️
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(index)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 p-2 transition"
                          title="Slet"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}