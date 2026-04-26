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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
        <CategoryFilter 
          transactions={transactions} 
          selectedCategory={selectedCategory} 
          onCategoryClick={onCategoryClick} 
        />
        
        {onResetAll && hasActiveFilters && (
          <button 
            onClick={onResetAll}
            className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-2xl transition whitespace-nowrap"
          >
            Nulstil alle filtre
          </button>
        )}
      </div>

      {/* Kun ÉN date filter */}
      <DateRangeFilter 
        onDateRangeChange={onDateRangeChange}
        currentStart={currentStart}
        currentEnd={currentEnd}
      />
    </div>
  );
}