// src/components/DateRangeFilter.tsx
import { useState } from 'react';

interface Props {
  onDateRangeChange: (startDate: string | null, endDate: string | null) => void;
  currentStart?: string | null;
  currentEnd?: string | null;
}

export default function DateRangeFilter({ onDateRangeChange, currentStart, currentEnd }: Props) {
  const [startDate, setStartDate] = useState(currentStart || '');
  const [endDate, setEndDate] = useState(currentEnd || '');

  const handleApply = () => {
    onDateRangeChange(
      startDate || null, 
      endDate || null
    );
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange(null, null);
  };

  const quickRanges = [
    { label: 'Sidste 30 dage', days: 30 },
    { label: 'Denne måned', type: 'month' },
    { label: 'Sidste 3 måneder', days: 90 },
    { label: 'Hele perioden', type: 'all' },
  ];

  const applyQuickRange = (range: any) => {
    const today = new Date();
    let start = '';
    let end = today.toISOString().split('T')[0];

    if (range.days) {
      const pastDate = new Date(today);
      pastDate.setDate(pastDate.getDate() - range.days);
      start = pastDate.toISOString().split('T')[0];
    } else if (range.type === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    } else if (range.type === 'all') {
      start = '';
      end = '';
    }

    setStartDate(start);
    setEndDate(end);
    onDateRangeChange(start || null, end || null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border border-gray-100 dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">📅</span>
        <h3 className="text-xl font-bold dark:text-white">Vælg periode</h3>
      </div>

      {/* Quick buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickRanges.map((range, i) => (
          <button
            key={i}
            onClick={() => applyQuickRange(range)}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 rounded-xl transition"
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-sm text-gray-500 dark:text-slate-400 block mb-1">Fra dato</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-sm"
          />
        </div>
        <div>
          <label className="text-sm text-gray-500 dark:text-slate-400 block mb-1">Til dato</label>
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={handleApply}
          className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-medium transition"
        >
          Anvend filter
        </button>
        <button 
          onClick={handleReset}
          className="px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-2xl font-medium transition"
        >
          Nulstil
        </button>
      </div>
    </div>
  );
}