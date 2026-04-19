import { useState, useEffect } from 'react';
import { useFileUpload } from './hooks/useFileUpload';
import { useDateFilter } from './hooks/useDateFilter';

import Navbar from './components/Navbar';
import UploadZone from './components/UploadZone';
import FilterSection from './components/FilterSection';
import StickyBalanceBar from './components/StickyBalanceBar';
import MainContent from './components/MainContent';

import { exportToPDF } from './utils/exportToPDF';
import { exportToExcel } from './utils/exportToExcel';
import type { Transaction } from './types';

function App() {
  const { transactions, isLoading, progress, status, handleFileSelect, setTransactions } = useFileUpload();
  const { filteredTransactions: dateFilteredTransactions, setDateRange, resetDateFilter, activeFilter } = useDateFilter(transactions);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<{ transaction: Transaction; index: number } | null>(null);

  // Filtrering
  let filteredTransactions = dateFilteredTransactions
    .filter(t => !selectedCategory || t.category === selectedCategory)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

  if (selectedMonth) {
    filteredTransactions = filteredTransactions.filter(t => t.date.startsWith(selectedMonth));
  }

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const handleMonthClick = (month: string) => {
    setSelectedMonth(prev => prev === month ? null : month);
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setSelectedMonth(null);
    resetDateFilter();
  };

  const hasActiveFilters = searchTerm || selectedCategory || activeFilter !== 'all' || selectedMonth;

  const exportFilteredView = () => {
    if (filteredTransactions.length === 0) return;
    exportToExcel(filteredTransactions);
  };

  const handleDuplicate = (index: number) => {
    const original = filteredTransactions[index];
    const duplicated = { ...original };
    setTransactions([...transactions, duplicated]);
  };

  const loadSampleData = () => {
    const sample: Transaction[] = [ /* ... dine sample data ... */ ];
    setTransactions(sample);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Søg"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredIncome = filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const filteredExpenses = Math.abs(filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const filteredBalance = filteredIncome - filteredExpenses;

  return (
    <div className="light">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 text-gray-900 dark:text-gray-100">
        
        <Navbar 
          onLoadSample={loadSampleData}
          onExportAll={() => exportToExcel(transactions)}
          onExportFiltered={exportFilteredView}
          onExportPDF={() => exportToPDF(transactions)}
          onClearData={() => setTransactions([])}
          hasTransactions={transactions.length > 0}
        />

        {transactions.length > 0 && (
          <StickyBalanceBar 
            filteredBalance={filteredBalance}
            filteredIncome={filteredIncome}
            filteredExpenses={filteredExpenses}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        <div className="max-w-5xl mx-auto px-4 sm:px-8 pt-8 sm:pt-12 pb-20 sm:pb-24">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter mb-6">
              Få ro i din økonomi<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">med din egen AI-coach</span>
            </h1>
          </div>

          <UploadZone 
            onFileSelect={handleFileSelect}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          />

          {transactions.length > 0 && (
            <FilterSection 
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              transactions={transactions}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
              activeFilter={activeFilter}
              onDateFilterChange={setDateRange}
              onResetDateFilter={resetDateFilter}
              onResetAll={resetAllFilters}
              hasActiveFilters={hasActiveFilters}
            />
          )}

          <MainContent 
            transactions={transactions}
            filteredTransactions={filteredTransactions}
            isLoading={isLoading}
            progress={progress}
            status={status}
            selectedCategory={selectedCategory}
            onCategoryClick={handleCategoryClick}
            onDelete={(index) => {
              const newList = [...transactions];
              newList.splice(index, 1);
              setTransactions(newList);
            }}
            onEdit={(index) => {
              const originalIndex = transactions.findIndex(t => t === filteredTransactions[index]);
              setEditingTransaction({ transaction: filteredTransactions[index], index: originalIndex });
            }}
            onDuplicate={handleDuplicate}
            onAskAI={() => setShowAIChat(true)}
            showAIChat={showAIChat}
            onCloseAIChat={() => setShowAIChat(false)}
            editingTransaction={editingTransaction}
            onCloseEditModal={() => setEditingTransaction(null)}
            onSaveEdit={(updated, index) => {
              const newList = [...transactions];
              newList[index] = updated;
              setTransactions(newList);
            }}
            setTransactions={setTransactions}
            onMonthClick={handleMonthClick}
            selectedMonth={selectedMonth}
          />
        </div>

        {transactions.length > 0 && (
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl shadow-2xl flex items-center justify-center text-3xl sm:text-4xl hover:scale-110 transition-all z-50"
          >
            💬
          </button>
        )}
      </div>
    </div>
  );
}

export default App;