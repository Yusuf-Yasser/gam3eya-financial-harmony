
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  categoryName?: string;
  type: 'income' | 'expense';
  walletId: string;
  receiptUrl?: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'savings' | 'gam3eya' | 'custom';
  currency?: string;
  icon?: string;
  color?: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon?: string;
  color?: string;
  isCustom?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  categoryName?: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'weekly' | 'yearly' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface Gam3eya {
  id: string;
  name: string;
  totalAmount: number;
  contributionAmount: number;
  members: number;
  startDate: string;
  endDate: string;
  currentCycle: number;
  totalCycles: number;
  isAdmin: boolean;
  nextPaymentDate: string;
  myTurn?: number;
  paidCycles?: number[];
  receivedPayout?: boolean;
}

export interface Gam3eyaPayment {
  id: string;
  gam3eyaId: string;
  walletId: string;
  amount: number;
  date: string;
  cycle: number;
  type: 'payment' | 'payout';
}
