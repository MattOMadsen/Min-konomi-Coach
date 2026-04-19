import { useState } from 'react';
import { useFileUpload } from './hooks/useFileUpload';
import { useDarkMode } from './hooks/useDarkMode';
import { useDateFilter } from './hooks/useDateFilter';
import TransactionTable from './components/TransactionTable';
import BudgetVisualizer from './components/BudgetVisualizer';
import MonthlyOverview from './components/MonthlyOverview';
import SmartInsights from './components/SmartInsights';
import BudgetGoals from './components/BudgetGoals';
import AddTransaction from './components/AddTransaction';
import SmartBudgetGenerator from './components/SmartBudgetGenerator';
import SearchBar from './components/SearchBar';
import CategoryFilter from './components/CategoryFilter';
import AIChat from './components/AIChat';
import DateFilter from './components/DateFilter';
import EditTransactionModal from './components/EditTransactionModal';
import { exportToPDF } from './utils/exportToPDF';
import { exportToExcel } from './utils/exportToExcel';
import type { Transaction } from './types';

function App() {
  const { transactions, isLoading, progress, status, handleFileSelect, setTransactions } = useFileUpload();
  const { darkMode, setDarkMode } = useDarkMode();
  const { filteredTransactions: dateFilteredTransactions, setDateRange, resetDateFilter, activeFilter } = useDateFilter(transactions);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<{ transaction: Transaction; index: number } | null>(null);

  const filteredTransactions = dateFilteredTransactions
    .filter(t => !selectedCategory || t.category === selectedCategory)
    .filter(t => t.description.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  const loadSampleData = () => {
    const sample: Transaction[] = [
      { date: "2026-03-01", description: "Løn marts", amount: 28500 },
      { date: "2026-03-02", description: "Husleje marts", amount: -9500 },
      { date: "2026-03-05", description: "Netto + Rema", amount: -3200 },
      { date: "2026-03-08", description: "Benzin Shell", amount: -1850 },
      { date: "2026-03-10", description: "Spotify + Mobil", amount: -899 },
      { date: "2026-03-12", description: "Biograf + Restaurant", amount: -1450 },
      { date: "2026-03-15", description: "Salg af telefon", amount: 1200 },
      { date: "2026-03-18", description: "Nye sko", amount: -650 },
      { date: "2026-03-20", description: "Tandlæge", amount: -2100 },
      { date: "2026-03-25", description: "Fødselsdagsgave", amount: -450 },
    ];
    setTransactions(sample);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const totalBalance = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950 text-gray-900 dark:text-gray-100">
        
        {/* Navbar */}
        <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-8 py-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center text-3xl">💰</div>
              <span className="font-bold text-3xl tracking-tighter">Min Økonomi Coach</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={loadSampleData} className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-800 rounded-2xl transition">Indlæs eksempeldata</button>
              
              {transactions.length > 0 && (
                <>
                  <button onClick={() => exportToExcel(transactions)} className="px-4 py-2 text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-2xl transition">Excel</button>
                  <button onClick={() => exportToPDF(transactions)} className="px-4 py-2 text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-2xl transition">PDF</button>
                  <button onClick={() => setTransactions([])} className="px-4 py-2 text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-2xl transition">Ryd data</button>
                </>
              )}
              
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-slate-800 rounded-2xl transition"
              >
                {darkMode ? '☀️ Lys' : '🌙 Mørk'}
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-8 pt-16 pb-24">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-7xl font-bold tracking-tighter mb-6">
              Få ro i din økonomi<br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">med din egen AI-coach</span>
            </h1>
          </div>

          {/* Upload */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-emerald-300 dark:border-emerald-700 rounded-3xl p-16 text-center mb-8 hover:border-emerald-500 transition-all"
          >
            <div className="text-7xl mb-6">📤</div>
            <h3 className="text-3xl font-semibold mb-4">Drop dine CSV-filer her</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8">eller</p>
            
            <label className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xl px-10 py-5 rounded-3xl cursor-pointer hover:scale-105 transition shadow-xl">
              Vælg filer
              <input type="file" accept=".csv" multiple onChange={(e) => handleFileSelect(e.target.files)} className="hidden" />
            </label>
          </div>

          {/* Quick Summary + Filters */}
          {transactions.length > 0 && (
            <>
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow p-6 mb-6 flex justify-between items-center border border-gray-100 dark:border-slate-800">
                <div>
                  <div className="text-sm text-gray-500">Samlet saldo</div>
                  <div className={`text-4xl font-bold ${totalBalance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalBalance.toLocaleString('da-DK')} kr
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div>Transaktioner: <span className="font-semibold">{transactions.length}</span></div>
                </div>
              </div>

              <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
              <CategoryFilter transactions={transactions} selectedCategory={selectedCategory} onCategoryClick={handleCategoryClick} />
              <DateFilter onFilterChange={setDateRange} activeFilter={activeFilter} onReset={resetDateFilter} />
            </>
          )}

          {/* Progress */}
          {isLoading && (
            <div className="max-w-md mx-auto mb-8">
              <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className="h-2 bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-center text-sm mt-2">{status}</p>
            </div>
          )}

          {/* Main Content */}
          {transactions.length > 0 && (
            <div className="space-y-12">
              <TransactionTable 
                transactions={filteredTransactions} 
                onCategoryFilter={handleCategoryClick}
                onDelete={(index) => {
                  const newList = [...transactions];
                  newList.splice(index, 1);
                  setTransactions(newList);
                }}
                onEdit={(index) => {
                  const originalIndex = transactions.findIndex(t => t === filteredTransactions[index]);
                  setEditingTransaction({ transaction: filteredTransactions[index], index: originalIndex });
                }}
              />
              
              <BudgetVisualizer 
                transactions={transactions} 
                onCategoryClick={handleCategoryClick} 
                onAskAI={() => setShowAIChat(true)} 
              />
              
              <MonthlyOverview transactions={transactions} />
              <SmartInsights transactions={transactions} />
              <BudgetGoals transactions={transactions} />
              <SmartBudgetGenerator transactions={transactions} onAskAI={() => setShowAIChat(true)} />
              <AddTransaction onAdd={(t) => setTransactions([...transactions, t])} />
            </div>
          )}

          {!isLoading && transactions.length === 0 && (
            <div className="text-center py-20">
              <div className="text-8xl mb-6 opacity-60">📊</div>
              <p className="text-2xl text-gray-600 dark:text-gray-400">Upload dit bankudtog eller indlæs eksempeldata</p>
            </div>
          )}
        </div>

        {/* Floating AI Button */}
        {transactions.length > 0 && (
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-3xl shadow-2xl flex items-center justify-center text-4xl hover:scale-110 transition-all z-50"
          >
            💬
          </button>
        )}

        {showAIChat && <AIChat transactions={transactions} onClose={() => setShowAIChat(false)} />}

        {editingTransaction && (
          <EditTransactionModal
            transaction={editingTransaction.transaction}
            index={editingTransaction.index}
            onClose={() => setEditingTransaction(null)}
            onSave={(updated, index) => {
              const newList = [...transactions];
              newList[index] = updated;
              setTransactions(newList);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default App;