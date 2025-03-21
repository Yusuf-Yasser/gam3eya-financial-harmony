
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategories } from "@/contexts/CategoryContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { calculatePercentage } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { CategoryDialog } from "@/components/categories/CategoryDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Budget } from "@/types";
import { budgetsApi } from "@/services/api";

interface DisplayBudget extends Budget {
  color: string;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
}

const Budgets = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getExpenseCategories } = useCategories();
  const [budgets, setBudgets] = useState<DisplayBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    amount: 0,
    spent: 0,
  });

  // Fetch budgets on component mount
  useEffect(() => {
    fetchBudgets();
  }, []);
  
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const data = await budgetsApi.getAll();
      
      // Transform data for display
      const expenseCategories = getExpenseCategories();
      const transformedBudgets: DisplayBudget[] = data.map(budget => {
        const categoryObj = expenseCategories.find(c => c.id === budget.category);
        const remaining = budget.amount - budget.spent;
        const percentage = calculatePercentage(budget.spent, budget.amount);
        
        return {
          ...budget,
          color: categoryObj?.color || "#83C5BE",
          remaining,
          percentage,
          isOverBudget: budget.spent > budget.amount
        };
      });
      
      setBudgets(transformedBudgets);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast({
        title: t('error'),
        description: t('failed_to_load_budgets'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get expense categories for dropdown
  const expenseCategories = getExpenseCategories();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewBudget({
      ...newBudget,
      [name]: name === "category" ? value : Number(value),
    });
  };

  const handleCategoryChange = (value: string) => {
    setNewBudget({
      ...newBudget,
      category: value,
    });
  };

  const handleAddBudget = async () => {
    // Basic validation
    if (!newBudget.category || !newBudget.amount) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_all_required_fields'),
        variant: "destructive",
      });
      return;
    }

    try {
      const budgetToAdd = {
        category: newBudget.category,
        amount: newBudget.amount,
        spent: newBudget.spent,
        period: 'monthly' as const,
      };
      
      const response = await budgetsApi.create(budgetToAdd);
      
      // Use the spent amount returned from the server, which includes existing transactions
      const createdBudget = response.budget || response;
      
      // Find category color if available
      const categoryObj = expenseCategories.find(c => c.id === newBudget.category);
      const categoryColor = categoryObj?.color || "#83C5BE";
      
      const remaining = createdBudget.amount - createdBudget.spent;
      const percentage = calculatePercentage(createdBudget.spent, createdBudget.amount);
      
      const displayBudget: DisplayBudget = {
        ...createdBudget,
        color: categoryColor,
        remaining,
        percentage,
        isOverBudget: createdBudget.spent > createdBudget.amount
      };
      
      setBudgets([...budgets, displayBudget]);
      setOpen(false);
      setNewBudget({
        category: "",
        amount: 0,
        spent: 0,
      });

      toast({
        title: t('success'),
        description: t('budget_added_successfully'),
      });
    } catch (error) {
      console.error("Error adding budget:", error);
      toast({
        title: t('error'),
        description: t('failed_to_add_budget'),
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('budgets')}</h1>
        <div className="flex space-x-2">
          <CategoryDialog type="expense" variant="outline" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> {t('add_budget')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('add_new_budget')}</DialogTitle>
                <DialogDescription>
                  {t('create_budget_to_track_expenses')}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">{t('category')}</Label>
                  <Select 
                    onValueChange={handleCategoryChange}
                    value={newBudget.category}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('select_category')} />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {t(category.name)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="allocated">{t('allocated_amount')}</Label>
                  <Input 
                    id="amount" 
                    name="amount"
                    type="number"
                    value={newBudget.amount || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="spent">{t('spent_amount')}</Label>
                  <Input 
                    id="spent" 
                    name="spent"
                    type="number"
                    value={newBudget.spent || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddBudget}>{t('add_budget')}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Alert className="bg-masareef-light/50 border-masareef-primary">
        <AlertCircle className="h-4 w-4 text-masareef-primary" />
        <AlertTitle className="text-masareef-primary">{t('budget_tip')}</AlertTitle>
        <AlertDescription>
          {t('budget_tip_description')}
        </AlertDescription>
      </Alert>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">{t('loading')}...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.length > 0 ? (
            budgets.map((budget) => {
              // Find category to get proper name
              const categoryObj = expenseCategories.find(c => c.id === budget.category);
              const categoryName = categoryObj ? categoryObj.name : budget.category;

              return (
                <Card key={budget.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      <span>{t(categoryName)}</span>
                      <span className={budget.isOverBudget ? "text-red-500" : ""}>
                        {budget.percentage}%
                      </span>
                    </CardTitle>
                    <CardDescription>
                      {t('monthly_budget')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress 
                      value={Math.min(budget.percentage, 100)} 
                      className="h-2 mb-4"
                      style={{ 
                        '--progress-color': budget.isOverBudget ? '#f87171' : budget.color
                      } as any}
                    />
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">{t('allocated')}</p>
                        <p className="font-bold">EGP {budget.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('spent')}</p>
                        <p className={`font-bold ${budget.isOverBudget ? "text-red-500" : ""}`}>
                          EGP {budget.spent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t('remaining')}</p>
                        <p className={`font-bold ${budget.isOverBudget ? "text-red-500" : ""}`}>
                          EGP {budget.remaining.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-2 text-center py-10">
              <p className="text-muted-foreground">{t('no_budgets_found')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Budgets;
