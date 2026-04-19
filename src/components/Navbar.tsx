interface Props {
  onLoadSample: () => void;
  onExportAll: () => void;
  onExportFiltered: () => void;
  onExportPDF: () => void;
  onClearData: () => void;
  hasTransactions: boolean;
}

export default function Navbar({ 
  onLoadSample, 
  onExportAll, 
  onExportFiltered, 
  onExportPDF, 
  onClearData, 
  hasTransactions 
}: Props) {
  return (
    <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl flex items-center justify-center text-2xl sm:text-3xl">💰</div>
          <span className="font-bold text-2xl sm:text-3xl tracking-tighter">Min Økonomi Coach</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 justify-center">
          <button onClick={onLoadSample} className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-slate-800 rounded-2xl transition">Eksempel</button>
          
          {hasTransactions && (
            <>
              <button onClick={onExportAll} className="px-3 py-2 text-xs sm:text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-2xl transition">Excel (alle)</button>
              <button onClick={onExportFiltered} className="px-3 py-2 text-xs sm:text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-2xl transition">Eksporter visning</button>
              <button onClick={onExportPDF} className="px-3 py-2 text-xs sm:text-sm font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-2xl transition">PDF</button>
              <button onClick={onClearData} className="px-3 py-2 text-xs sm:text-sm font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-2xl transition">Ryd</button>
            </>
          )}
          
          {/* Dark mode toggle midlertidigt slået fra */}
          {/* 
          <button 
            onClick={setDarkMode} 
            className="px-3 py-2 text-xs sm:text-sm font-medium bg-gray-100 dark:bg-slate-800 rounded-2xl transition"
          >
            {darkMode ? '☀️ Lys' : '🌙 Mørk'}
          </button>
          */}
        </div>
      </div>
    </nav>
  );
}