// src/components/CategoryDetailModal.tsx
import type { Transaction } from '../types';
import { useEffect, useState } from 'react';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  category: string | null;
  transactions: Transaction[];
  onClose: () => void;
  title?: string;
}

export default function CategoryDetailModal({ 
  category, 
  transactions, 
  onClose,
  title 
}: Props) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!category) return null;

  // Smart filtrering: Prøv først kategori, ellers søg i beskrivelse
  let categoryTransactions = transactions
    .filter(t => t.amount < 0);

  const isCategoryMatch = categoryTransactions.some(t => 
    categorizeTransaction(t.description) === category
  );

  if (isCategoryMatch) {
    // Filtrer på kategori
    categoryTransactions = categoryTransactions.filter(t => 
      categorizeTransaction(t.description) === category
    );
  } else {
    // Filtrer på beskrivelse (til "Faste udgifter")
    const searchTerm = category.toLowerCase();
    categoryTransactions = categoryTransactions.filter(t => 
      t.description.toLowerCase().includes(searchTerm)
    );
  }

  // Sortering
  categoryTransactions = [...categoryTransactions].sort((a, b) => {
    if (sortBy === 'date') {
      return sortOrder === 'desc' 
        ? b.date.localeCompare(a.date) 
        : a.date.localeCompare(b.date);
    } else {
      return sortOrder === 'desc'
        ? Math.abs(b.amount) - Math.abs(a.amount)
        : Math.abs(a.amount) - Math.abs(b.amount);
    }
  });

  const total = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const count = categoryTransactions.length;
  const avg = count > 0 ? Math.round(total / count) : 0;

  const toggleSort = (newSortBy: 'date' | 'amount') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-8 py-5 flex justify-between items-center">
          <div>
            <h3 className="text-white font-semibold text-2xl">{title || category}</h3>
            <p className="text-blue-100 text-sm mt-0.5">
              {count} poster • {total.toLocaleString('da-DK')} kr i alt
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-white text-4xl leading-none hover:text-blue-200 transition w-10 h-10 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-1">ANTAL</div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">{count}</div>
          </div>
          <div className="text-center border-x dark:border-slate-700">
            <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-1">GENNEMSNIT</div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">
              {avg.toLocaleString('da-DK')} kr
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-gray-500 dark:text-slate-400 mb-1">TOTAL</div>
            <div className="text-4xl font-bold text-red-600 dark:text-red-400">
              -{total.toLocaleString('da-DK')} kr
            </div>
          </div>
        </div>

        {/* Sortering */}
        <div className="flex items-center gap-2 px-6 py-3 border-b dark:border-slate-700 bg-white dark:bg-slate-900">
          <span className="text-sm text-gray-500 dark:text-slate-400 mr-2">Sorter efter:</span>
          <button 
            onClick={() => toggleSort('date')}
            className={`px-4 py-1.5 text-sm rounded-xl transition ${sortBy === 'date' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
          >
            Dato {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button 
            onClick={() => toggleSort('amount')}
            className={`px-4 py-1.5 text-sm rounded-xl transition ${sortBy === 'amount' ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
          >
            Beløb {sortBy === 'amount' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>

        {/* Transaktioner */}
        <div className="flex-1 overflow-auto p-6 space-y-2 bg-gray-50 dark:bg-slate-800/30">
          {categoryTransactions.length > 0 ? (
            categoryTransactions.map((t, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-700 transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 dark:text-white truncate pr-4">
                    {t.description}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t.date}</div>
                </div>
                <div className="font-semibold text-red-600 dark:text-red-400 text-right whitespace-nowrap">
                  -{Math.abs(t.amount).toLocaleString('da-DK')} kr
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-500 dark:text-slate-400">Ingen transaktioner fundet.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="text-sm text-gray-500 dark:text-slate-400">
            Tryk <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">ESC</span> for at lukke
          </div>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-2xl font-medium transition"
          >
            Luk
          </button>
        </div>
      </div>
    </div>
  );
}