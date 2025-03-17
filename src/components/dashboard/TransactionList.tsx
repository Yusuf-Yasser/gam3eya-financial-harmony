
import { useLanguage } from "@/contexts/LanguageContext";
import { Transaction } from "@/data/dummyData";
import { formatDate } from "@/lib/utils";
import { ArrowDown, ArrowUp, Eye, Pencil } from "lucide-react";
import { useState } from "react";

interface TransactionListProps {
  transactions: Transaction[];
  limit?: number;
  onEdit?: (transaction: Transaction) => void;
}

export function TransactionList({ transactions, limit, onEdit }: TransactionListProps) {
  const { t } = useLanguage();
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const toggleExpand = (id: string) => {
    setExpandedTransactionId(expandedTransactionId === id ? null : id);
  };

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
          className="bg-white rounded-lg shadow-sm border overflow-hidden"
        >
          <div 
            className="flex items-center justify-between p-3 cursor-pointer" 
            onClick={() => toggleExpand(transaction.id)}
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
            <div className="flex items-center">
              <div className="text-right mr-4">
                <p className={`font-bold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} EGP {transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">{formatDate(transaction.date)}</p>
              </div>
              {onEdit && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(transaction);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
          
          {expandedTransactionId === transaction.id && (
            <div className="px-4 pb-4 pt-0 border-t">
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">{t('description')}</p>
                  <p className="font-medium">{transaction.description}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('date')}</p>
                  <p className="font-medium">{formatDate(transaction.date)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('category')}</p>
                  <p className="font-medium">{t(transaction.category)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('amount')}</p>
                  <p className="font-medium">{transaction.amount.toLocaleString()} EGP</p>
                </div>
              </div>
              
              {transaction.receiptUrl && (
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground mb-2">{t('receipt')}</p>
                  <img 
                    src={transaction.receiptUrl} 
                    alt="Receipt" 
                    className="max-h-48 rounded-md border object-cover" 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
