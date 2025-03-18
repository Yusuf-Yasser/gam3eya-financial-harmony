
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Transaction, wallets } from "@/data/dummyData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Paperclip } from "lucide-react";

// Separate categories for expense and income
const expenseCategoryOptions = [
  "groceries", "transportation", "entertainment", "dining_out", "utilities", 
  "housing", "healthcare", "clothing", "education", "savings", "other"
];

const incomeCategoryOptions = [
  "salary", "freelance", "investments", "gifts", "refunds", "side_hustle", "other"
];

interface TransactionFormProps {
  isEditing: boolean;
  onSave: (transaction: Transaction) => void;
  editingTransaction?: Transaction;
  onCancel: () => void;
}

export function TransactionForm({ isEditing, onSave, editingTransaction, onCancel }: TransactionFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [transaction, setTransaction] = useState<{
    id?: string;
    description: string;
    amount: number;
    date: string;
    category: string;
    type: string;
    walletId: string;
    receiptUrl: string | undefined;
  }>({
    id: "",
    description: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category: "",
    type: "expense",
    walletId: wallets.length > 0 ? wallets[0].id : "",
    receiptUrl: undefined
  });

  useEffect(() => {
    if (isEditing && editingTransaction) {
      setTransaction({
        ...editingTransaction,
        id: editingTransaction.id,
        receiptUrl: editingTransaction.receiptUrl || undefined
      });
    }
  }, [isEditing, editingTransaction]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTransaction({
      ...transaction,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setTransaction({
      ...transaction,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const receiptUrl = URL.createObjectURL(file);
      setTransaction({
        ...transaction,
        receiptUrl
      });
      toast({
        title: t('receipt_attached'),
        description: file.name,
      });
    }
  };

  const handleSave = () => {
    if (!transaction.description || !transaction.amount || !transaction.category) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_all_required_fields'),
        variant: "destructive",
      });
      return;
    }

    const savedTransaction: Transaction = {
      id: transaction.id || `t${Date.now()}`,
      description: transaction.description,
      amount: transaction.amount,
      date: transaction.date,
      category: transaction.category,
      type: transaction.type as 'income' | 'expense',
      walletId: transaction.walletId,
      receiptUrl: transaction.receiptUrl,
    };

    onSave(savedTransaction);
  };

  const categoryOptions = transaction.type === 'income' 
    ? incomeCategoryOptions 
    : expenseCategoryOptions;

  return (
    <div className="grid gap-4 py-4">
      <RadioGroup 
        defaultValue="expense" 
        className="flex justify-center space-x-4"
        value={transaction.type}
        onValueChange={(value) => {
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
          value={transaction.description}
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
            value={transaction.amount || ""}
            onChange={handleInputChange}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="date">{t('date')}</Label>
          <Input 
            id="date" 
            name="date"
            type="date"
            value={transaction.date}
            onChange={handleInputChange}
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="category">{t('category')}</Label>
        <Select 
          onValueChange={(value) => handleSelectChange("category", value)}
          value={transaction.category}
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
          value={transaction.walletId}
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
            {transaction.receiptUrl ? t('receipt_attached') : t('attach_receipt')}
          </Button>
          {transaction.receiptUrl && (
            <img 
              src={transaction.receiptUrl} 
              alt="Receipt preview" 
              className="w-12 h-12 object-cover rounded border" 
            />
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 mt-4">
        <Button variant="outline" onClick={onCancel}>
          {t('cancel')}
        </Button>
        <Button onClick={handleSave}>
          {isEditing ? t('update_transaction') : t('add_transaction')}
        </Button>
      </div>
    </div>
  );
}
