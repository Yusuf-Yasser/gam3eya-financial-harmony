import axios from 'axios';
import { Transaction, Wallet, Category, Budget, FinancialSummary } from '@/types';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const newCategory = { ...category, id: `cat_${Date.now()}` };
    await api.post('/categories', newCategory);
    return newCategory as Category;
  }
};

// Wallets API
export const walletsApi = {
  getAll: async (): Promise<Wallet[]> => {
    const response = await api.get('/wallets');
    return response.data;
  },
  
  create: async (wallet: Omit<Wallet, 'id'>): Promise<Wallet> => {
    const newWallet = { ...wallet, id: `w_${Date.now()}` };
    await api.post('/wallets', newWallet);
    return newWallet as Wallet;
  },
  
  update: async (wallet: Wallet): Promise<Wallet> => {
    await api.put(`/wallets/${wallet.id}`, wallet);
    return wallet;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/wallets/${id}`);
  }
};

// Transactions API
export const transactionsApi = {
  getAll: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },
  
  create: async (transaction: Omit<Transaction, 'id'>): Promise<Transaction> => {
    const newTransaction = { ...transaction, id: `t_${Date.now()}` };
    await api.post('/transactions', newTransaction);
    return newTransaction as Transaction;
  },
  
  update: async (transaction: Transaction): Promise<Transaction> => {
    await api.put(`/transactions/${transaction.id}`, transaction);
    return transaction;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/transactions/${id}`);
  }
};

// Budgets API
export const budgetsApi = {
  getAll: async (): Promise<Budget[]> => {
    const response = await api.get('/budgets');
    return response.data;
  },
  
  create: async (budget: Omit<Budget, 'id'>): Promise<Budget> => {
    const newBudget = { ...budget, id: `b_${Date.now()}` };
    await api.post('/budgets', newBudget);
    return newBudget as Budget;
  }
};

// Financial Summary API
export const financialSummaryApi = {
  get: async (): Promise<FinancialSummary> => {
    const response = await api.get('/financial-summary');
    return response.data;
  }
};

export default api;
