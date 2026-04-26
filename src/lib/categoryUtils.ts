// src/lib/categoryUtils.ts
import type { Transaction } from '../types';

export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  transactions: Transaction[];
  average: number;
}

/**
 * Filtrer transaktioner for en specifik kategori
 */
export function getTransactionsByCategory(
  transactions: Transaction[],
  category: string
): Transaction[] {
  return transactions
    .filter(t => t.category === category)
    .sort((a, b) => b.date.localeCompare(a.date)); // Nyeste først
}

/**
 * Lav en oversigt over alle kategorier (med total, antal osv.)
 */
export function getAllCategorySummaries(
  transactions: Transaction[]
): CategorySummary[] {
  const grouped = transactions.reduce((acc, t) => {
    if (!acc[t.category]) {
      acc[t.category] = [];
    }
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, Transaction[]>);

  return Object.entries(grouped).map(([category, items]) => {
    const total = items.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return {
      category,
      total,
      count: items.length,
      transactions: items.sort((a, b) => b.date.localeCompare(a.date)),
      average: items.length > 0 ? Math.round(total / items.length) : 0,
    };
  }).sort((a, b) => b.total - a.total); // Største først
}

/**
 * Find de største udgiftskategorier (top N)
 */
export function getTopCategories(
  transactions: Transaction[],
  limit: number = 8
): CategorySummary[] {
  return getAllCategorySummaries(transactions).slice(0, limit);
}

/**
 * Tjek om en kategori er "fast udgift" (baseret på navn)
 */
export function isRecurringCategory(category: string): boolean {
  const recurringKeywords = [
    'husleje', 'el', 'vand', 'varme', 'internet', 'mobil', 
    'forsikring', 'abonnement', 'spotify', 'netflix', 'youtube'
  ];
  const lower = category.toLowerCase();
  return recurringKeywords.some(kw => lower.includes(kw));
}

/**
 * Beregn realistisk månedligt gennemsnit for en kategori
 */
export function getMonthlyAverageForCategory(
  transactions: Transaction[],
  category: string
): number {
  const catTransactions = getTransactionsByCategory(transactions, category);
  if (catTransactions.length === 0) return 0;

  const months = new Set(catTransactions.map(t => t.date.substring(0, 7))); // YYYY-MM
  const total = catTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return months.size > 0 ? Math.round(total / months.size) : 0;
}