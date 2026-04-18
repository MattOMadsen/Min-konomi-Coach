// 1 fil - 1 funktion
// Opdateret useAIResponses med meget bedre og mere naturlig budgetkommando-håndtering

import type { Transaction } from '../../parsers/csvParser';
import { analyzeTimeData } from './timeAnalysis';
import { analyzeCategories } from './categoryAnalysis';
import type { BudgetGoals, SetBudgetGoal, GetBudgetStatus } from './budgetGoals';

type ResponseHandler = (
  message: string,
  budgetGoals: BudgetGoals,
  setBudgetGoal: SetBudgetGoal,
  getBudgetStatus: GetBudgetStatus
) => Promise<string>;

export const useAIResponses = (transactions: Transaction[]): { handleUserMessage: ResponseHandler } => {
  
  const handleUserMessage: ResponseHandler = async (
    message: string,
    budgetGoals: BudgetGoals,
    setBudgetGoal: SetBudgetGoal,
    getBudgetStatus: GetBudgetStatus
  ) => {
    const lower = message.toLowerCase().trim();

    // 1. Hilsner
    if (lower === 'hej' || lower === 'hello' || lower === 'hi' || lower.includes('goddag') || lower.includes('dav')) {
      return `Hej! 😊\n\nJeg er din økonomi-coach. Jeg har analyseret dine transaktioner og er klar til at hjælpe.\n\nHvad vil du gerne arbejde med i dag?`;
    }

    // 2. Budgetmål – forbedret parsing og svar
    if (lower.includes('sæt budget') || lower.includes('budgetmål') || 
        (lower.includes('budget') && (lower.includes('kr') || lower.includes('mål')))) {
      return handleBudgetCommand(message, setBudgetGoal);
    }

    if (lower.includes('vis budget') || lower.includes('mine budget') || 
        lower.includes('budget status') || lower.includes('status på budget')) {
      return getBudgetStatus();
    }

    // 3. Tidsbaseret analyse
    if (lower.includes('tid') || lower.includes('måned') || lower.includes('trend') || 
        lower.includes('udvikling') || lower.includes('sammenlign')) {
      return analyzeTimeData(transactions);
    }

    // 4. Overblik
    if (lower.includes('overblik') || lower.includes('oversigt') || lower.includes('økonomi') || 
        lower.includes('det hele') || lower.includes('samlet')) {
      return analyzeCategories(transactions, true);
    }

    // 5. Største udgifter
    if (lower.includes('største') || lower.includes('flest') || lower.includes('hvor bruger') || 
        lower.includes('kategori')) {
      return analyzeCategories(transactions, false);
    }

    // 6. Spare penge
    if (lower.includes('spare') || lower.includes('besparelse') || lower.includes('reducere')) {
      return `Du har gode muligheder for at spare penge – især på takeaway, café og dagligvarer.\n\nVil du have konkrete forslag, eller skal jeg lave et "hvad-hvis" regnestykke?`;
    }

    // 7. Hvad-hvis
    if (lower.includes('hvad hvis') || lower.includes('hvad-hvis')) {
      return `Godt spørgsmål! Fortæl mig præcist hvad du vil ændre, så laver jeg et konkret regnestykke for dig.\n\nEksempel: "Hvad hvis jeg halverer mit takeaway-forbrug"`;
    }

    // Default
    return `Tak for dit spørgsmål! 👍\n\nJeg kan hjælpe med overblik, månedsanalyse, budgetmål og spareforslag.\n\nHvad vil du gerne have hjælp til?`;
  };

  return { handleUserMessage };
};

// ==================== FORBEDRET BUDGETKOMMANDO ====================
const handleBudgetCommand = (message: string, setBudgetGoal: SetBudgetGoal): string => {
  const lower = message.toLowerCase();

  // Bedre parsing af beløb (håndterer "8000 kr", "8.000", "8000,-" osv.)
  const amountMatch = message.match(/(\d{1,3}(?:\.\d{3})*|\d+)\s*(?:kr|,-)?/i);
  const amount = amountMatch ? parseInt(amountMatch[1].replace(/\./g, '')) : null;

  if (!amount || amount < 100) {
    return `Jeg kunne ikke finde et gyldigt beløb i din besked.\n\nPrøv igen, fx:\n"Sæt budgetmål på 8000 kr til takeaway"`;
  }

  // Bedre kategoridetect
  let category = 'Mad og drikke';
  if (lower.includes('takeaway') || lower.includes('mad ude') || lower.includes('wolt') || lower.includes('just eat')) {
    category = 'Takeaway & mad ude';
  } else if (lower.includes('café') || lower.includes('kaffe') || lower.includes('coffee')) {
    category = 'Café & kaffe';
  } else if (lower.includes('dagligvarer') || lower.includes('netto') || lower.includes('føtex') || lower.includes('indkøb')) {
    category = 'Dagligvarer';
  } else if (lower.includes('benzin') || lower.includes('shell') || lower.includes('circle k')) {
    category = 'Benzin & bil';
  } else if (lower.includes('husleje') || lower.includes('leje')) {
    category = 'Husleje';
  } else if (lower.includes('abonnement') || lower.includes('netflix') || lower.includes('spotify')) {
    category = 'Abonnementer';
  }

  setBudgetGoal(category, amount);

  return `✅ Perfekt! Budgetmål er nu sat.\n\n` +
         `**${category}**\n` +
         `Maksimalt beløb pr. måned: ${amount.toLocaleString('da-DK')} kr\n\n` +
         `Jeg vil fremover sammenligne dine faktiske udgifter med dette mål.\n\n` +
         `Skriv "vis budgetmål" når du vil se status på alle dine mål.`;
};