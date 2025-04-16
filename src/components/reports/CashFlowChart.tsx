
import { useLanguage } from "@/contexts/LanguageContext";
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import { Transaction } from "@/types";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  eachMonthOfInterval,
  format, 
  isWithinInterval,
  differenceInCalendarDays
} from "date-fns";

interface CashFlowChartProps {
  transactions: Transaction[];
  currentDate: Date;
  viewType: "monthly" | "yearly";
}

export function CashFlowChart({ transactions, currentDate, viewType }: CashFlowChartProps) {
  const { t } = useLanguage();

  const getChartData = () => {
    if (viewType === "monthly") {
      // For monthly view - daily net cash flow
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      // Get transactions for current month
      const filteredTransactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return isWithinInterval(transactionDate, { start, end });
      });

      // Group by day
      const days: Record<string, { cashFlow: number; balance: number; name: string }> = {};
      
      // Initialize all days of the month
      for (let i = 1; i <= end.getDate(); i++) {
        const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dayStr = format(day, "dd");
        days[dayStr] = { cashFlow: 0, balance: 0, name: dayStr };
      }
      
      // Calculate daily cash flow
      filteredTransactions.forEach(transaction => {
        const day = format(new Date(transaction.date), "dd");
        if (!days[day]) {
          days[day] = { cashFlow: 0, balance: 0, name: day };
        }
        
        const amount = transaction.type === "income" ? transaction.amount : -transaction.amount;
        days[day].cashFlow += amount;
      });
      
      // Calculate running balance
      let runningBalance = 0;
      const sortedDays = Object.values(days).sort((a, b) => parseInt(a.name) - parseInt(b.name));
      sortedDays.forEach(day => {
        runningBalance += day.cashFlow;
        day.balance = runningBalance;
      });
      
      return sortedDays;
    } else {
      // For yearly view - monthly net cash flow
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
        acc[monthStr] = { cashFlow: 0, balance: 0, name: monthStr };
        return acc;
      }, {} as Record<string, { cashFlow: number; balance: number; name: string }>);
      
      // Calculate monthly cash flow
      filteredTransactions.forEach(transaction => {
        const month = format(new Date(transaction.date), "MMM");
        
        const amount = transaction.type === "income" ? transaction.amount : -transaction.amount;
        months[month].cashFlow += amount;
      });
      
      // Calculate running balance
      let runningBalance = 0;
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const sortedMonths = monthNames
        .filter(month => months[month])
        .map(month => months[month]);
      
      sortedMonths.forEach(month => {
        runningBalance += month.cashFlow;
        month.balance = runningBalance;
      });
      
      return sortedMonths;
    }
  };

  return (
    <ChartContainer>
      <LineChart data={getChartData()}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Legend />
        <Line type="monotone" dataKey="cashFlow" stroke="#8884d8" name={t('cash_flow')} />
        <Line type="monotone" dataKey="balance" stroke="#82ca9d" name={t('balance')} />
      </LineChart>
    </ChartContainer>
  );
}
