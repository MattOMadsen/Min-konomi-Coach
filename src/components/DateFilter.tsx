import { useState } from 'react';

interface Props {
  onFilterChange: (startDate: string, endDate: string) => void;
}

export default function DateFilter({ onFilterChange }: Props) {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { label: 'Alle', value: 'all' },
    { label: 'Sidste 30 dage', value: '30days' },
    { label: 'Denne måned', value: 'thisMonth' },
    { label: 'Sidste 3 måneder', value: '3months' },
  ];

  const handleFilter = (filter: string) => {
    setActiveFilter(filter);
    
    const today = new Date();
    let startDate = '';
    let endDate = today.toISOString().split('T')[0];

    if (filter === '30days') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      startDate = thirtyDaysAgo.toISOString().split('T')[0];
    } 
    else if (filter === 'thisMonth') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    } 
    else if (filter === '3months') {
      const threeMonthsAgo = new Date(today);
      threeMonthsAgo.setMonth(today.getMonth() - 3);
      startDate = threeMonthsAgo.toISOString().split('T')[0];
    }

    onFilterChange(startDate, endDate);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => handleFilter(filter.value)}
          className={`px-4 py-2 text-sm rounded-2xl transition ${
            activeFilter === filter.value
              ? 'bg-emerald-600 text-white'
              : 'bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}