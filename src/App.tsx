// 1 fil - 1 funktion
// App.tsx – nu helt ren, centreret og vertikal layout (ingen skævhed)

import { useState, useMemo } from 'react';
import type { Transaction } from './parsers/csvParser';
import TransactionTable from './components/TransactionTable';
import AIChat from './components/AIChat';
import BudgetVisualizer from './components/BudgetVisualizer';

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAIChat, setShowAIChat] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setTransactions([]);
    setSelectedCategory(null);
    setShowAIChat(false);
    setIsLoading(true);
    setStatus('Læser fil...');
    setProgress(0);
    setProgressStatus('Starter parsing...');

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target?.result as string;
      if (!csvText) {
        setStatus('❌ Kunne ikke læse filen');
        setIsLoading(false);
        return;
      }

      const worker = new Worker(
        new URL('./parsers/csvWorker.ts', import.meta.url),
        { type: 'module' }
      );

      worker.onmessage = (msg: MessageEvent) => {
        const { type, progress: p, status: statusText, transactions: parsed, error } = msg.data;

        if (type === 'progress') {
          setProgress(p);
          setProgressStatus(statusText);
        } else if (type === 'complete') {
          setTransactions(parsed);
          setStatus(`✅ Fandt ${parsed.length} transaktioner fra ${file.name}`);
          setProgress(100);
          worker.terminate();
          setIsLoading(false);
        } else if (type === 'error') {
          setStatus(`❌ Fejl: ${error || 'Ukendt fejl i worker'}`);
          worker.terminate();
          setIsLoading(false);
        }
      };

      worker.postMessage({ csvText, filename: file.name });
    };

    reader.onerror = () => {
      setStatus('❌ Kunne ikke læse filen');
      setIsLoading(false);
    };

    reader.readAsText(file, 'utf-8');
  };

  const displayedTransactions = useMemo(() => {
    if (!selectedCategory) return transactions;
    return transactions.filter(t => {
      if (t.amount >= 0) return false;
      const desc = t.description.toLowerCase();
      let cat = 'Diverse';
      if (desc.includes('takeaway') || desc.includes('wolt') || desc.includes('just eat')) cat = 'Takeaway';
      else if (desc.includes('netto') || desc.includes('føtex') || desc.includes('rema')) cat = 'Dagligvarer';
      else if (desc.includes('café') || desc.includes('coffee')) cat = 'Café';
      else if (desc.includes('benzin') || desc.includes('shell')) cat = 'Benzin & bil';
      else if (desc.includes('husleje') || desc.includes('leje')) cat = 'Husleje';
      else if (desc.includes('netflix') || desc.includes('spotify')) cat = 'Abonnementer';
      return cat === selectedCategory;
    });
  }, [transactions, selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(prev => (prev === category ? null : category));
  };

  const handleAskAI = (question: string) => {
    setShowAIChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
      {/* Nav */}
      <nav className="bg-white/70 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-emerald-600 rounded-3xl flex items-center justify-center text-3xl shadow-inner">💰</div>
            <span className="font-bold text-3xl tracking-tight text-gray-900">Økonomi Coach</span>
          </div>
          <div className="text-sm font-medium text-emerald-700 bg-emerald-100 px-4 py-2 rounded-2xl">Testversion 0.6</div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-8 pt-20 pb-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold leading-none tracking-tighter text-gray-900 mb-6">
            Få ro i din økonomi<br />
            <span className="bg-gradient-to-r from-blue-600 via-emerald-600 to-teal-500 bg-clip-text text-transparent">med din egen AI-coach</span>
          </h1>
          <p className="text-2xl text-gray-600">
            Upload dit bankudtog.<br />
            Få klare, personlige råd på dansk – på 30 sekunder.
          </p>
        </div>

        {/* Upload knap – centreret */}
        <div className="flex justify-center mb-8">
          <label className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-xl py-7 px-14 rounded-3xl flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl cursor-pointer">
            <span className="text-4xl">📤</span>
            <div>
              Upload bankudtog<br />
              <span className="text-sm opacity-90">CSV fra danske banker</span>
            </div>
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {selectedFile && (
          <div className="flex justify-center mb-12">
            <div className="bg-white border border-emerald-200 rounded-2xl px-6 py-3 flex items-center gap-3">
              <span className="text-emerald-600 text-2xl">✅</span>
              <p className="text-emerald-700 font-medium">
                Fil valgt: <span className="font-semibold">{selectedFile.name}</span>
              </p>
            </div>
          </div>
        )}

        {/* Resultater – kommer lige under upload */}
        {transactions.length > 0 && (
          <div className="space-y-12">
            <TransactionTable transactions={displayedTransactions} />
            <BudgetVisualizer 
              transactions={transactions}
              onCategoryClick={handleCategoryClick}
              onAskAI={handleAskAI}
            />
          </div>
        )}

        {!isLoading && transactions.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center">
              <div className="text-7xl mb-6">📤</div>
              <p className="text-2xl text-gray-600">Upload din CSV-fil for at starte</p>
              <p className="text-gray-500 mt-2">Derefter vises dine transaktioner og budget her</p>
            </div>
          </div>
        )}
      </div>

      {/* Lille floating chat-icon */}
      {transactions.length > 0 && (
        <>
          <button
            onClick={() => setShowAIChat(!showAIChat)}
            className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl transition-all z-[100]"
          >
            💬
          </button>

          {showAIChat && (
            <div className="fixed bottom-28 right-8 w-96 h-[560px] bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden flex flex-col z-[100]">
              <AIChat transactions={transactions} />
            </div>
          )}
        </>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed top-8 right-8 bg-white rounded-3xl shadow-2xl p-6 w-72">
          <p className="text-emerald-600 font-medium mb-3">{progressStatus}</p>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-emerald-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;