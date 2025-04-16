export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash';
  color?: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  categoryId: string;
  category: string;
  categoryName?: string;
  walletId: string;
  walletName?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense" | "both";
  isCustom?: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  period: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
}

export interface FinancialSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
}

export interface Gam3eya {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  contributionAmount: number;
  numberOfParticipants: number;
  organizerId: string;
}

export interface Gam3eyaPayment {
  id: string;
  gam3eyaId: string;
  participantId: string;
  paymentDate: string;
  amount: number;
}
