import type { Transaction } from '../types';

export const categorizeTransaction = (description: string): string => {
  const desc = description.toLowerCase();

  if (desc.includes('takeaway') || desc.includes('wolt') || desc.includes('just eat') || desc.includes('pizza') || desc.includes('sushi') || desc.includes('burger')) {
    return 'Takeaway';
  }
  if (desc.includes('netto') || desc.includes('føtex') || desc.includes('rema') || desc.includes('lidl') || desc.includes('dagligvarer') || desc.includes('indkøb')) {
    return 'Dagligvarer';
  }
  if (desc.includes('café') || desc.includes('coffee') || desc.includes('espresso') || desc.includes('starbucks') || desc.includes('kaffe')) {
    return 'Café';
  }
  if (desc.includes('benzin') || desc.includes('shell') || desc.includes('circle k') || desc.includes('diesel') || desc.includes('ok')) {
    return 'Benzin';
  }
  if (desc.includes('husleje') || desc.includes('leje') || desc.includes('bolig')) {
    return 'Husleje';
  }
  if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('hbo') || desc.includes('disney') || desc.includes('abonnement')) {
    return 'Abonnementer';
  }
  if (desc.includes('tøj') || desc.includes('h&m') || desc.includes('matas') || desc.includes('hudpleje') || desc.includes('frisør')) {
    return 'Tøj & pleje';
  }
  if (desc.includes('el') || desc.includes('vand') || desc.includes('varme') || desc.includes('forsikring') || desc.includes('sundhed')) {
    return 'Bolig & sundhed';
  }
  if (desc.includes('gave') || desc.includes('fødselsdag') || desc.includes('jule') || desc.includes('velgørenhed')) {
    return 'Gaver';
  }

  return 'Diverse';
};

export const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Takeaway': '#ef4444',
    'Dagligvarer': '#f59e0b',
    'Café': '#8b5cf6',
    'Benzin': '#10b981',
    'Husleje': '#3b82f6',
    'Abonnementer': '#ec4899',
    'Tøj & pleje': '#14b8a6',
    'Bolig & sundhed': '#6366f1',
    'Gaver': '#f43f5e',
    'Diverse': '#64748b',
  };
  return colors[category] || '#64748b';
};