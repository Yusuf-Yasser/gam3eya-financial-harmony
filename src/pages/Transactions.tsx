
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { transactions as initialTransactions, wallets } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const categoryOptions = [
  "groceries", "transportation", "entertainment", "dining_out", "utilities", 
  "housing", "healthcare", "clothing", "education", "savings", "other"
];

const Transactions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [open, setOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "",
    type: "expense",
    walletId: wallets.length > 0 ? wallets[0].id : ""
  });
  
  const itemsPerPage = 10;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTransaction({
      ...newTransaction,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewTransaction({
      ...newTransaction,
      [name]: value,
    });
  };

  const handleAddTransaction = () => {
    // Basic validation
    if (!newTransaction.description || !newTransaction.amount || !newTransaction.category) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_all_required_fields'),
        variant: "destructive",
      });
      return;
    }

    // Generate a string ID with 't' prefix and a number
    const maxId = transactions.reduce((max, t) => {
      const idNum = parseInt(t.id.replace('t', ''));
      return idNum > max ? idNum : max;
    }, 0);
    
    const newId = `t${maxId + 1}`;
    
    const createdTransaction = {
      id: newId,
      description: newTransaction.description,
      amount: newTransaction.amount,
      date: newTransaction.date,
      category: newTransaction.category,
      type: newTransaction.type as 'income' | 'expense',
      walletId: newTransaction.walletId,
    };

    setTransactions([createdTransaction, ...transactions]);
    setOpen(false);
    setNewTransaction({
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "",
      type: "expense",
      walletId: wallets.length > 0 ? wallets[0].id : ""
    });

    toast({
      title: t('success'),
      description: t('transaction_added_successfully'),
    });
  };

  // Filter transactions based on search term
  const filteredTransactions = transactions.filter(
    (transaction) =>
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t(transaction.category).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current transactions
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('transactions')}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t('add_transaction')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_transaction')}</DialogTitle>
              <DialogDescription>
                {t('enter_transaction_details')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <RadioGroup 
                defaultValue="expense" 
                className="flex justify-center space-x-4"
                value={newTransaction.type}
                onValueChange={(value) => handleSelectChange("type", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">{t('expense')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">{t('income')}</Label>
                </div>
              </RadioGroup>
              
              <div className="grid gap-2">
                <Label htmlFor="description">{t('description')}</Label>
                <Input 
                  id="description" 
                  name="description"
                  value={newTransaction.description}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">{t('amount')}</Label>
                  <Input 
                    id="amount" 
                    name="amount"
                    type="number"
                    value={newTransaction.amount || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">{t('date')}</Label>
                  <Input 
                    id="date" 
                    name="date"
                    type="date"
                    value={newTransaction.date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">{t('category')}</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("category", value)}
                  value={newTransaction.category}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_category')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((category) => (
                      <SelectItem key={category} value={category}>
                        {t(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="wallet">{t('wallet')}</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("walletId", value)}
                  value={newTransaction.walletId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_wallet')} />
                  </SelectTrigger>
                  <SelectContent>
                    {wallets.map((wallet) => (
                      <SelectItem key={wallet.id} value={wallet.id}>
                        {wallet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTransaction}>{t('add_transaction')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>{t('all_transactions')}</CardTitle>
          <CardDescription>
            {t('view_and_manage_your_financial_activities')}
          </CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t('search_transactions')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto w-full">
              <Filter className="mr-2 h-4 w-4" /> {t('filter')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {currentTransactions.length > 0 ? (
            <>
              <TransactionList transactions={currentTransactions} />
              <Pagination className="mt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                  {Array.from({ length: Math.ceil(filteredTransactions.length / itemsPerPage) }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        isActive={currentPage === i + 1}
                        onClick={() => paginate(i + 1)}
                        className="cursor-pointer"
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => 
                        paginate(Math.min(
                          Math.ceil(filteredTransactions.length / itemsPerPage), 
                          currentPage + 1
                        ))
                      }
                      className="cursor-pointer"
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
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
