
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
  walletId: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  icon?: string;
  color?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}
