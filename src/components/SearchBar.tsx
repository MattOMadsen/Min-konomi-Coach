interface Props {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function SearchBar({ searchTerm, onSearchChange }: Props) {
  return (
    <div className="relative mb-6">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Søg i transaktioner..."
        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-3xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
      <div className="absolute left-5 top-4 text-gray-400">🔍</div>
    </div>
  );
}