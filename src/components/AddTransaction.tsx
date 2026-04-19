import { useState } from 'react';
import type { Transaction } from '../types';

interface Props {
  onAdd: (transaction: Transaction) => void;
}

export default function AddTransaction({ onAdd }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'udgift' as 'udgift' | 'indtægt'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form.description || !form.amount) return;

    const amount = form.type === 'udgift' 
      ? -Math.abs(parseFloat(form.amount)) 
      : Math.abs(parseFloat(form.amount));

    onAdd({
      date: form.date,
      description: form.description,
      amount: amount
    });

    // Reset form
    setForm({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      type: 'udgift'
    });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <button 
        onClick={() => setShowForm(true)}
        className="w-full py-4 border-2 border-dashed border-gray-300 hover:border-emerald-500 rounded-3xl text-gray-600 hover:text-emerald-600 transition flex items-center justify-center gap-2"
      >
        + Tilføj manuel transaktion
      </button>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow p-6 border border-gray-100">
      <h4 className="font-semibold mb-4">Tilføj ny transaktion</h4>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 block mb-1">Dato</label>
            <input 
              type="date" 
              value={form.date}
              onChange={(e) => setForm({...form, date: e.target.value})}
              className="w-full border rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 block mb-1">Type</label>
            <select 
              value={form.type}
              onChange={(e) => setForm({...form, type: e.target.value as 'udgift' | 'indtægt'})}
              className="w-full border rounded-xl px-4 py-3 text-sm"
            >
              <option value="udgift">Udgift</option>
              <option value="indtægt">Indtægt</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Beskrivelse</label>
          <input 
            type="text" 
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            placeholder="F.eks. 'Køb af mad' eller 'Løn'"
            className="w-full border rounded-xl px-4 py-3 text-sm"
            required
          />
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Beløb (kr)</label>
          <input 
            type="number" 
            value={form.amount}
            onChange={(e) => setForm({...form, amount: e.target.value})}
            placeholder="0"
            className="w-full border rounded-xl px-4 py-3 text-sm"
            required
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button 
            type="submit"
            className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-medium hover:bg-emerald-700 transition"
          >
            Tilføj transaktion
          </button>
          <button 
            type="button"
            onClick={() => setShowForm(false)}
            className="px-6 py-3 border rounded-2xl hover:bg-gray-50 transition"
          >
            Annuller
          </button>
        </div>
      </form>
    </div>
  );
}