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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Transaction } from "@/types";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionFilters } from "@/components/transactions/TransactionFilters";
import { TransactionPagination } from "@/components/transactions/TransactionPagination";
import { FilterOptions } from "@/components/transactions/AdvancedTransactionFilters";
import { TransactionDetails } from "@/components/transactions/TransactionDetails";
import { useLocation, useSearchParams } from "react-router-dom";
import { transactionsApi, walletsApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";

// Define SortDirection and SortKey types
export type SortDirection = 'asc' | 'desc';
export type SortKey = 'date' | 'description' | 'categoryName' | 'amount' | 'type'; // Added 'type'

export interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

const getMaxAmount = (transactions: Transaction[]): number => {
  const maxAmount = Math.max(...transactions.map(t => t.amount), 0);
  return Math.ceil(maxAmount / 1000) * 1000 || 10000;
};

const getUniqueCategories = (transactions: Transaction[]): string[] => {
  return Array.from(new Set(transactions.map(t => t.category)));
};

const Transactions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize state from URL params or defaults
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || "");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [currentPage, setCurrentPage] = useState(() => parseInt(searchParams.get('page') || '1', 10));
  
  const initialSortConfig = useMemo((): SortConfig => {
    const sortKey = searchParams.get('sortKey') as SortKey | null;
    const sortDirection = searchParams.get('sortDir') as SortDirection | null;
    return { key: sortKey || 'date', direction: sortDirection || 'desc' };
  }, [searchParams]);
  const [sortConfig, setSortConfig] = useState<SortConfig>(initialSortConfig);

  const initialFilterOptions = useMemo((): FilterOptions => {
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const categoriesParam = searchParams.get('categories');
    const typesParam = searchParams.get('types');
    const minAmountParam = searchParams.get('minAmount');
    const maxAmountParam = searchParams.get('maxAmount');
    return {
      dateRange: {
        from: fromDate ? new Date(fromDate) : undefined,
        to: toDate ? new Date(toDate) : undefined,
      },
      categories: categoriesParam ? categoriesParam.split(',') : [],
      types: typesParam ? typesParam.split(',') : [],
      amountRange: {
        min: minAmountParam ? parseInt(minAmountParam, 10) : 0,
        max: maxAmountParam ? parseInt(maxAmountParam, 10) : Infinity, // Temp, will be adjusted by maxAmount from transactions
      },
    };
  }, [searchParams]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(initialFilterOptions);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);
  
  useEffect(() => {
    fetchTransactions();
  }, []);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  
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
  
  // Adjust filterOptions.amountRange.max based on fetched transactions and URL param
  useEffect(() => {
    setFilterOptions(prev => {
      const maxAmountFromUrl = searchParams.get('maxAmount');
      const initialMax = maxAmountFromUrl ? parseInt(maxAmountFromUrl, 10) : prev.amountRange.max;
      return {
        ...prev,
        amountRange: {
          ...prev.amountRange,
          max: (initialMax === Infinity || initialMax > maxAmount) ? maxAmount : initialMax,
        }
      };
    });
  }, [maxAmount, searchParams]); // Rely on maxAmount from transactions to be calculated

  // Update URL search params when relevant states change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    if (searchTerm.trim()) newSearchParams.set('search', searchTerm.trim());
    if (currentPage !== 1) newSearchParams.set('page', currentPage.toString());
    
    if (sortConfig.key !== 'date' || sortConfig.direction !== 'desc') {
      newSearchParams.set('sortKey', sortConfig.key);
      newSearchParams.set('sortDir', sortConfig.direction);
    }

    if (filterOptions.dateRange.from) newSearchParams.set('fromDate', filterOptions.dateRange.from.toISOString().split('T')[0]);
    if (filterOptions.dateRange.to) newSearchParams.set('toDate', filterOptions.dateRange.to.toISOString().split('T')[0]);
    if (filterOptions.categories.length > 0) newSearchParams.set('categories', filterOptions.categories.join(','));
    if (filterOptions.types.length > 0) newSearchParams.set('types', filterOptions.types.join(','));
    if (filterOptions.amountRange.min > 0) newSearchParams.set('minAmount', filterOptions.amountRange.min.toString());
    if (filterOptions.amountRange.max < maxAmount && filterOptions.amountRange.max !== Infinity) {
      newSearchParams.set('maxAmount', filterOptions.amountRange.max.toString());
    }
    
    // Only update if searchParams actually changed to avoid loops
    if (newSearchParams.toString() !== searchParams.toString()) {
        setSearchParams(newSearchParams, { replace: true });
    }
  }, [searchTerm, currentPage, sortConfig, filterOptions, maxAmount, searchParams, setSearchParams]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      // setCurrentPage(1); // Page reset is handled by filter/sort changes directly or initial load
    }, 500); // 500ms delay
    return () => clearTimeout(handler);
  }, [searchTerm]);
  
  const hasActiveFilters = useMemo(() => {
    return (
      !!filterOptions.dateRange.from || 
      !!filterOptions.dateRange.to || 
      filterOptions.categories.length > 0 || 
      filterOptions.types.length > 0 ||
      filterOptions.amountRange.min > 0 || 
      (filterOptions.amountRange.max < maxAmount && filterOptions.amountRange.max !== Infinity) ||
      debouncedSearchTerm.trim() !== ""
    );
  }, [filterOptions, maxAmount, debouncedSearchTerm]);
  
  const itemsPerPage = 10;

  const activeFiltersDisplay = useMemo(() => {
    const active: string[] = [];
    if (filterOptions.dateRange.from || filterOptions.dateRange.to) {
      const from = filterOptions.dateRange.from ? new Date(filterOptions.dateRange.from).toLocaleDateString() : '';
      const to = filterOptions.dateRange.to ? new Date(filterOptions.dateRange.to).toLocaleDateString() : '';
      if (from && to) active.push(`${t('date')}: ${from} - ${to}`);
      else if (from) active.push(`${t('date_from')}: ${from}`);
      else if (to) active.push(`${t('date_to')}: ${to}`);
    }
    if (filterOptions.categories.length > 0) {
      active.push(`${t('categories')}: ${filterOptions.categories.map(c => t(c)).join(', ')}`);
    }
    if (filterOptions.types.length > 0) {
      active.push(`${t('types')}: ${filterOptions.types.map(type => t(type)).join(', ')}`);
    }
    if (filterOptions.amountRange.min > 0 || (filterOptions.amountRange.max < maxAmount && filterOptions.amountRange.max !== Infinity) ) {
        const minDisplay = filterOptions.amountRange.min;
        const maxDisplay = (filterOptions.amountRange.max === Infinity || filterOptions.amountRange.max === maxAmount) 
                           ? t('max') 
                           : filterOptions.amountRange.max;
        active.push(`${t('amount')}: ${minDisplay} - ${maxDisplay}`);
    }
    if (debouncedSearchTerm.trim() !== "") {
      active.push(`${t('search')}: "${debouncedSearchTerm}"`);
    }
    return active;
  }, [filterOptions, debouncedSearchTerm, t, maxAmount]);

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
        setTransactions([newTransaction, ...transactions]); // New transactions still go to the top
        toast({
          title: t('success'),
          description: t('transaction_added_successfully'),
        });
      }
      setOpen(false);
      resetForm();
      await walletsApi.getAll(); // Refresh wallets
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
    setCurrentPage(1); // Reset page on new search term
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await transactionsApi.delete(transactionId);
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
      setTransactionToDelete(null);
      if (viewingTransaction?.id === transactionId) {
        setViewingTransaction(null);
      }
      toast({ title: t('success'), description: t('transaction_deleted_successfully') });
      await walletsApi.getAll();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast({ title: t('error'), description: t('failed_to_delete_transaction'), variant: 'destructive' });
    }
  };

  const handleDuplicateTransaction = async (transaction: Transaction) => {
    try {
      const duplicate: Omit<Transaction, 'id'> = {
        amount: transaction.amount,
        description: `${transaction.description} (${t('copy')})`,
        date: new Date().toISOString().split('T')[0],
        category: transaction.category, 
        categoryId: transaction.categoryId,
        type: transaction.type,
        walletId: transaction.walletId,
      };
      await transactionsApi.create(duplicate);
      await fetchTransactions(); // Re-fetch to get all, including new one with correct sorting from API
      await walletsApi.getAll(); // Refresh wallets
      toast({ title: t('success'), description: t('transaction_duplicated_successfully') });
    } catch (error) {
      console.error("Error duplicating transaction:", error);
      toast({ title: t('error'), description: t('failed_to_duplicate_transaction'), variant: 'destructive' });
    }
  };

  const filteredTransactions = useMemo(() => {
    let sortableTransactions = [...transactions];

    if (sortConfig.key) {
      sortableTransactions.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'categoryName') {
          valA = t(a.categoryName || a.category);
          valB = t(b.categoryName || b.category);
        }
        
        if (sortConfig.key === 'date' && typeof valA === 'string' && typeof valB === 'string') {
          const dateA = new Date(valA).getTime();
          const dateB = new Date(valB).getTime();
          if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'string' && typeof valB === 'string') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return sortableTransactions.filter(transaction => {
      const lowerDebouncedSearchTerm = debouncedSearchTerm.toLowerCase();
      const searchAmount = parseFloat(debouncedSearchTerm);

      const matchesSearch = 
        debouncedSearchTerm.trim() === "" || 
        transaction.description.toLowerCase().includes(lowerDebouncedSearchTerm) ||
        t(transaction.categoryName || transaction.category).toLowerCase().includes(lowerDebouncedSearchTerm) ||
        (!isNaN(searchAmount) && transaction.amount === searchAmount) ||
        new Date(transaction.date).toLocaleDateString().includes(debouncedSearchTerm);

      if (!matchesSearch) return false;

      const transactionDate = new Date(transaction.date);
      const matchesFromDate = !filterOptions.dateRange.from || transactionDate >= filterOptions.dateRange.from;
      const matchesToDate = !filterOptions.dateRange.to || transactionDate <= filterOptions.dateRange.to;
      if (!matchesFromDate || !matchesToDate) return false;

      const matchesCategory = filterOptions.categories.length === 0 || filterOptions.categories.includes(transaction.category);
      if (!matchesCategory) return false;

      const matchesType = filterOptions.types.length === 0 || filterOptions.types.includes(transaction.type);
      if (!matchesType) return false;

      const matchesAmount = 
        transaction.amount >= filterOptions.amountRange.min && 
        transaction.amount <= filterOptions.amountRange.max;
      return matchesAmount;
    });
  }, [transactions, debouncedSearchTerm, filterOptions, t, sortConfig]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirstItem, indexOfLastItem);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setCurrentPage(1); // Reset page when filters change
  };

  const handleSortChange = (key: SortKey, direction?: SortDirection) => {
    setSortConfig(prevConfig => {
      if (direction) return { key, direction };
      if (prevConfig.key === key) return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
      return { key, direction: 'asc' };
    });
    setCurrentPage(1); // Reset page when sort changes
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
              <DialogTitle>{isEditing ? t('edit_transaction') : t('add_new_transaction')}</DialogTitle>
              <DialogDescription>{isEditing ? t('edit_transaction_details') : t('enter_transaction_details')}</DialogDescription>
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
          <CardDescription>{t('view_and_manage_your_financial_activities')}</CardDescription>
          <TransactionFilters 
            searchTerm={searchTerm} 
            onSearchChange={handleSearchChange}
            filterOptions={filterOptions}
            onFilterChange={handleFilterChange}
            categories={categories} // Pass dynamic categories
            maxAmount={maxAmount} // Pass dynamic maxAmount
            hasActiveFilters={hasActiveFilters}
            sortConfig={sortConfig}
            onSortChange={handleSortChange}
          />
          {activeFiltersDisplay.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {activeFiltersDisplay.map(filterText => (
                <Badge key={filterText} variant="secondary" className="text-xs">
                  {filterText}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10"><p className="text-muted-foreground">{t('loading')}...</p></div>
          ) : currentTransactions.length > 0 ? (
            <>
              <TransactionList 
                transactions={currentTransactions} 
                onView={handleViewTransaction}
                onEdit={handleEditTransaction}
                onDelete={(transaction: Transaction) => setTransactionToDelete(transaction)}
                onDuplicate={handleDuplicateTransaction}
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
                    // Reset filters and search term that affect hasActiveFilters
                    setFilterOptions({
                      dateRange: { from: undefined, to: undefined },
                      categories: [],
                      amountRange: { min: 0, max: maxAmount }, // Reset to current dynamic max
                      types: []
                    });
                    setSearchTerm(""); // Also clear search term input
                    // URL will be updated by useEffect for filterOptions and searchTerm
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
        onDelete={(transaction: Transaction) => setTransactionToDelete(transaction)}
        onDuplicate={handleDuplicateTransaction}
      />

      <AlertDialog open={!!transactionToDelete} onOpenChange={(open) => !open && setTransactionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_transaction')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete_transaction_confirmation')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (transactionToDelete) {
                  handleDeleteTransaction(transactionToDelete.id);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Transactions;
