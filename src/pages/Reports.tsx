
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ReportCard } from "@/components/reports/ReportCard";
import { DateRangeSelector } from "@/components/reports/DateRangeSelector";
import { IncomeExpenseChart } from "@/components/reports/IncomeExpenseChart";
import { CashFlowChart } from "@/components/reports/CashFlowChart";
import { CategoryExpenseChart } from "@/components/reports/CategoryExpenseChart";
import { WalletBalanceChart } from "@/components/reports/WalletBalanceChart";
import { formatCurrency } from "@/lib/utils";
import { transactionsApi, walletsApi, financialSummaryApi } from "@/services/api";
import { Transaction, Wallet } from "@/types";
import { addMonths, addYears, subMonths, subYears } from "date-fns";
import { ChartBar, TrendingUp, PieChart, Wallet as WalletIcon } from "lucide-react";

const Reports = () => {
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [financialSummary, setFinancialSummary] = useState({
    totalBalance: 0,
    totalIncome: 0,
    totalExpenses: 0
  });

  // State for date range selection
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [transactionsData, walletsData, summaryData] = await Promise.all([
          transactionsApi.getAll(),
          walletsApi.getAll(),
          financialSummaryApi.get()
        ]);
        
        setTransactions(transactionsData);
        setWallets(walletsData);
        setFinancialSummary(summaryData);
      } catch (error) {
        console.error("Failed to fetch data for reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle date navigation
  const handlePrevious = () => {
    if (viewType === "monthly") {
      setCurrentDate(prevDate => subMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => subYears(prevDate, 1));
    }
  };

  const handleNext = () => {
    if (viewType === "monthly") {
      setCurrentDate(prevDate => addMonths(prevDate, 1));
    } else {
      setCurrentDate(prevDate => addYears(prevDate, 1));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading reports data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('reports')}</h1>

      <DateRangeSelector 
        viewType={viewType}
        setViewType={setViewType}
        currentDate={currentDate}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard 
          title={t('income_vs_expenses')}
          description={viewType === "monthly" ? t('monthly_comparison') : t('yearly_comparison')}
        >
          <div className="flex items-center mb-4 text-muted-foreground">
            <ChartBar className="mr-2 h-4 w-4" />
            <span className="text-sm">{t('income_expense_comparison_description')}</span>
          </div>
          <IncomeExpenseChart 
            transactions={transactions} 
            currentDate={currentDate} 
            viewType={viewType}
          />
        </ReportCard>

        <ReportCard 
          title={t('cash_flow_analysis')}
          description={viewType === "monthly" ? t('monthly_cash_flow') : t('yearly_cash_flow')}
        >
          <div className="flex items-center mb-4 text-muted-foreground">
            <TrendingUp className="mr-2 h-4 w-4" />
            <span className="text-sm">{t('cash_flow_description')}</span>
          </div>
          <CashFlowChart 
            transactions={transactions} 
            currentDate={currentDate} 
            viewType={viewType}
          />
        </ReportCard>

        <ReportCard 
          title={t('expenses_by_category')}
          description={viewType === "monthly" ? t('monthly_distribution') : t('yearly_distribution')}
        >
          <div className="flex items-center mb-4 text-muted-foreground">
            <PieChart className="mr-2 h-4 w-4" />
            <span className="text-sm">{t('expense_distribution_description')}</span>
          </div>
          <CategoryExpenseChart 
            transactions={transactions} 
            currentDate={currentDate} 
            viewType={viewType}
          />
        </ReportCard>

        {wallets.map((wallet) => (
          <ReportCard key={wallet.id} title={wallet.name} description={t(wallet.type)}>
            <div className="flex items-center mb-4 text-muted-foreground">
              <WalletIcon className="mr-2 h-4 w-4" />
              <span className="text-sm">{t('wallet_transaction_history')}</span>
            </div>
            <WalletBalanceChart 
              wallet={wallet} 
              transactions={transactions}
              viewType={viewType}
            />
          </ReportCard>
        ))}
      </div>
    </div>
  );
};

export default Reports;
