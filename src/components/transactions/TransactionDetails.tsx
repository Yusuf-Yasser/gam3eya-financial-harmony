
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Transaction, wallets } from '@/data/dummyData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, X } from 'lucide-react';
import { IncomeIcon, ExpenseIcon } from '../dashboard/TransactionIcons';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
}

export function TransactionDetails({ transaction, onClose, onEdit }: TransactionDetailsProps) {
  const { t } = useLanguage();

  if (!transaction) return null;

  const walletName = wallets.find(w => w.id === transaction.walletId)?.name || '';

  return (
    <Dialog open={!!transaction} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t('transaction_details')}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className={`p-2 rounded-full mr-3 ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {transaction.type === 'income' ? <IncomeIcon /> : <ExpenseIcon />}
            </div>
            <div>
              <h3 className="text-lg font-semibold">{transaction.description}</h3>
              <p className="text-sm text-muted-foreground">
                {formatDate(transaction.date)} • {t(transaction.category)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('amount')}</p>
              <p className={`font-medium ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('wallet')}</p>
              <p className="font-medium">{walletName}</p>
            </div>
          </div>
          
          {transaction.receiptUrl && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">{t('receipt')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <img 
                    src={transaction.receiptUrl} 
                    alt="Receipt" 
                    className="max-h-64 object-contain rounded"
                  />
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
              onClick={() => onEdit(transaction)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {t('edit_transaction')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
