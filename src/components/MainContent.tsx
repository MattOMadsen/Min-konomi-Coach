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

interface Props {
  transactions: any[];
  filteredTransactions: any[];
  isLoading: boolean;
  progress: number;
  status: string;
  selectedCategory: string | null;
  onCategoryClick: (category: string) => void;
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
  filteredTransactions,
  isLoading,
  progress,
  status,
  selectedCategory,
  onCategoryClick,
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

      {status.includes('Fejl') || status.includes('❌') && (
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
          <TransactionTable 
            transactions={filteredTransactions} 
            onCategoryFilter={onCategoryClick}
            onDelete={onDelete}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
          />
          
          <BudgetVisualizer 
            transactions={transactions} 
            onCategoryClick={onCategoryClick} 
            onAskAI={onAskAI} 
          />
          
          <RecurringTransactions transactions={transactions} />
          
          <MonthlyOverview transactions={transactions} />
          <SmartInsights transactions={transactions} />
          <BudgetGoals transactions={transactions} />
          <SmartBudgetGenerator transactions={transactions} onAskAI={onAskAI} />
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