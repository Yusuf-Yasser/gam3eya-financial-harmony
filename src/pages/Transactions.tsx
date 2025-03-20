import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionList } from "@/components/dashboard/TransactionList";
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
import { Transaction } from "@/types";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { FilterOptions } from "@/components/transactions/AdvancedTransactionFilters";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { useLocation, useSearchParams } from "react-router-dom";
import { transactionsApi } from "@/services/api";

const getMaxAmount = (transactions: Transaction[]): number => {
  const maxAmount = Math.max(...transactions.map(t => t.amount), 0);
  return Math.ceil(maxAmount / 1000) * 1000 || 10000; // Default to 10000 if no transactions
};

const getUniqueCategories = (transactions: Transaction[]): string[] => {
  return Array.from(new Set(transactions.map(t => t.category)));
};

const Transactions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  
  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionsApi.getAll();
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: t('error'),
        description: t('failed_to_load_transactions'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const maxAmount = useMemo(() => getMaxAmount(transactions), [transactions]);
  const categories = useMemo(() => getUniqueCategories(transactions), [transactions]);
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    dateRange: { from: undefined, to: undefined },
    categories: [],
    amountRange: { min: 0, max: maxAmount },
    types: []
  });
  
  // Update filter max amount when transactions change
  useEffect(() => {
    setFilterOptions(prev => ({
      ...prev,
      amountRange: { ...prev.amountRange, max: maxAmount }
    }));
  }, [maxAmount]);

  useEffect(() => {
    const queryParam = searchParams.get('search');
    if (queryParam) {
      setSearchTerm(queryParam);
    }
  }, [searchParams]);

  const hasActiveFilters = useMemo(() => {
    return (
      !!filterOptions.dateRange.from || 
      !!filterOptions.dateRange.to || 
      filterOptions.categories.length > 0 || 
      filterOptions.types.length > 0 ||
      filterOptions.amountRange.min > 0 || 
      filterOptions.amountRange.max < maxAmount ||
      searchTerm.trim() !== ""
    );
  }, [filterOptions, maxAmount, searchTerm]);
  
  const itemsPerPage = 10;

  const handleAddOrUpdateTransaction = async (transaction: Transaction) => {
    try {
      if (isEditing) {
        await transactionsApi.update(transaction);
        const updatedTransactions = transactions.map(t => 
          t.id === transaction.id ? transaction : t
        );
        setTransactions(updatedTransactions);
        toast({
          title: t('success'),
          description: t('transaction_updated_successfully'),
        });
      } else {
        const newTransaction = await transactionsApi.create(transaction);
        setTransactions([newTransaction, ...transactions]);
        toast({
          title: t('success'),
          description: t('transaction_added_successfully'),
        });
      }
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast({
        title: t('error'),
        description: isEditing ? t('failed_to_update_transaction') : t('failed_to_add_transaction'),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingTransaction(undefined);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setIsEditing(true);
    setEditingTransaction(transaction);
    setOpen(true);
    if (viewingTransaction?.id === transaction.id) {
      setViewingTransaction(null);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) resetForm();
  };

  const handleViewTransaction = (transaction: Transaction) => {
    setViewingTransaction(transaction);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    
    if (term) {
      searchParams.set('search', term);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = 
        searchTerm === "" || 
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t(transaction.categoryName || transaction.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.amount.toString().includes(searchTerm) ||
        new Date(transaction.date).toLocaleDateString().includes(searchTerm);

      if (!matchesSearch) return false;

      const transactionDate = new Date(transaction.date);
      const matchesFromDate = !filterOptions.dateRange.from || 
        transactionDate >= filterOptions.dateRange.from;
      const matchesToDate = !filterOptions.dateRange.to || 
        transactionDate <= filterOptions.dateRange.to;

      if (!matchesFromDate || !matchesToDate) return false;

      const matchesCategory = 
        filterOptions.categories.length === 0 || 
        filterOptions.categories.includes(transaction.category);

      if (!matchesCategory) return false;

      const matchesType = 
        filterOptions.types.length === 0 || 
        filterOptions.types.includes(transaction.type);

      if (!matchesType) return false;

      const matchesAmount = 
        transaction.amount >= filterOptions.amountRange.min && 
        transaction.amount <= filterOptions.amountRange.max;

      return matchesAmount;
    });
  }, [transactions, searchTerm, filterOptions, t]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setCurrentPage(1);
  };

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
            onSearchChange={handleSearchChange}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            categories={categories}
            maxAmount={maxAmount}
            hasActiveFilters={hasActiveFilters}
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">{t('loading')}...</p>
            </div>
          ) : currentTransactions.length > 0 ? (
            <>
              <TransactionList 
                transactions={currentTransactions} 
                onView={handleViewTransaction}
                onEdit={handleEditTransaction}
                showControls={true}
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
              <p className="text-muted-foreground">
                {hasActiveFilters ? t('no_matching_transactions') : t('no_transactions_found')}
              </p>
              {hasActiveFilters && (
                <Button 
                  variant="link" 
                  onClick={() => {
                    setFilterOptions({
                      dateRange: { from: undefined, to: undefined },
                      categories: [],
                      amountRange: { min: 0, max: maxAmount },
                      types: []
                    });
                  }}
                >
                  {t('clear_filters')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetails
        transaction={viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        onEdit={handleEditTransaction}
      />
    </div>
  );
};

export default Transactions;
