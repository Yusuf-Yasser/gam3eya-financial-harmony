
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Transaction, Wallet } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pencil, X, Trash, Copy } from 'lucide-react';
import { IncomeIcon, ExpenseIcon } from '../dashboard/TransactionIcons';
import { walletsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface TransactionDetailsProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onDuplicate?: (transaction: Transaction) => void;
}

export function TransactionDetails({ 
  transaction, 
  onClose, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: TransactionDetailsProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (transaction) {
      fetchWallets();
    }
  }, [transaction]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await walletsApi.getAll();
      setWallets(data);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: t('error'),
        description: t('failed_to_load_wallets'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
        {loading ? (
          <div className="p-4 text-center">{t('loading')}...</div>
        ) : (
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
                  {formatDate(transaction.date)} • {t(transaction.categoryName || transaction.category)}
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
            
            <div className="flex justify-end space-x-2">
              {onDuplicate && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                  onClick={() => onDuplicate(transaction)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {t('duplicate')}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center"
                onClick={() => onEdit(transaction)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                {t('edit')}
              </Button>
              
              {onDelete && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center bg-red-50 border-red-200 hover:bg-red-100 text-red-600"
                  onClick={() => onDelete(transaction)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  {t('delete')}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
