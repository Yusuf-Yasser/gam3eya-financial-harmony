
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
    
    // Categories
    'category': 'Category',
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
    'amount': 'Amount',
    'date': 'Date',
    'description': 'Description',
    'transaction_type': 'Transaction Type',
    'wallet': 'Wallet',
    'add_receipt': 'Add Receipt',
    
    // Gam3eya
    'create_gam3eya': 'Create Gam3eya',
    'join_gam3eya': 'Join Gam3eya',
    'members': 'Members',
    'cycle': 'Cycle',
    'contribution': 'Contribution',
    'end_date': 'End Date',
    'start_date': 'Start Date',
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
    
    // Categories
    'category': 'الفئة',
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
    'amount': 'المبلغ',
    'date': 'التاريخ',
    'description': 'الوصف',
    'transaction_type': 'نوع المعاملة',
    'wallet': 'المحفظة',
    'add_receipt': 'إضافة إيصال',
    
    // Gam3eya
    'create_gam3eya': 'إنشاء جمعية',
    'join_gam3eya': 'الانضمام إلى جمعية',
    'members': 'الأعضاء',
    'cycle': 'الدورة',
    'contribution': 'المساهمة',
    'end_date': 'تاريخ الانتهاء',
    'start_date': 'تاريخ البدء',
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
