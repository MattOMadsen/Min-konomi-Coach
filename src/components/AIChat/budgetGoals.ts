// 1 fil - 1 funktion
// Budgetmål med intelligente varsler (over budget, tæt på grænse, godt klaret)

import { useState } from 'react';
import type { Transaction } from '../../parsers/csvParser';

export type BudgetGoals = Map<string, number>;
export type SetBudgetGoal = (category: string, amount: number) => void;
export type GetBudgetStatus = () => string;

export const useBudgetGoals = (transactions: Transaction[]) => {
  const [budgetGoals, setBudgetGoalsState] = useState<BudgetGoals>(new Map());

  const setBudgetGoal: SetBudgetGoal = (category: string, amount: number) => {
    setBudgetGoalsState(prev => {
      const newMap = new Map(prev);
      newMap.set(category, amount);
      return newMap;
    });
  };

  const getBudgetStatus: GetBudgetStatus = () => {
    if (budgetGoals.size === 0) {
      return `Du har ikke sat nogen budgetmål endnu.\n\nPrøv at skrive:\n"Sæt budgetmål på 8000 kr til takeaway"`;
    }

    // Beregn faktiske udgifter pr. kategori over hele perioden
    const categorySpending = new Map<string, number>();
    transactions.forEach(t => {
      if (t.amount >= 0) return;
      const desc = t.description.toLowerCase();
      let cat = 'Diverse';

      if (desc.includes('takeaway') || desc.includes('wolt') || desc.includes('just eat') || desc.includes('pizza') || desc.includes('sushi')) cat = 'Takeaway & mad ude';
      else if (desc.includes('café') || desc.includes('coffee')) cat = 'Café & kaffe';
      else if (desc.includes('netto') || desc.includes('føtex') || desc.includes('dagligvarer')) cat = 'Dagligvarer';
      else if (desc.includes('benzin') || desc.includes('shell') || desc.includes('circle k')) cat = 'Benzin & bil';
      else if (desc.includes('husleje') || desc.includes('leje')) cat = 'Husleje';

      categorySpending.set(cat, (categorySpending.get(cat) || 0) + Math.abs(t.amount));
    });

    let response = `**📊 Dine budgetmål og varsler**\n\n`;

    let hasWarning = false;

    budgetGoals.forEach((monthlyGoal, category) => {
      const actualSpending = categorySpending.get(category) || 0;
      const avgMonthlyActual = Math.round(actualSpending / 3); // grov fordeling over 3 måneder
      const difference = avgMonthlyActual - monthlyGoal;
      const percentUsed = monthlyGoal > 0 ? Math.round((avgMonthlyActual / monthlyGoal) * 100) : 0;

      response += `**${category}**\n`;
      response += `Mål: ${monthlyGoal.toLocaleString('da-DK')} kr/måned\n`;
      response += `Faktisk (gennemsnit): ${avgMonthlyActual.toLocaleString('da-DK')} kr/måned (${percentUsed}%)\n`;

      // Intelligente varsler
      if (percentUsed >= 100) {
        response += `→ **Over budget!** Du er ${difference.toLocaleString('da-DK')} kr over pr. måned ⚠️⚠️\n\n`;
        hasWarning = true;
      } 
      else if (percentUsed >= 85) {
        response += `→ **Tæt på grænsen** – du har kun ${100 - percentUsed}% tilbage denne måned ⚠️\n\n`;
        hasWarning = true;
      } 
      else if (percentUsed <= 50) {
        response += `→ **Godt klaret!** Du er under budget ✅\n\n`;
      } 
      else {
        response += `→ Du ligger fint inden for budgettet ✅\n\n`;
      }
    });

    if (hasWarning) {
      response += `💡 **Tip:** Overvej at justere dine vaner i de kategorier hvor du er over budget.`;
    } else {
      response += `🎉 Du klarer dig godt med dine budgetmål!`;
    }

    return response;
  };

  return {
    budgetGoals,
    setBudgetGoal,
    getBudgetStatus,
  };
};