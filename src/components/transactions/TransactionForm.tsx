
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories } from "@/contexts/CategoryContext";
import { Transaction, wallets } from "@/data/dummyData";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Paperclip } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Define form schema using zod
const formSchema = z.object({
  description: z.string().min(3, { message: "Description must be at least 3 characters" }),
  amount: z.number().positive({ message: "Amount must be positive" }),
  date: z.string().nonempty({ message: "Date is required" }),
  category: z.string().nonempty({ message: "Please select a category" }),
  type: z.enum(["income", "expense"]),
  walletId: z.string().nonempty({ message: "Please select a wallet" }),
});

type FormValues = z.infer<typeof formSchema> & {
  receiptUrl?: string;
};

interface TransactionFormProps {
  isEditing: boolean;
  onSave: (transaction: Transaction) => void;
  editingTransaction?: Transaction;
  onCancel: () => void;
}

export function TransactionForm({ isEditing, onSave, editingTransaction, onCancel }: TransactionFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getExpenseCategories, getIncomeCategories } = useCategories();
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  
  // Initialize form with react-hook-form and zod validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: undefined, // Changed from 0 to undefined to avoid the 0 being displayed initially
      date: new Date().toISOString().split('T')[0],
      category: "",
      type: "expense",
      walletId: wallets.length > 0 ? wallets[0].id : "",
      receiptUrl: undefined
    }
  });
  
  // Update form values when editing an existing transaction
  useEffect(() => {
    if (isEditing && editingTransaction) {
      form.reset({
        description: editingTransaction.description,
        amount: editingTransaction.amount,
        date: editingTransaction.date,
        category: editingTransaction.category,
        type: editingTransaction.type,
        walletId: editingTransaction.walletId,
      });
      setReceiptUrl(editingTransaction.receiptUrl);
    }
  }, [isEditing, editingTransaction, form]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setReceiptUrl(fileUrl);
      toast({
        title: t('receipt_attached'),
        description: file.name,
      });
    }
  };

  // Form submission handler
  const onSubmit = (values: FormValues) => {
    const savedTransaction: Transaction = {
      id: editingTransaction?.id || `t${Date.now()}`,
      description: values.description,
      amount: values.amount,
      date: values.date,
      category: values.category,
      type: values.type,
      walletId: values.walletId,
      receiptUrl: receiptUrl,
    };

    onSave(savedTransaction);
  };

  // Get current category options based on selected transaction type
  const getCategoryOptions = () => {
    return form.watch("type") === "income" 
      ? getIncomeCategories() 
      : getExpenseCategories();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Transaction Type Selection */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <RadioGroup 
                  className="flex justify-center space-x-4"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.setValue("category", ""); // Reset category when type changes
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
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Description Field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Amount and Date Fields */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('amount')}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    {...field} 
                    value={field.value === undefined ? "" : field.value}
                    onChange={(e) => {
                      // Only set the value if there's something in the input
                      const value = e.target.value;
                      field.onChange(value === "" ? undefined : parseFloat(value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('date')}</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Category Selection */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center">
                <FormLabel>{t('category')}</FormLabel>
                <CategoryDialog type={form.watch("type")} variant="outline" />
              </div>
              <Select 
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_category')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getCategoryOptions().map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {t(category.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Wallet Selection */}
        <FormField
          control={form.control}
          name="walletId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('wallet')}</FormLabel>
              <Select 
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_wallet')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {wallets.map((wallet) => (
                    <SelectItem key={wallet.id} value={wallet.id}>
                      {wallet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Receipt Upload */}
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
              {receiptUrl ? t('receipt_attached') : t('attach_receipt')}
            </Button>
            {receiptUrl && (
              <img 
                src={receiptUrl} 
                alt="Receipt preview" 
                className="w-12 h-12 object-cover rounded border" 
              />
            )}
          </div>
        </div>
        
        {/* Form submission buttons */}
        <div className="flex justify-end space-x-2 mt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            {t('cancel')}
          </Button>
          <Button type="submit">
            {isEditing ? t('update_transaction') : t('add_transaction')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
