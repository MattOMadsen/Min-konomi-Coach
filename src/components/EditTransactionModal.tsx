import { useState, useEffect } from 'react';
import type { Transaction } from '../types';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction, originalIndex: number) => void;
  index: number;
}

export default function EditTransactionModal({ transaction, onClose, onSave, index }: Props) {
  const [form, setForm] = useState({
    date: '',
    description: '',
    amount: '',
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        date: transaction.date,
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
      });
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!form.description || isNaN(amount)) return;

    const updated: Transaction = {
      date: form.date,
      description: form.description,
      amount: transaction.amount < 0 ? -Math.abs(amount) : Math.abs(amount),
    };

    onSave(updated, index);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-semibold text-xl">Rediger transaktion</h3>
          <button onClick={onClose} className="text-white text-3xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Dato</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Beskrivelse</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Beløb (kr)</label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 dark:border-slate-700 rounded-2xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium transition"
            >
              Gem ændringer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}