
import React from 'react';
import { Transaction } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IncomeIcon, ExpenseIcon } from './TransactionIcons';

interface TransactionListProps {
  transactions: Transaction[];
  emptyMessage?: string;
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  emptyMessage,
  onEdit
}) => {
  const { t } = useLanguage();

  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        {emptyMessage || t('no_transactions')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div 
          key={transaction.id} 
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
          onClick={() => onEdit && onEdit(transaction)}
        >
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
            </div>
            <div>
              <div className="font-medium">{transaction.description}</div>
              <div className="text-sm text-muted-foreground">{formatDate(transaction.date)} • {transaction.category}</div>
            </div>
          </div>
          <div className={`font-medium ${
            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  );
};
