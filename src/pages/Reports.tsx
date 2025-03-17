
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { transactions, wallets } from "@/data/dummyData";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency, getCurrentMonth, getPreviousMonths } from "@/lib/utils";

const Reports = () => {
  const { t } = useLanguage();

  // Get last 6 months including current month
  const months = [getCurrentMonth(), ...getPreviousMonths(5)].reverse();

  // Prepare monthly data
  const monthlyData = months.map(month => ({
    name: month,
    income: Math.random() * 15000 + 5000, // Dummy data
    expenses: Math.random() * 10000 + 3000 // Dummy data
  }));

  // Prepare expense categories data
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

  const pieData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: t(category),
    value: amount
  }));

  const COLORS = ['#006D77', '#83C5BE', '#E29578', '#FFDDD2', '#EDF6F9'];

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
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Bar 
                        dataKey="income" 
                        fill={wallet.color} 
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
