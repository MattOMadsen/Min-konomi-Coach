// src/components/FilterSection.tsx
import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import DateRangeFilter from './DateRangeFilter';

interface Props {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  transactions: any[];
  selectedCategory: string | null;
  onCategoryClick: (category: string) => void;
  onDateRangeChange: (start: string | null, end: string | null) => void;
  currentStart?: string | null;
  currentEnd?: string | null;
  onResetAll?: () => void;
  hasActiveFilters?: boolean;
}

export default function FilterSection({
  searchTerm,
  onSearchChange,
  transactions,
  selectedCategory,
  onCategoryClick,
  onDateRangeChange,
  currentStart,
  currentEnd,
  onResetAll,
  hasActiveFilters,
}: Props) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Venstre side: Søg + Kategorier */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Søg & Filtrer</span>
            {hasActiveFilters && onResetAll && (
              <button 
                onClick={onResetAll}
                className="text-xs px-3 py-1 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition"
              >
                Nulstil alle
              </button>
            )}
          </div>

          <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />

          <CategoryFilter 
            transactions={transactions} 
            selectedCategory={selectedCategory} 
            onCategoryClick={onCategoryClick} 
          />
        </div>

        {/* Højre side: Dato filter */}
        <div className="lg:w-96 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-slate-700 pt-6 lg:pt-0 lg:pl-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-gray-500 dark:text-slate-400">Periode</span>
          </div>
          
          <DateRangeFilter 
            onDateRangeChange={onDateRangeChange}
            currentStart={currentStart}
            currentEnd={currentEnd}
          />
        </div>
      </div>
    </div>
  );
}