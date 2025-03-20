
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, getCurrentMonth, getPreviousMonths } from "@/lib/utils";
import { transactionsApi, walletsApi, financialSummaryApi } from "@/services/api";
import { Transaction, Wallet } from "@/types";

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

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // Get last 6 months including current month
  const months = [getCurrentMonth(), ...getPreviousMonths(5)].reverse();

  // Prepare monthly data
  const getMonthlyData = () => {
    // Create a map to hold data for each month
    const monthlyDataMap = new Map<string, { income: number, expenses: number }>();
    
    // Initialize the map with zeros for all months
    months.forEach(month => {
      monthlyDataMap.set(month, { income: 0, expenses: 0 });
    });
    
    // Fill in the data from transactions
    transactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      const monthYear = `${transactionDate.toLocaleString('default', { month: 'short' })}-${transactionDate.getFullYear()}`;
      
      if (monthlyDataMap.has(monthYear)) {
        const currentData = monthlyDataMap.get(monthYear)!;
        if (transaction.type === 'income') {
          currentData.income += transaction.amount;
        } else {
          currentData.expenses += transaction.amount;
        }
        monthlyDataMap.set(monthYear, currentData);
      }
    });
    
    // Convert map to array for chart
    return Array.from(monthlyDataMap).map(([name, data]) => ({
      name,
      income: data.income,
      expenses: data.expenses
    }));
  };

  const monthlyData = getMonthlyData();

  // Prepare expense categories data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.categoryName || curr.category] = (acc[curr.categoryName || curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  const COLORS = ['#006D77', '#83C5BE', '#E29578', '#FFDDD2', '#EDF6F9'];

  if (loading) {
    return <div className="p-8 text-center">Loading reports data...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('reports')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('income_vs_expenses')}</CardTitle>
            <CardDescription>
              {t('last_6_months_comparison')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="income" fill="#83C5BE" name={t('income')} />
                  <Bar dataKey="expenses" fill="#E29578" name={t('expenses')} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('expenses_by_category')}</CardTitle>
            <CardDescription>
              {t('category_distribution')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} (${formatCurrency(value)})`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {wallets.map((wallet) => (
          <Card key={wallet.id}>
            <CardHeader>
              <CardTitle>{wallet.name}</CardTitle>
              <CardDescription>{t(wallet.type)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('current_balance')}</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(wallet.balance)}
                  </p>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={transactions
                      .filter(t => t.walletId === wallet.id)
                      .slice(0, 10)
                      .map(t => ({
                        name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                        amount: t.amount,
                        type: t.type
                      }))
                    }>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar 
                        dataKey="amount" 
                        fill={wallet.color || '#83C5BE'} 
                        name={t('transactions')} 
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Reports;
