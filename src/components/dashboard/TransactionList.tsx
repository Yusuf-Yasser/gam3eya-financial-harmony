
import { useLanguage } from "@/contexts/LanguageContext";
import { Transaction } from "@/data/dummyData";
import { formatDate } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
}

export function TransactionList({ transactions, limit }: TransactionListProps) {
  const { t } = useLanguage();
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  if (displayTransactions.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">{t('no_transactions')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayTransactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'income' ? (
                <ArrowDown className="w-5 h-5 text-green-600" />
              ) : (
                <ArrowUp className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div>
              <p className="font-medium">{t(transaction.category)}</p>
              <p className="text-xs text-muted-foreground">{transaction.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'} EGP {transaction.amount.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
