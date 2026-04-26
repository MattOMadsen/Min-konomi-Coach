// src/components/MainContent.tsx
import { useState } from 'react';
import TransactionTable from './TransactionTable';
import BudgetVisualizer from './BudgetVisualizer';
import MonthlyOverview from './MonthlyOverview';
import SmartInsights from './SmartInsights';
import BudgetGoals from './BudgetGoals';
import AddTransaction from './AddTransaction';
import SmartBudgetGenerator from './SmartBudgetGenerator';
import RecurringTransactions from './RecurringTransactions';
import AIChat from './AIChat';
import EditTransactionModal from './EditTransactionModal';
import DateRangeFilter from './DateRangeFilter';

interface Props {
  transactions: any[];
  isLoading: boolean;
  progress: number;
  status: string;
  onDelete: (index: number) => void;
  onEdit: (index: number) => void;
  onDuplicate: (index: number) => void;
  onAskAI: () => void;
  showAIChat: boolean;
  onCloseAIChat: () => void;
  editingTransaction: any;
  onCloseEditModal: () => void;
  onSaveEdit: (updated: any, index: number) => void;
  setTransactions: (transactions: any[]) => void;
}

export default function MainContent({
  transactions,
  isLoading,
  progress,
  status,
  onDelete,
  onEdit,
  onDuplicate,
  onAskAI,
  showAIChat,
  onCloseAIChat,
  editingTransaction,
  onCloseEditModal,
  onSaveEdit,
  setTransactions,
}: Props) {
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ 
    start: null, 
    end: null 
  });

  // Filtrer transaktioner baseret på dato
  const filteredTransactions = transactions.filter(t => {
    if (!dateRange.start && !dateRange.end) return true;
    
    const tDate = t.date;
    
    if (dateRange.start && tDate < dateRange.start) return false;
    if (dateRange.end && tDate > dateRange.end) return false;
    
    return true;
  });

  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setDateRange({ start, end });
  };

  return (
    <>
      {/* Progress + Fejlhåndtering */}
      {isLoading && (
        <div className="max-w-md mx-auto mb-8">
          <div className="h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className="h-2 bg-emerald-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">{status}</p>
        </div>
      )}

      {status.includes('Fejl') || status.includes('Error') && (
        <div className="max-w-md mx-auto mb-8 text-center">
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-2xl p-6">
            <div className="text-red-600 text-4xl mb-3">⚠️</div>
            <p className="text-red-700 dark:text-red-400 font-medium mb-4">{status}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-red-600 text-white rounded-2xl text-sm font-medium hover:bg-red-700 transition"
            >
              Prøv igen
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {transactions.length > 0 && (
        <div className="space-y-10 sm:space-y-12">
          
          {/* Kun ÉN Date Range Filter */}
          <DateRangeFilter 
            onDateRangeChange={handleDateRangeChange}
            currentStart={dateRange.start}
            currentEnd={dateRange.end}
          />

          <TransactionTable 
            transactions={filteredTransactions} 
            onDelete={onDelete}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
          />
          
          <BudgetVisualizer 
            transactions={filteredTransactions} 
            onAskAI={onAskAI} 
          />
          
          <RecurringTransactions transactions={filteredTransactions} />
          
          <MonthlyOverview transactions={filteredTransactions} />
          
          <SmartInsights transactions={filteredTransactions} />
          <BudgetGoals transactions={filteredTransactions} />
          <SmartBudgetGenerator transactions={filteredTransactions} onAskAI={onAskAI} />
          <AddTransaction onAdd={(t) => setTransactions([...transactions, t])} />
        </div>
      )}

      {!isLoading && transactions.length === 0 && (
        <div className="text-center py-16 sm:py-20">
          <div className="text-7xl sm:text-8xl mb-6 opacity-60">📊</div>
          <p className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400">
            Upload dit bankudtog eller indlæs eksempeldata
          </p>
        </div>
      )}

      {/* Modals */}
      {showAIChat && <AIChat transactions={transactions} onClose={onCloseAIChat} />}
      
      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction.transaction}
          index={editingTransaction.index}
          onClose={onCloseEditModal}
          onSave={onSaveEdit}
        />
      )}
    </>
  );
}