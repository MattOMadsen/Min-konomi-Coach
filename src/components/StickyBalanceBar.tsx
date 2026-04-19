interface Props {
  filteredBalance: number;
  filteredIncome: number;
  filteredExpenses: number;
  hasActiveFilters: boolean;
}

export default function StickyBalanceBar({ 
  filteredBalance, 
  filteredIncome, 
  filteredExpenses, 
  hasActiveFilters 
}: Props) {
  const isPositive = filteredBalance >= 0;
  const savingsRate = filteredIncome > 0 
    ? Math.round(((filteredIncome - filteredExpenses) / filteredIncome) * 100) 
    : 0;

  return (
    <div className="sticky top-[73px] z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b shadow-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-3">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          
          {/* Venstre side - Saldo */}
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs text-gray-500">Aktuel saldo</div>
              <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {filteredBalance.toLocaleString('da-DK')} kr
              </div>
            </div>
            
            {hasActiveFilters && (
              <div className="hidden sm:block px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                Filtreret
              </div>
            )}
          </div>

          {/* Højre side - Detaljer */}
          <div className="flex items-center gap-6 text-sm">
            <div className="text-right">
              <div className="text-emerald-600 text-xs">Indtægter</div>
              <div className="font-semibold text-emerald-700">+{filteredIncome.toLocaleString('da-DK')} kr</div>
            </div>
            
            <div className="text-right">
              <div className="text-red-600 text-xs">Udgifter</div>
              <div className="font-semibold text-red-700">-{filteredExpenses.toLocaleString('da-DK')} kr</div>
            </div>

            <div className="hidden sm:block border-l pl-6 text-right">
              <div className="text-gray-500 text-xs">Opsparing</div>
              <div className={`font-bold ${savingsRate >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {savingsRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}