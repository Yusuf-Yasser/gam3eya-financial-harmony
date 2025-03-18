import React, { createContext, useContext, useState } from 'react';

type LanguageContextType = {
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    dashboard: 'Dashboard',
    total_balance: 'Total Balance',
    income: 'Income',
    expenses: 'Expenses',
    wallets: 'Wallets',
    manage_your_wallets: 'Manage your wallets',
    recent_transactions: 'Recent Transactions',
    your_recent_financial_activities: 'Your recent financial activities',
    see_all: 'See All',
    no_transactions: 'No transactions',
    search: 'Search',
    settings: 'Settings',
    logout: 'Logout',
    language: 'Language',
    english: 'English',
    arabic: 'Arabic',
    search_transactions: 'Search transactions',
    filter: 'Filter',
    clear_filters: 'Clear filters',
    date_range: 'Date Range',
    categories: 'Categories',
    amount_range: 'Amount Range',
    transaction_type: 'Transaction Type',
    apply_filters: 'Apply Filters',
    reset_filters: 'Reset Filters',
    income_transactions: 'Income Transactions',
    expense_transactions: 'Expense Transactions',
    all_transactions: 'All Transactions',
    min_amount: 'Min Amount',
    max_amount: 'Max Amount',
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
    previous_month: 'Previous month',
    next_month: 'Next month',
    no_transactions_for_month: 'No transactions for this month',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    total_balance: 'الرصيد الكلي',
    income: 'الدخل',
    expenses: 'المصروفات',
    wallets: 'المحافظ',
    manage_your_wallets: 'إدارة محافظك',
    recent_transactions: 'المعاملات الأخيرة',
    your_recent_financial_activities: 'أنشطتك المالية الأخيرة',
    see_all: 'عرض الكل',
    no_transactions: 'لا توجد معاملات',
    search: 'بحث',
    settings: 'إعدادات',
    logout: 'تسجيل الخروج',
    language: 'اللغة',
    english: 'الإنجليزية',
    arabic: 'العربية',
    search_transactions: 'البحث عن المعاملات',
    filter: 'تصفية',
    clear_filters: 'مسح الفلاتر',
    date_range: 'النطاق الزمني',
    categories: 'الفئات',
    amount_range: 'نطاق المبلغ',
    transaction_type: 'نوع المعاملة',
    apply_filters: 'تطبيق الفلاتر',
    reset_filters: 'إعادة تعيين الفلاتر',
    income_transactions: 'معاملات الدخل',
    expense_transactions: 'معاملات المصروفات',
    all_transactions: 'جميع المعاملات',
    min_amount: 'أقل مبلغ',
    max_amount: 'أعلى مبلغ',
    january: 'يناير',
    february: 'فبراير',
    march: 'مارس',
    april: 'أبريل',
    may: 'مايو',
    june: 'يونيو',
    july: 'يوليو',
    august: 'أغسطس',
    september: 'سبتمبر',
    october: 'أكتوبر',
    november: 'نوفمبر',
    december: 'ديسمبر',
    previous_month: 'الشهر السابق',
    next_month: 'الشهر القادم',
    no_transactions_for_month: 'لا توجد معاملات لهذا الشهر',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
