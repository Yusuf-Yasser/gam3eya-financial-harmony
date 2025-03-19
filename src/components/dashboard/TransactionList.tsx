
import React from 'react';
import { Transaction } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCurrency, formatDate } from '@/lib/utils';
import { IncomeIcon, ExpenseIcon } from './TransactionIcons';
import { Button } from '@/components/ui/button';
import { Pencil, Eye } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  emptyMessage?: string;
  onView?: (transaction: Transaction) => void;
  onEdit?: (transaction: Transaction) => void;
  showControls?: boolean;
}

export const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  emptyMessage,
  onView,
  onEdit,
  showControls = false
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
          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div 
            className="flex items-center space-x-4 flex-1 cursor-pointer"
            onClick={() => onView && onView(transaction)}
          >
            <div className={`p-2 rounded-full ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
            </div>
            <div>
              <div className="font-medium">{transaction.description}</div>
              <div className="text-sm text-muted-foreground">{formatDate(transaction.date)} • {t(transaction.category)}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
            </div>
            {showControls && (
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => onView && onView(transaction)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit && onEdit(transaction);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
