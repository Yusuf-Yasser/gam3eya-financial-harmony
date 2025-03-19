// Dummy data for the app

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  walletId: string;
  receiptUrl?: string;
}

export interface Wallet {
  id: string;
  name: string;
  balance: number;
  type: 'cash' | 'bank' | 'savings' | 'gam3eya' | 'custom';
  icon?: string;
  color?: string;
}

export interface Budget {
  id: string;
  category: string;
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
}

// Categories with icons
export const categories = [
  { id: 'food', name: 'food', icon: 'utensils' },
  { id: 'transport', name: 'transport', icon: 'car' },
  { id: 'housing', name: 'housing', icon: 'home' },
  { id: 'utilities', name: 'utilities', icon: 'lightbulb' },
  { id: 'healthcare', name: 'healthcare', icon: 'heart' },
  { id: 'personal', name: 'personal', icon: 'user' },
  { id: 'entertainment', name: 'entertainment', icon: 'tv' },
  { id: 'education', name: 'education', icon: 'book' },
  { id: 'debt', name: 'debt', icon: 'credit-card' },
  { id: 'other', name: 'other', icon: 'ellipsis-h' },
];

// Dummy wallets
export const wallets: Wallet[] = [
  {
    id: 'w1',
    name: 'Cash',
    balance: 5000,
    type: 'cash',
    color: '#83C5BE',
  },
  {
    id: 'w2',
    name: 'Bank Account',
    balance: 15000,
    type: 'bank',
    color: '#006D77',
  },
  {
    id: 'w3',
    name: 'Savings',
    balance: 10000,
    type: 'savings',
    color: '#E29578',
  },
  {
    id: 'w4',
    name: 'Family Gam3eya',
    balance: 8000,
    type: 'gam3eya',
    color: '#FFDDD2',
  },
];

// Dummy transactions - updated for March 2025
export const transactions: Transaction[] = [
  {
    id: 't1',
    amount: 500,
    type: 'expense',
    category: 'food',
    description: 'Grocery shopping',
    date: '2025-03-15',
    walletId: 'w1',
  },
  {
    id: 't2',
    amount: 1000,
    type: 'expense',
    category: 'transport',
    description: 'Uber rides',
    date: '2025-03-14',
    walletId: 'w1',
  },
  {
    id: 't3',
    amount: 10000,
    type: 'income',
    category: 'other',
    description: 'Salary',
    date: '2025-03-01',
    walletId: 'w2',
  },
  {
    id: 't4',
    amount: 2000,
    type: 'expense',
    category: 'entertainment',
    description: 'Cinema tickets',
    date: '2025-03-10',
    walletId: 'w2',
  },
  {
    id: 't5',
    amount: 3000,
    type: 'expense',
    category: 'housing',
    description: 'Rent',
    date: '2025-03-05',
    walletId: 'w2',
  },
  {
    id: 't6',
    amount: 2000,
    type: 'income',
    category: 'other',
    description: 'Freelance work',
    date: '2025-03-12',
    walletId: 'w3',
  },
  // Add some previous month transactions for February 2025
  {
    id: 't7',
    amount: 450,
    type: 'expense',
    category: 'food',
    description: 'Grocery shopping',
    date: '2025-02-15',
    walletId: 'w1',
  },
  {
    id: 't8',
    amount: 950,
    type: 'expense',
    category: 'transport',
    description: 'Uber rides',
    date: '2025-02-14',
    walletId: 'w1',
  },
  {
    id: 't9',
    amount: 9500,
    type: 'income',
    category: 'other',
    description: 'Salary',
    date: '2025-02-01',
    walletId: 'w2',
  },
  {
    id: 't10',
    amount: 1800,
    type: 'expense',
    category: 'entertainment',
    description: 'Cinema tickets',
    date: '2025-02-10',
    walletId: 'w2',
  }
];

// Dummy budgets
export const budgets: Budget[] = [
  {
    id: 'b1',
    category: 'food',
    amount: 2000,
    spent: 1200,
    period: 'monthly',
  },
  {
    id: 'b2',
    category: 'transport',
    amount: 1500,
    spent: 1000,
    period: 'monthly',
  },
  {
    id: 'b3',
    category: 'entertainment',
    amount: 3000,
    spent: 2000,
    period: 'monthly',
  },
];

// Dummy gam3eyas
export const gam3eyas: Gam3eya[] = [
  {
    id: 'g1',
    name: 'Family Gam3eya',
    totalAmount: 80000,
    contributionAmount: 2000,
    members: 10,
    startDate: '2025-01-01',
    endDate: '2025-10-31',
    currentCycle: 3,
    totalCycles: 10,
    isAdmin: true,
    nextPaymentDate: '2025-03-31',
  },
  {
    id: 'g2',
    name: 'Friends Gam3eya',
    totalAmount: 60000,
    contributionAmount: 1500,
    members: 8,
    startDate: '2025-01-01',
    endDate: '2025-08-31',
    currentCycle: 3,
    totalCycles: 8,
    isAdmin: false,
    nextPaymentDate: '2025-03-25',
  },
];

// Financial summary
export const financialSummary = {
  totalBalance: wallets.reduce((sum, wallet) => sum + wallet.balance, 0),
  totalIncome: transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0),
  totalExpenses: transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0),
  monthlySavings: 5000,
  monthlyBudget: 20000,
};
