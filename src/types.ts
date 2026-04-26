// src/types.ts
// ... din eksisterende kode ...

// NYE TILFØJELSER TIL KATEGORI DRILL-DOWN
export interface CategorySummary {
  category: string;
  total: number;
  count: number;
  transactions: Transaction[];
  average: number;
}

export interface SelectedCategory {
  category: string;
  title?: string;
}