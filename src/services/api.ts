
import axios from 'axios';
import { Transaction, Wallet, Category, Budget, FinancialSummary, Gam3eya, Gam3eyaPayment } from '@/types';
import { getToken } from './auth';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ensure dates are consistently formatted when sent to the server
  transformRequest: [
    (data, headers) => {
      // If no data, return
      if (!data) return data;
      
      // Create a deep copy to avoid mutating the original
      const transformedData = JSON.parse(JSON.stringify(data));
      
      // Process date fields recursively - convert Date objects to YYYY-MM-DD strings
      const processObject = (obj) => {
        if (!obj || typeof obj !== 'object') return;
        
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          
          // Handle Date objects or ISO date strings
          if (
            value instanceof Date ||
            (typeof value === 'string' && 
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value))
          ) {
            const date = new Date(value);
            obj[key] = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
          } 
          // Recursively process nested objects
          else if (value && typeof value === 'object') {
            processObject(value);
          }
        });
      };
      
      processObject(transformedData);
      return JSON.stringify(transformedData);
    }
  ],
});

// Add auth token to every request
api.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Categories API
export const categoriesApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  
  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const newCategory = { 
      ...category, 
      id: `cat_${Date.now()}`,
      // Ensure the icon is included in the request
      icon: category.icon || 'CreditCard' 
    };
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
  
  create: async (budget: Omit<Budget, 'id'>): Promise<any> => {
    const newBudget = { ...budget, id: `b_${Date.now()}` };
    const response = await api.post('/budgets', newBudget);
    return response.data;
  }
};

// Gam3eya API
export const gam3eyaApi = {
  getAll: async (): Promise<Gam3eya[]> => {
    const response = await api.get('/gam3eyas');
    return response.data;
  },
  
  create: async (gam3eya: Omit<Gam3eya, 'id'>): Promise<Gam3eya> => {
    const newGam3eya = { ...gam3eya, id: `g_${Date.now()}` };
    await api.post('/gam3eyas', newGam3eya);
    return newGam3eya as Gam3eya;
  },
  
  update: async (gam3eya: Gam3eya): Promise<Gam3eya> => {
    await api.put(`/gam3eyas/${gam3eya.id}`, gam3eya);
    return gam3eya;
  },
  
  delete: async (id: string): Promise<void> => {
    await api.delete(`/gam3eyas/${id}`);
  },
  
  makePayment: async (payment: Omit<Gam3eyaPayment, 'id'>): Promise<Gam3eyaPayment> => {
    const newPayment = { ...payment, id: `gp_${Date.now()}` };
    await api.post('/gam3eya-payments', newPayment);
    return newPayment as Gam3eyaPayment;
  },
  
  getPayments: async (gam3eyaId: string): Promise<Gam3eyaPayment[]> => {
    const response = await api.get(`/gam3eya-payments/${gam3eyaId}`);
    return response.data;
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
