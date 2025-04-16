
import { useLanguage } from "@/contexts/LanguageContext";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import { Transaction } from "@/types";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear,
  isWithinInterval
} from "date-fns";

interface CategoryExpenseChartProps {
  transactions: Transaction[];
  currentDate: Date;
  viewType: "monthly" | "yearly";
}

export function CategoryExpenseChart({ transactions, currentDate, viewType }: CategoryExpenseChartProps) {
  const { t } = useLanguage();
  const COLORS = ['#006D77', '#83C5BE', '#E29578', '#FFDDD2', '#EDF6F9', '#8B5CF6', '#D946EF', '#F97316', '#0EA5E9'];

  const getChartData = () => {
    // Determine date range based on view type
    const start = viewType === "monthly" ? startOfMonth(currentDate) : startOfYear(currentDate);
    const end = viewType === "monthly" ? endOfMonth(currentDate) : endOfYear(currentDate);
    
    // Filter transactions by date range and type (expenses only)
    const filteredTransactions = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transaction.type === "expense" && isWithinInterval(transactionDate, { start, end });
    });

    // Group by category
    const expensesByCategory = filteredTransactions.reduce((acc, curr) => {
      const category = curr.categoryName || curr.category || t('uncategorized');
      acc[category] = (acc[category] || 0) + curr.amount;
      return acc;
    }, {} as Record<string, number>);

    // Convert to chart data format
    return Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));
  };

  const chartData = getChartData();

  return (
    <ChartContainer>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name} (${formatCurrency(value)})`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
      </PieChart>
    </ChartContainer>
  );
}
