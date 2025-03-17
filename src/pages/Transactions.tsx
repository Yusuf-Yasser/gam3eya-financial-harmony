
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { TransactionList } from "@/components/dashboard/TransactionList";
import { transactions as initialTransactions, wallets } from "@/data/dummyData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Plus, Paperclip } from "lucide-react";
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
import { Transaction } from "@/data/dummyData";

// Separate categories for expense and income
const expenseCategoryOptions = [
  "groceries", "transportation", "entertainment", "dining_out", "utilities", 
  "housing", "healthcare", "clothing", "education", "savings", "other"
];

const incomeCategoryOptions = [
  "salary", "freelance", "investments", "gifts", "refunds", "side_hustle", "other"
];

const Transactions = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "",
    type: "expense",
    walletId: wallets.length > 0 ? wallets[0].id : "",
    receiptUrl: ""
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a fake URL for the uploaded file (in a real app, you would upload to a server)
      const receiptUrl = URL.createObjectURL(file);
      setNewTransaction({
        ...newTransaction,
        receiptUrl
      });
      toast({
        title: t('receipt_attached'),
        description: file.name,
      });
    }
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

    if (isEditing) {
      // Update existing transaction
      const updatedTransactions = transactions.map(t => 
        t.id === newTransaction.id ? 
          {...newTransaction, type: newTransaction.type as 'income' | 'expense'} : 
          t
      );
      setTransactions(updatedTransactions);
      toast({
        title: t('success'),
        description: t('transaction_updated_successfully'),
      });
    } else {
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
        receiptUrl: newTransaction.receiptUrl || undefined,
      };

      setTransactions([createdTransaction, ...transactions]);
      toast({
        title: t('success'),
        description: t('transaction_added_successfully'),
      });
    }

    setOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setNewTransaction({
      id: "",
      description: "",
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      category: "",
      type: "expense",
      walletId: wallets.length > 0 ? wallets[0].id : "",
      receiptUrl: ""
    });
    setIsEditing(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setIsEditing(true);
    setNewTransaction({
      ...transaction,
      id: transaction.id,
    });
    setOpen(true);
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

  // Get appropriate category options based on transaction type
  const categoryOptions = newTransaction.type === 'income' 
    ? incomeCategoryOptions 
    : expenseCategoryOptions;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('transactions')}</h1>
        <Dialog open={open} onOpenChange={(open) => {
          setOpen(open);
          if (!open) resetForm();
        }}>
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
            <div className="grid gap-4 py-4">
              <RadioGroup 
                defaultValue="expense" 
                className="flex justify-center space-x-4"
                value={newTransaction.type}
                onValueChange={(value) => {
                  // Reset category when changing transaction type
                  handleSelectChange("type", value);
                  handleSelectChange("category", "");
                }}
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
              
              <div className="grid gap-2">
                <Label htmlFor="receipt">{t('receipt')}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="receipt"
                    name="receipt"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('receipt')?.click()}
                    className="w-full"
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    {newTransaction.receiptUrl ? t('receipt_attached') : t('attach_receipt')}
                  </Button>
                  {newTransaction.receiptUrl && (
                    <img 
                      src={newTransaction.receiptUrl} 
                      alt="Receipt preview" 
                      className="w-12 h-12 object-cover rounded border" 
                    />
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddTransaction}>
                {isEditing ? t('update_transaction') : t('add_transaction')}
              </Button>
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
              <TransactionList 
                transactions={currentTransactions} 
                onEdit={handleEditTransaction}
              />
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
