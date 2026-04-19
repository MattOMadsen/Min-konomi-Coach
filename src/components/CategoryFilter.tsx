import { useMemo } from 'react';
import type { Transaction } from '../types';
import { categorizeTransaction } from '../utils/categorize';

interface Props {
  transactions: Transaction[];
  selectedCategory: string | null;
  onCategoryClick: (category: string) => void;
}

export default function CategoryFilter({ transactions, selectedCategory, onCategoryClick }: Props) {
  const categories = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach(t => {
      if (t.amount < 0) {
        set.add(categorizeTransaction(t.description));
      }
    });
    return Array.from(set).sort();
  }, [transactions]);

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onCategoryClick('')}
        className={`px-4 py-1.5 text-sm rounded-2xl transition ${!selectedCategory ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200'}`}
      >
        Alle
      </button>
      
      {categories.map(category => (
        <button
          key={category}
          onClick={() => onCategoryClick(category)}
          className={`px-4 py-1.5 text-sm rounded-2xl transition ${selectedCategory === category ? 'bg-emerald-600 text-white' : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200'}`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}