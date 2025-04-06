import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Category } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';
import { categoriesApi } from '@/services/api';

// Context interface
interface CategoryContextType {
  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
  resetToDefault: () => void;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

export function CategoryProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesApi.getAll();
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
      toast({
        title: t('error'),
        description: t('failed_to_load_categories'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new category
  const addCategory = async (category: Omit<Category, 'id'>) => {
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

    const newCategory: Omit<Category, 'id'> = {
      ...category,
      color: randomColor,
      isCustom: true
    };

    try {
      const createdCategory = await categoriesApi.create(newCategory);
      setCategories(prev => [...prev, createdCategory]);
      
      toast({
        title: t('success'),
        description: t('category_added_successfully'),
      });
    } catch (err) {
      console.error('Error adding category:', err);
      toast({
        title: t('error'),
        description: t('failed_to_add_category'),
        variant: 'destructive',
      });
    }
  };

  // Get expense categories
  const getExpenseCategories = () => {
    return categories.filter(c => c.type === 'expense' || c.type === 'both');
  };

  // Get income categories
  const getIncomeCategories = () => {
    return categories.filter(c => c.type === 'income' || c.type === 'both');
  };

  // Reset to default categories (this would need to be implemented on the server)
  const resetToDefault = () => {
    toast({
      title: t('info'),
      description: t('categories_reset_not_available'),
    });
  };

  const value = {
    categories,
    addCategory,
    getExpenseCategories,
    getIncomeCategories,
    resetToDefault,
    loading,
    error,
    fetchCategories
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
