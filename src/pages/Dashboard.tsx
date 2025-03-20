import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { WalletList } from "@/components/dashboard/WalletList";
import { MonthNavigation } from "@/components/dashboard/MonthNavigation";
import { ArrowDown, ArrowUp, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Link } from "react-router-dom";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Transaction, FinancialSummary } from "@/types";
import { transactionsApi, walletsApi, financialSummaryApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  // Set default date to current month
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyTrends, setMonthlyTrends] = useState({ income: 0, expenses: 0 });
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });
  const [loading, setLoading] = useState({
    transactions: true,
    wallets: true,
    summary: true
  });
  
  // Fetch data on component mount
  useEffect(() => {
    fetchWallets();
    fetchFinancialSummary();
  }, []);
  
  // Fetch transactions when selected date changes
  useEffect(() => {
    fetchTransactions();
  }, [selectedDate]);
  
  const fetchWallets = async () => {
    try {
      setLoading(prev => ({ ...prev, wallets: true }));
      const data = await walletsApi.getAll();
      setWallets(data);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: t('error'),
        description: t('failed_to_load_wallets'),
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, wallets: false }));
    }
  };
  
  const fetchTransactions = async () => {
    try {
      setLoading(prev => ({ ...prev, transactions: true }));
      const allTransactions = await transactionsApi.getAll();
      
      // Filter transactions for the selected month
      const filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === selectedDate.getMonth() &&
          transactionDate.getFullYear() === selectedDate.getFullYear()
        );
      });
      
      setTransactions(filteredTransactions);
      
      // Calculate monthly summary based on filtered transactions
      const monthlySummary = filteredTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === "income") {
            acc.income += transaction.amount;
          } else {
            acc.expenses += transaction.amount;
          }
          return acc;
        },
        { income: 0, expenses: 0 }
      );
      
      // Calculate previous month data to determine trends
      const previousMonthDate = new Date(selectedDate);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      
      const previousMonthTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === previousMonthDate.getMonth() &&
          transactionDate.getFullYear() === previousMonthDate.getFullYear()
        );
      });
      
      const previousMonthSummary = previousMonthTransactions.reduce(
        (acc, transaction) => {
          if (transaction.type === "income") {
            acc.income += transaction.amount;
          } else {
            acc.expenses += transaction.amount;
          }
          return acc;
        },
        { income: 0, expenses: 0 }
      );
      
      // Calculate percentage change
      const calculateTrend = (current: number, previous: number): number => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };
      
      setMonthlyTrends({
        income: calculateTrend(monthlySummary.income, previousMonthSummary.income),
        expenses: calculateTrend(monthlySummary.expenses, previousMonthSummary.expenses)
      });
      
      setFinancialSummary(prev => ({
        ...prev,
        totalIncome: monthlySummary.income || 0,
        totalExpenses: monthlySummary.expenses || 0
      }));
      
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: t('error'),
        description: t('failed_to_load_transactions'),
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, transactions: false }));
    }
  };
  
  const fetchFinancialSummary = async () => {
    try {
      setLoading(prev => ({ ...prev, summary: true }));
      const data = await financialSummaryApi.get();
      setFinancialSummary(prev => ({
        ...prev,
        totalBalance: data.totalBalance
      }));
    } catch (error) {
      console.error("Error fetching financial summary:", error);
      toast({
        title: t('error'),
        description: t('failed_to_load_financial_summary'),
        variant: 'destructive',
      });
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };
  
  // Filter transactions based on search term
  const searchedTransactions = transactions.filter(transaction => {
    if (searchTerm.trim() === "") return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.description.toLowerCase().includes(searchLower) ||
      transaction.category.toLowerCase().includes(searchLower) ||
      transaction.amount.toString().includes(searchLower) ||
      new Date(transaction.date).toLocaleDateString().includes(searchLower) ||
      t(transaction.categoryName || transaction.category).toLowerCase().includes(searchLower)
    );
  });
  
  // Sort by date (newest first) and take first 5
  const recentTransactions = [...searchedTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, 5);

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('dashboard')}</h1>
        <MonthNavigation 
          currentDate={selectedDate}
          onDateChange={setSelectedDate}
        />
      </div>

      <div className="relative w-full mb-4">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t('search_transactions')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title={t('total_balance')}
          value={formatCurrency(financialSummary.totalBalance)}
          icon={<Wallet className="h-5 w-5 text-masareef-primary" />}
          className="border-l-4 border-masareef-primary"
          loading={loading.summary}
        />
        <StatCard
          title={t('income')}
          value={formatCurrency(financialSummary.totalIncome)}
          icon={<ArrowDown className="h-5 w-5 text-green-600" />}
          trend={monthlyTrends.income}
          className="border-l-4 border-green-500"
          loading={loading.transactions}
        />
        <StatCard
          title={t('expenses')}
          value={formatCurrency(financialSummary.totalExpenses)}
          icon={<ArrowUp className="h-5 w-5 text-red-600" />}
          trend={monthlyTrends.expenses}
          isExpense={true}
          className="border-l-4 border-red-500"
          loading={loading.transactions}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>{t('wallets')}</CardTitle>
            <CardDescription>
              {t('manage_your_wallets')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WalletList wallets={wallets} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <div>
              <CardTitle>{t('recent_transactions')}</CardTitle>
              <CardDescription>
                {t('your_recent_financial_activities')}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/transactions">{t('see_all')}</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <TransactionList 
              transactions={recentTransactions} 
              emptyMessage={searchTerm ? t('no_matching_transactions') : t('no_transactions_for_month')}
              onView={handleViewTransaction}
            />
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details Dialog */}
      <TransactionDetails
        transaction={viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        onEdit={() => {
          if (viewingTransaction) {
            window.location.href = `/transactions`;
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
