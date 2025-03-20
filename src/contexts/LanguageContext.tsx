
import React, { createContext, useContext, useState, useEffect } from 'react';

type LanguageContextType = {
  language: 'en' | 'ar';
  setLanguage: (language: 'en' | 'ar') => void;
  toggleLanguage: () => void;
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
    transactions: 'Transactions',
    budgets: 'Budgets',
    gam3eya: 'Gam3eya',
    reports: 'Reports',
    profile_settings: 'Profile Settings',
    full_name: 'Full Name',
    email: 'Email',
    phone: 'Phone',
    save_changes: 'Save Changes',
    language_settings: 'Language Settings',
    current_language: 'Current Language',
    notifications: 'Notifications',
    manage_notifications: 'Manage your notification preferences',
    email_notifications: 'Email Notifications',
    receive_email_updates: 'Receive email updates about your account',
    push_notifications: 'Push Notifications',
    receive_push_notifications: 'Receive push notifications on your device',
    security: 'Security',
    change_password: 'Change Password',
    manage_connected_accounts: 'Manage Connected Accounts',
    income_vs_expenses: 'Income vs Expenses',
    last_6_months_comparison: 'Last 6 months comparison',
    expenses_by_category: 'Expenses by Category',
    category_distribution: 'Category distribution',
    current_balance: 'Current Balance',
    add_transaction: 'Add Transaction',
    edit_transaction: 'Edit Transaction',
    add_new_transaction: 'Add New Transaction',
    enter_transaction_details: 'Enter transaction details',
    edit_transaction_details: 'Edit transaction details',
    view_and_manage_your_financial_activities: 'View and manage your financial activities',
    description: 'Description',
    amount: 'Amount',
    date: 'Date',
    category: 'Category',
    wallet: 'Wallet',
    select_category: 'Select Category',
    select_wallet: 'Select Wallet',
    receipt: 'Receipt',
    receipt_attached: 'Receipt Attached',
    attach_receipt: 'Attach Receipt',
    cancel: 'Cancel',
    update_transaction: 'Update Transaction',
    success: 'Success',
    transaction_added_successfully: 'Transaction added successfully',
    transaction_updated_successfully: 'Transaction updated successfully',
    no_matching_transactions: 'No matching transactions',
    no_transactions_found: 'No transactions found',
    expense: 'Expense',
    add_wallet: 'Add Wallet',
    add_new_wallet: 'Add New Wallet',
    enter_wallet_details: 'Enter wallet details',
    wallet_name: 'Wallet Name',
    wallet_type: 'Wallet Type',
    initial_balance: 'Initial Balance',
    wallet_color: 'Wallet Color',
    select_wallet_type: 'Select wallet type',
    validation_error: 'Validation Error',
    please_fill_all_required_fields: 'Please fill all required fields',
    wallet_added_successfully: 'Wallet added successfully',
    my_wallets: 'My Wallets',
    account_number: 'Account Number',
    last_updated: 'Last Updated',
    edit: 'Edit',
    delete: 'Delete',
    wallet_deleted_successfully: 'Wallet deleted successfully',
    cash: 'Cash',
    bank: 'Bank',
    savings: 'Savings',
    custom: 'Custom',
    start_date: 'Start Date',
    end_date: 'End Date',
    filter_transactions: 'Filter Transactions',
    reset: 'Reset',
    apply: 'Apply',
    groceries: 'Groceries',
    transportation: 'Transportation',
    entertainment: 'Entertainment',
    dining_out: 'Dining Out',
    utilities: 'Utilities',
    housing: 'Housing',
    healthcare: 'Healthcare',
    clothing: 'Clothing',
    education: 'Education',
    other: 'Other',
    salary: 'Salary',
    freelance: 'Freelance',
    investments: 'Investments',
    gifts: 'Gifts',
    refunds: 'Refunds',
    side_hustle: 'Side Hustle',
    reminders: 'Reminders',
    scheduled_payments: 'Scheduled Payments',
    manage_scheduled_payments: 'Manage your scheduled payments',
    add_reminder: 'Add Reminder',
    add_scheduled_payment: 'Add Scheduled Payment',
    add_new_reminder: 'Add New Reminder',
    enter_reminder_details: 'Enter reminder details',
    reminder_title: 'Reminder Title',
    reminder_amount: 'Amount (optional)',
    reminder_date: 'Due Date',
    reminder_description: 'Description (optional)',
    recurring: 'Recurring',
    one_time: 'One Time',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
    annually: 'Annually',
    frequency: 'Frequency',
    reminder_added_successfully: 'Reminder added successfully',
    reminder_deleted_successfully: 'Reminder deleted successfully',
    no_reminders: 'No reminders',
    due_date: 'Due Date',
    mark_as_complete: 'Mark as Complete',
    payment_scheduled_successfully: 'Payment scheduled successfully',
    new_wallet: 'New Wallet',
    wallet_details: 'Wallet Details',
    view_transaction: 'View Transaction',
    transaction_details: 'Transaction Details',
    transaction_date: 'Transaction Date',
    transaction_category: 'Category',
    transaction_amount: 'Amount',
    transaction_wallet: 'Wallet',
    transaction_receipt: 'Receipt',
    close: 'Close',
    view_details: 'View Details',
    reminder_details: 'Reminder Details',
    upcoming_reminders: 'Upcoming Reminders',
    upcoming_scheduled_payments: 'Upcoming Scheduled Payments',
    no_upcoming_reminders: 'No upcoming reminders',
    no_upcoming_payments: 'No upcoming payments',
    upcoming_due: 'Upcoming Due',
    view_all_reminders: 'View All Reminders',
    due_in_days: 'Due in {days} days',
    due_tomorrow: 'Due tomorrow',
    due_today: 'Due today',
    overdue: 'Overdue',
    priority: 'Priority',
    low: 'Low',
    medium: 'Medium', 
    high: 'High',
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
    transactions: 'المعاملات',
    budgets: 'الميزانيات',
    gam3eya: 'جمعية',
    reports: 'التقارير',
    profile_settings: 'إعدادات الملف الشخصي',
    full_name: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    save_changes: 'حفظ التغييرات',
    language_settings: 'إعدادات اللغة',
    current_language: 'اللغة الحالية',
    notifications: 'الإشعارات',
    manage_notifications: 'إدارة تفضيلات الإشعارات',
    email_notifications: 'إشعارات البريد الإلكتروني',
    receive_email_updates: 'استلام تحديثات البريد الإلكتروني حول حسابك',
    push_notifications: 'إشعارات الدفع',
    receive_push_notifications: 'استلام إشعارات على جهازك',
    security: 'الأمان',
    change_password: 'تغيير كلمة المرور',
    manage_connected_accounts: 'إدارة الحسابات المتصلة',
    income_vs_expenses: 'الدخل مقابل المصروفات',
    last_6_months_comparison: 'مقارنة آخر 6 أشهر',
    expenses_by_category: 'المصروفات حسب الفئة',
    category_distribution: 'توزيع الفئات',
    current_balance: 'الرصيد الحالي',
    add_transaction: 'إضافة معاملة',
    edit_transaction: 'تعديل المعاملة',
    add_new_transaction: 'إضافة معاملة جديدة',
    enter_transaction_details: 'أدخل تفاصيل المعاملة',
    edit_transaction_details: 'تعديل تفاصيل المعاملة',
    view_and_manage_your_financial_activities: 'عرض وإدارة أنشطتك المالية',
    description: 'الوصف',
    amount: 'المبلغ',
    date: 'التاريخ',
    category: 'الفئة',
    wallet: 'المحفظة',
    select_category: 'اختر الفئة',
    select_wallet: 'اختر المحفظة',
    receipt: 'الإيصال',
    receipt_attached: 'تم إرفاق الإيصال',
    attach_receipt: 'إرفاق إيصال',
    cancel: 'إلغاء',
    update_transaction: 'تحديث المعاملة',
    success: 'تم بنجاح',
    transaction_added_successfully: 'تمت إضافة المعاملة بنجاح',
    transaction_updated_successfully: 'تم تحديث المعاملة بنجاح',
    no_matching_transactions: 'لا توجد معاملات مطابقة',
    no_transactions_found: 'لم يتم العثور على معاملات',
    expense: 'مصروف',
    add_wallet: 'إضافة محفظة',
    add_new_wallet: 'إضافة محفظة جديدة',
    enter_wallet_details: 'أدخل تفاصيل المحفظة',
    wallet_name: 'اسم المحفظة',
    wallet_type: 'نوع المحفظة',
    initial_balance: 'الرصيد الأولي',
    wallet_color: 'لون المحفظة',
    select_wallet_type: 'اختر نوع المحفظة',
    validation_error: 'خطأ في التحقق',
    please_fill_all_required_fields: 'يرجى ملء جميع الحقول المطلوبة',
    wallet_added_successfully: 'تمت إضافة المحفظة بنجاح',
    my_wallets: 'محافظي',
    account_number: 'رقم الحساب',
    last_updated: 'آخر تحديث',
    edit: 'تعديل',
    delete: 'حذف',
    wallet_deleted_successfully: 'تم حذف المحفظة بنجاح',
    cash: 'نقدي',
    bank: 'بنك',
    savings: 'مدخرات',
    gam3eya: 'جمعية',
    custom: 'مخصص',
    start_date: 'تاريخ البدء',
    end_date: 'تاريخ الانتهاء',
    filter_transactions: 'تصفية المعاملات',
    reset: 'إعادة تعيين',
    apply: 'تطبيق',
    groceries: 'بقالة',
    transportation: 'مواصلات',
    entertainment: 'ترفيه',
    dining_out: 'تناول الطعام بالخارج',
    utilities: 'مرافق',
    housing: 'سكن',
    healthcare: 'رعاية صحية',
    clothing: 'ملابس',
    education: 'تعليم',
    savings: 'مدخرات',
    other: 'أخرى',
    salary: 'راتب',
    freelance: 'عمل حر',
    investments: 'استثمارات',
    gifts: 'هدايا',
    refunds: 'استردادات',
    side_hustle: 'عمل إضافي',
    reminders: 'التذكيرات',
    scheduled_payments: 'المدفوعات المجدولة',
    manage_scheduled_payments: 'إدارة المدفوعات المجدولة',
    add_reminder: 'إضافة تذكير',
    add_scheduled_payment: 'إضافة دفعة مجدولة',
    add_new_reminder: 'إضافة تذكير جديد',
    enter_reminder_details: 'أدخل تفاصيل التذكير',
    reminder_title: 'عنوان التذكير',
    reminder_amount: 'المبلغ (اختياري)',
    reminder_date: 'تاريخ الاستحقاق',
    reminder_description: 'الوصف (اختياري)',
    recurring: 'متكرر',
    one_time: 'مرة واحدة',
    daily: 'يومي',
    weekly: 'أسبوعي',
    monthly: 'شهري',
    annually: 'سنوي',
    frequency: 'التكرار',
    reminder_added_successfully: 'تمت إضافة التذكير بنجاح',
    reminder_deleted_successfully: 'تم حذف التذكير بنجاح',
    no_reminders: 'لا توجد تذكيرات',
    due_date: 'تاريخ الاستحقاق',
    mark_as_complete: 'وضع علامة كمكتمل',
    payment_scheduled_successfully: 'تمت جدولة الدفع بنجاح',
    new_wallet: 'محفظة جديدة',
    wallet_details: 'تفاصيل المحفظة',
    view_transaction: 'عرض المعاملة',
    transaction_details: 'تفاصيل المعاملة',
    transaction_date: 'تاريخ المعاملة',
    transaction_category: 'الفئة',
    transaction_amount: 'المبلغ',
    transaction_wallet: 'المحفظة',
    transaction_receipt: 'الإيصال',
    close: 'إغلاق',
    view_details: 'عرض التفاصيل',
    reminder_details: 'تفاصيل التذكير',
    upcoming_reminders: 'التذكيرات القادمة',
    upcoming_scheduled_payments: 'المدفوعات المجدولة القادمة',
    no_upcoming_reminders: 'لا توجد تذكيرات قادمة',
    no_upcoming_payments: 'لا توجد مدفوعات قادمة',
    upcoming_due: 'استحقاق قادم',
    view_all_reminders: 'عرض كل التذكيرات',
    due_in_days: 'يستحق في {days} أيام',
    due_tomorrow: 'يستحق غدًا',
    due_today: 'يستحق اليوم',
    overdue: 'متأخر',
    priority: 'الأولوية',
    low: 'منخفضة',
    medium: 'متوسطة',
    high: 'عالية',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'ar' : 'en');
  };

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  // Set document direction and language on mount and when language changes
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    if (language === 'ar') {
      document.documentElement.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
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
