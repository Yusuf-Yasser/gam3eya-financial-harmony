
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ar';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const translations = {
  en: {
    // Dashboard
    'dashboard': 'Dashboard',
    'total_balance': 'Total Balance',
    'income': 'Income',
    'expenses': 'Expenses',
    'welcome': 'Welcome to Masareef',
    'summary': 'Financial Summary',
    'recent_transactions': 'Recent Transactions',
    'see_all': 'See All',
    'no_transactions': 'No recent transactions',
    'no_transactions_found': 'No transactions found',
    'no_matching_transactions': 'No transactions match your filters',
    'more': 'More',
    
    // Navigation
    'home': 'Home',
    'transactions': 'Transactions',
    'budgets': 'Budgets',
    'wallets': 'Wallets',
    'gam3eya': 'Gam3eya',
    'reports': 'Reports',
    'settings': 'Settings',
    
    // Actions
    'add': 'Add',
    'edit': 'Edit',
    'delete': 'Delete',
    'save': 'Save',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'apply_filters': 'Apply Filters',
    'clear_filters': 'Clear Filters',
    'reset': 'Reset',
    
    // Categories
    'category': 'Category',
    'categories': 'Categories',
    'food': 'Food',
    'transport': 'Transportation',
    'housing': 'Housing',
    'utilities': 'Utilities',
    'healthcare': 'Healthcare',
    'personal': 'Personal',
    'entertainment': 'Entertainment',
    'education': 'Education',
    'debt': 'Debt',
    'other': 'Other',
    
    // Wallets
    'cash': 'Cash',
    'bank': 'Bank Account',
    'savings': 'Savings',
    'add_wallet': 'Add Wallet',
    'wallet_name': 'Wallet Name',
    'wallet_balance': 'Wallet Balance',
    
    // Transactions
    'add_transaction': 'Add Transaction',
    'edit_transaction': 'Edit Transaction',
    'add_new_transaction': 'Add New Transaction',
    'edit_transaction_details': 'Edit transaction details',
    'enter_transaction_details': 'Enter transaction details',
    'amount': 'Amount',
    'amount_range': 'Amount Range',
    'date': 'Date',
    'date_range': 'Date Range',
    'start_date': 'Start Date',
    'end_date': 'End Date',
    'description': 'Description',
    'transaction_type': 'Transaction Type',
    'transaction_updated_successfully': 'Transaction updated successfully',
    'transaction_added_successfully': 'Transaction added successfully',
    'all_transactions': 'All Transactions',
    'view_and_manage_your_financial_activities': 'View and manage your financial activities',
    'search_transactions': 'Search transactions',
    'filter': 'Filter',
    'filter_transactions': 'Filter Transactions',
    'wallet': 'Wallet',
    'add_receipt': 'Add Receipt',
    'receipt': 'Receipt',
    'success': 'Success',
    
    // Gam3eya
    'create_gam3eya': 'Create Gam3eya',
    'join_gam3eya': 'Join Gam3eya',
    'members': 'Members',
    'cycle': 'Cycle',
    'contribution': 'Contribution',
    'payment_schedule': 'Payment Schedule',
    'my_gam3eyas': 'My Gam3eyas',
    
    // General
    'language': 'Language',
    'theme': 'Theme',
    'currency': 'Currency',
    'profile': 'Profile',
    'logout': 'Logout',
    'search': 'Search',
    'notifications': 'Notifications',
    'help': 'Help',
    'about': 'About',
    'contact': 'Contact',
    'privacy': 'Privacy',
    'terms': 'Terms',
    'version': 'Version',
  },
  ar: {
    // Dashboard
    'dashboard': 'لوحة التحكم',
    'total_balance': 'الرصيد الإجمالي',
    'income': 'الدخل',
    'expenses': 'المصروفات',
    'welcome': 'مرحبًا بك في مصاريف',
    'summary': 'ملخص مالي',
    'recent_transactions': 'المعاملات الأخيرة',
    'see_all': 'عرض الكل',
    'no_transactions': 'لا توجد معاملات حديثة',
    'no_transactions_found': 'لم يتم العثور على معاملات',
    'no_matching_transactions': 'لا توجد معاملات تطابق عوامل التصفية',
    'more': 'المزيد',
    
    // Navigation
    'home': 'الرئيسية',
    'transactions': 'المعاملات',
    'budgets': 'الميزانيات',
    'wallets': 'المحافظ',
    'gam3eya': 'جمعية',
    'reports': 'التقارير',
    'settings': 'الإعدادات',
    
    // Actions
    'add': 'إضافة',
    'edit': 'تعديل',
    'delete': 'حذف',
    'save': 'حفظ',
    'cancel': 'إلغاء',
    'confirm': 'تأكيد',
    'apply_filters': 'تطبيق الفلاتر',
    'clear_filters': 'مسح الفلاتر',
    'reset': 'إعادة ضبط',
    
    // Categories
    'category': 'الفئة',
    'categories': 'الفئات',
    'food': 'طعام',
    'transport': 'مواصلات',
    'housing': 'سكن',
    'utilities': 'مرافق',
    'healthcare': 'رعاية صحية',
    'personal': 'شخصي',
    'entertainment': 'ترفيه',
    'education': 'تعليم',
    'debt': 'ديون',
    'other': 'أخرى',
    
    // Wallets
    'cash': 'نقدي',
    'bank': 'حساب بنكي',
    'savings': 'مدخرات',
    'add_wallet': 'إضافة محفظة',
    'wallet_name': 'اسم المحفظة',
    'wallet_balance': 'رصيد المحفظة',
    
    // Transactions
    'add_transaction': 'إضافة معاملة',
    'edit_transaction': 'تعديل المعاملة',
    'add_new_transaction': 'إضافة معاملة جديدة',
    'edit_transaction_details': 'تعديل تفاصيل المعاملة',
    'enter_transaction_details': 'أدخل تفاصيل المعاملة',
    'amount': 'المبلغ',
    'amount_range': 'نطاق المبلغ',
    'date': 'التاريخ',
    'date_range': 'الفترة الزمنية',
    'start_date': 'تاريخ البدء',
    'end_date': 'تاريخ الانتهاء',
    'description': 'الوصف',
    'transaction_type': 'نوع المعاملة',
    'transaction_updated_successfully': 'تم تحديث المعاملة بنجاح',
    'transaction_added_successfully': 'تمت إضافة المعاملة بنجاح',
    'all_transactions': 'جميع المعاملات',
    'view_and_manage_your_financial_activities': 'عرض وإدارة أنشطتك المالية',
    'search_transactions': 'البحث في المعاملات',
    'filter': 'تصفية',
    'filter_transactions': 'تصفية المعاملات',
    'wallet': 'المحفظة',
    'add_receipt': 'إضافة إيصال',
    'receipt': 'إيصال',
    'success': 'نجاح',
    
    // Gam3eya
    'create_gam3eya': 'إنشاء جمعية',
    'join_gam3eya': 'الانضمام إلى جمعية',
    'members': 'الأعضاء',
    'cycle': 'الدورة',
    'contribution': 'المساهمة',
    'payment_schedule': 'جدول الدفع',
    'my_gam3eyas': 'جمعياتي',
    
    // General
    'language': 'اللغة',
    'theme': 'السمة',
    'currency': 'العملة',
    'profile': 'الملف الشخصي',
    'logout': 'تسجيل الخروج',
    'search': 'بحث',
    'notifications': 'إشعارات',
    'help': 'مساعدة',
    'about': 'عن التطبيق',
    'contact': 'اتصل بنا',
    'privacy': 'الخصوصية',
    'terms': 'الشروط',
    'version': 'الإصدار',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      <div className={language === 'ar' ? 'rtl' : ''}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
