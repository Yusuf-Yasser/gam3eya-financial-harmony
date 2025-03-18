
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { transactions as initialTransactions } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Transaction } from "@/data/dummyData";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";

const Transactions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  
  const itemsPerPage = 10;

  const handleAddOrUpdateTransaction = (transaction: Transaction) => {
    if (isEditing) {
      const updatedTransactions = transactions.map(t => 
        t.id === transaction.id ? transaction : t
      );
      setTransactions(updatedTransactions);
      toast({
        title: t('success'),
        description: t('transaction_updated_successfully'),
      });
    } else {
      setTransactions([transaction, ...transactions]);
      toast({
        title: t('success'),
        description: t('transaction_added_successfully'),
      });
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingTransaction(undefined);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setIsEditing(true);
    setEditingTransaction(transaction);
    setOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) resetForm();
  };

  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(transaction.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('transactions')}</h1>
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t('add_transaction')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {isEditing ? t('edit_transaction') : t('add_new_transaction')}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? t('edit_transaction_details') : t('enter_transaction_details')}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm 
              isEditing={isEditing}
              editingTransaction={editingTransaction}
              onSave={handleAddOrUpdateTransaction}
              onCancel={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('all_transactions')}</CardTitle>
          <CardDescription>
            {t('view_and_manage_your_financial_activities')}
          </CardDescription>
          <TransactionFilters 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
        </CardHeader>
        <CardContent>
          {currentTransactions.length > 0 ? (
            <>
              <TransactionList 
                transactions={currentTransactions} 
                onEdit={handleEditTransaction}
              />
              <TransactionPagination 
                currentPage={currentPage}
                totalItems={filteredTransactions.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('no_transactions_found')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
