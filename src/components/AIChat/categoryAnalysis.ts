// 1 fil - 1 funktion
// Kategorisering af udgifter + overblik

import type { Transaction } from '../../parsers/csvParser';

const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('da-DK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

export const analyzeCategories = (transactions: Transaction[], withOverview: boolean = false): string => {
  const categories = new Map<string, number>();

  transactions.forEach(t => {
    if (t.amount >= 0) return;

    const desc = t.description.toLowerCase().trim();
    let category = 'Diverse';

    if (desc.includes('husleje') || desc.includes('leje')) category = 'Husleje';
    else if (desc.includes('netto') || desc.includes('føtex') || desc.includes('rema') || desc.includes('lidl') || desc.includes('dagligvarer')) category = 'Dagligvarer';
    else if (desc.includes('just eat') || desc.includes('wolt') || desc.includes('takeaway') || desc.includes('pizza') || desc.includes('sushi') || desc.includes('burger') || desc.includes('kebab') || desc.includes('thai')) category = 'Takeaway & mad ude';
    else if (desc.includes('café') || desc.includes('coffee') || desc.includes('espresso')) category = 'Café & kaffe';
    else if (desc.includes('shell') || desc.includes('circle k') || desc.includes('benzin') || desc.includes('diesel')) category = 'Benzin & bil';
    else if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('abonnement')) category = 'Abonnementer';
    else if (desc.includes('h&m') || desc.includes('tøj') || desc.includes('matas') || desc.includes('hudpleje')) category = 'Tøj & personlig pleje';
    else if (desc.includes('el') || desc.includes('vand') || desc.includes('varme')) category = 'Boligudgifter (el/vand/varme)';
    else if (desc.includes('forsikring')) category = 'Forsikringer';

    categories.set(category, (categories.get(category) || 0) + Math.abs(t.amount));
  });

  const sorted = Array.from(categories.entries()).sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return "Ingen udgifter fundet til analyse.";
  }

  let response = withOverview 
    ? `**Økonomisk overblik + største kategorier**\n\n`
    : `**Dine største udgiftskategorier**\n\n`;

  // Top 6 kategorier
  sorted.slice(0, 6).forEach(([cat, amount], index) => {
    response += `${index + 1}. ${cat} — ${formatAmount(amount)} kr\n`;
  });

  if (withOverview) {
    const totalExpenses = sorted.reduce((sum, [, amt]) => sum + amt, 0);
    response += `\nSamlede udgifter: ${formatAmount(totalExpenses)} kr over 3 måneder\n`;
    response += `Største mulige besparelser ligger i Takeaway, Café og Dagligvarer.`;
  }

  return response;
};