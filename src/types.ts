export interface Transaction {
  date: string;
  description: string;
  amount: number;
  category?: string;
}

export interface BankParser {
  name: string;
  detect: (filename: string) => boolean;
  parse: (csvText: string) => Transaction[];
}