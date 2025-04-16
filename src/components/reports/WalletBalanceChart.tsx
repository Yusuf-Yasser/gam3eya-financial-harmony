
import { useLanguage } from "@/contexts/LanguageContext";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { formatCurrency } from "@/lib/utils";
import { ChartContainer } from "./ChartContainer";
import { Wallet, Transaction } from "@/types";

interface WalletBalanceChartProps {
  wallet: Wallet;
  transactions: Transaction[];
  viewType: "monthly" | "yearly";
}

export function WalletBalanceChart({ wallet, transactions, viewType }: WalletBalanceChartProps) {
  const { t } = useLanguage();

  // Get recent transactions for this wallet
  const walletTransactions = transactions
    .filter(t => t.walletId === wallet.id)
    .slice(0, 10)
    .map(t => ({
      name: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      amount: t.amount,
      type: t.type
    }))
    .reverse(); // Show most recent first

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">{t('current_balance')}</p>
        <p className="text-2xl font-bold">{formatCurrency(wallet.balance)}</p>
      </div>
      <ChartContainer height={200}>
        <BarChart data={walletTransactions}>
          <CartesianGrid strokeDasharray="3 3" />
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
      </ChartContainer>
    </div>
  );
}
