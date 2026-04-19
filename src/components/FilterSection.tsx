import SearchBar from './SearchBar';
import CategoryFilter from './CategoryFilter';
import DateFilter from './DateFilter';

interface Props {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  transactions: any[];
  selectedCategory: string | null;
  onCategoryClick: (category: string) => void;
  activeFilter: string;
  onDateFilterChange: (start: string, end: string, name: string) => void;
  onResetDateFilter: () => void;
  onResetAll: () => void;
  hasActiveFilters: boolean;
}

export default function FilterSection({
  searchTerm,
  onSearchChange,
  transactions,
  selectedCategory,
  onCategoryClick,
  activeFilter,
  onDateFilterChange,
  onResetDateFilter,
  onResetAll,
  hasActiveFilters,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
      <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
      <CategoryFilter 
        transactions={transactions} 
        selectedCategory={selectedCategory} 
        onCategoryClick={onCategoryClick} 
      />
      <DateFilter 
        onFilterChange={onDateFilterChange} 
        activeFilter={activeFilter} 
        onReset={onResetDateFilter} 
      />
      
      {hasActiveFilters && (
        <button 
          onClick={onResetAll}
          className="px-4 py-2 text-sm font-medium bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-2xl transition whitespace-nowrap"
        >
          Nulstil filtre
        </button>
      )}
    </div>
  );
}