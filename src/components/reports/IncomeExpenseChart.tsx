
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import { Transaction } from "@/types";
import { 
  addMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval,
  getYear
} from "date-fns";

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  currentDate: Date;
  viewType: "monthly" | "yearly";
}

export function IncomeExpenseChart({ transactions, currentDate, viewType }: IncomeExpenseChartProps) {
  const { t } = useLanguage();

  const getChartData = () => {
    if (viewType === "monthly") {
      // For monthly view - daily breakdown
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      // Get transactions for current month
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start, end });
      });

      // Group by day
      const days: Record<string, { income: number; expenses: number; name: string }> = {};
      
      // Initialize all days of the month
      for (let i = 1; i <= end.getDate(); i++) {
        const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dayStr = format(day, "dd");
        days[dayStr] = { income: 0, expenses: 0, name: dayStr };
      }
      
      // Fill with transaction data
      filteredTransactions.forEach(transaction => {
        const day = format(new Date(transaction.date), "dd");
        if (!days[day]) {
          days[day] = { income: 0, expenses: 0, name: day };
        }
        
        if (transaction.type === "income") {
          days[day].income += transaction.amount;
        } else {
          days[day].expenses += transaction.amount;
        }
      });
      
      return Object.values(days).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    } else {
      // For yearly view - monthly breakdown
      const start = startOfYear(currentDate);
      const end = endOfYear(currentDate);
      
      // Get transactions for current year
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start, end });
      });

      // Group by month
      const months = eachMonthOfInterval({ start, end }).reduce((acc, month) => {
        const monthStr = format(month, "MMM");
        acc[monthStr] = { income: 0, expenses: 0, name: monthStr };
        return acc;
      }, {} as Record<string, { income: number; expenses: number; name: string }>);
      
      // Fill with transaction data
      filteredTransactions.forEach(transaction => {
        const month = format(new Date(transaction.date), "MMM");
        
        if (transaction.type === "income") {
          months[month].income += transaction.amount;
        } else {
          months[month].expenses += transaction.amount;
        }
      });
      
      return Object.values(months);
    }
  };

  return (
    <ChartContainer>
      <BarChart data={getChartData()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Bar dataKey="income" fill="#83C5BE" name={t('income')} />
        <Bar dataKey="expenses" fill="#E29578" name={t('expenses')} />
      </BarChart>
    </ChartContainer>
  );
}
