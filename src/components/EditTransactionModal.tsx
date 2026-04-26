// src/components/EditTransactionModal.tsx
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
    isExpense: true,
  });

  useEffect(() => {
    if (transaction) {
      setForm({
        date: transaction.date,
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
        isExpense: transaction.amount < 0,
      });
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(form.amount);
    if (!form.description || isNaN(amount) || amount <= 0) {
      alert('Udfyld venligst alle felter korrekt');
      return;
    }

    const updated: Transaction = {
      date: form.date,
      description: form.description,
      amount: form.isExpense ? -Math.abs(amount) : Math.abs(amount),
    };

    onSave(updated, index);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold text-xl">Rediger transaktion</h3>
            <p className="text-emerald-100 text-sm mt-0.5">Ændr dato, beskrivelse eller beløb</p>
          </div>
          <button onClick={onClose} className="text-white text-4xl leading-none hover:text-emerald-200 transition">×</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Dato */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Dato</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
              required
            />
          </div>

          {/* Beskrivelse */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Beskrivelse</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
              placeholder="F.eks. Løn, Husleje, Dagligvarer..."
              required
            />
          </div>

          {/* Beløb + Type */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1.5">Beløb (kr)</label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="flex-1 border border-gray-300 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800"
                placeholder="0.00"
                required
              />
              
              {/* Ind/ud toggle */}
              <div className="flex bg-gray-100 dark:bg-slate-800 rounded-2xl p-1">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpense: true })}
                  className={`px-4 py-2 text-sm rounded-xl transition ${form.isExpense ? 'bg-red-500 text-white' : 'hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                >
                  Udgift
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isExpense: false })}
                  className={`px-4 py-2 text-sm rounded-xl transition ${!form.isExpense ? 'bg-emerald-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                >
                  Indtægt
                </button>
              </div>
            </div>
          </div>

          {/* Knapper */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 border border-gray-300 dark:border-slate-700 rounded-2xl font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium transition flex items-center justify-center gap-2"
            >
              Gem ændringer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}