
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

// Default categories
const defaultExpenseCategories: Category[] = [
  { id: 'groceries', name: 'groceries', type: 'expense', color: '#83C5BE' },
  { id: 'transportation', name: 'transportation', type: 'expense', color: '#E29578' },
  { id: 'entertainment', name: 'entertainment', type: 'expense', color: '#006D77' },
  { id: 'dining_out', name: 'dining_out', type: 'expense', color: '#FFDDD2' },
  { id: 'utilities', name: 'utilities', type: 'expense', color: '#EDF6F9' },
  { id: 'housing', name: 'housing', type: 'expense', color: '#FF6B6B' },
  { id: 'healthcare', name: 'healthcare', type: 'expense', color: '#4ECDC4' },
  { id: 'clothing', name: 'clothing', type: 'expense', color: '#F7FFF7' },
  { id: 'education', name: 'education', type: 'expense', color: '#FFE66D' },
  { id: 'savings', name: 'savings', type: 'expense', color: '#6B5CA5' },
  { id: 'other', name: 'other', type: 'expense', color: '#8B5CF6' },
];

const defaultIncomeCategories: Category[] = [
  { id: 'salary', name: 'salary', type: 'income', color: '#0EA5E9' },
  { id: 'freelance', name: 'freelance', type: 'income', color: '#F97316' },
  { id: 'investments', name: 'investments', type: 'income', color: '#8B5CF6' },
  { id: 'gifts', name: 'gifts', type: 'income', color: '#D946EF' },
  { id: 'refunds', name: 'refunds', type: 'income', color: '#4ECDC4' },
  { id: 'side_hustle', name: 'side_hustle', type: 'income', color: '#F7FFF7' },
  { id: 'other', name: 'other', type: 'income', color: '#FFE66D' },
];

// Storage key
const STORAGE_KEY = 'masareef-categories';

// Context interface
interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
  resetToDefault: () => void;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([
    ...defaultExpenseCategories, 
    ...defaultIncomeCategories
  ]);

  // Load categories from localStorage on initialization
  useEffect(() => {
    const savedCategories = localStorage.getItem(STORAGE_KEY);
    if (savedCategories) {
      try {
        const parsed = JSON.parse(savedCategories);
        setCategories(parsed);
      } catch (error) {
        console.error('Failed to parse categories from localStorage', error);
        // If parsing fails, reset to defaults
        setCategories([...defaultExpenseCategories, ...defaultIncomeCategories]);
      }
    }
  }, []);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // Add a new category
  const addCategory = (category: Omit<Category, 'id'>) => {
    // Check if a category with the same name already exists for the same type
    const existingCategory = categories.find(
      c => c.name.toLowerCase() === category.name.toLowerCase() && c.type === category.type
    );

    if (existingCategory) {
      toast({
        title: t('error'),
        description: t('category_already_exists'),
        variant: 'destructive',
      });
      return;
    }

    // Generate random color if not provided
    const colors = [
      '#83C5BE', '#E29578', '#006D77', '#FFDDD2', '#EDF6F9', 
      '#FF6B6B', '#4ECDC4', '#F7FFF7', '#FFE66D', '#6B5CA5',
      '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'
    ];
    const randomColor = category.color || colors[Math.floor(Math.random() * colors.length)];

    const newCategory: Category = {
      id: uuidv4(),
      ...category,
      color: randomColor,
      isCustom: true
    };

    setCategories(prev => [...prev, newCategory]);
    
    toast({
      title: t('success'),
      description: t('category_added_successfully'),
    });
  };

  // Get expense categories
  const getExpenseCategories = () => {
    return categories.filter(c => c.type === 'expense' || c.type === 'both');
  };

  // Get income categories
  const getIncomeCategories = () => {
    return categories.filter(c => c.type === 'income' || c.type === 'both');
  };

  // Reset to default categories
  const resetToDefault = () => {
    setCategories([...defaultExpenseCategories, ...defaultIncomeCategories]);
    toast({
      title: t('success'),
      description: t('categories_reset_to_default'),
    });
  };

  const value = {
    categories,
    addCategory,
    getExpenseCategories,
    getIncomeCategories,
    resetToDefault
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

// Custom hook for using the category context
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};
