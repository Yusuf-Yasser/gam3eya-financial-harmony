
import { useState } from "react";
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

// Dummy data for budgets
const initialBudgets = [
  {
    id: 1,
    category: "groceries",
    allocated: 2000,
    spent: 1250,
    remaining: 750,
    color: "#83C5BE"
  },
  {
    id: 2,
    category: "transportation",
    allocated: 1000,
    spent: 700,
    remaining: 300,
    color: "#E29578"
  },
  {
    id: 3,
    category: "entertainment",
    allocated: 800,
    spent: 850,
    remaining: -50,
    color: "#006D77"
  },
  {
    id: 4,
    category: "dining_out",
    allocated: 1200,
    spent: 900,
    remaining: 300,
    color: "#FFDDD2"
  }
];

const Budgets = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { getExpenseCategories } = useCategories();
  const [budgets, setBudgets] = useState(initialBudgets);
  const [open, setOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    category: "",
    allocated: 0,
    spent: 0,
  });

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

  const handleAddBudget = () => {
    // Basic validation
    if (!newBudget.category || !newBudget.allocated) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_all_required_fields'),
        variant: "destructive",
      });
      return;
    }

    const remaining = newBudget.allocated - newBudget.spent;
    
    // Find category color if available
    const categoryObj = expenseCategories.find(c => c.id === newBudget.category);
    const categoryColor = categoryObj?.color || "#83C5BE";
    
    const newId = Math.max(...budgets.map(b => b.id)) + 1;

    const createdBudget = {
      id: newId,
      category: newBudget.category,
      allocated: newBudget.allocated,
      spent: newBudget.spent,
      remaining: remaining,
      color: categoryColor
    };

    setBudgets([...budgets, createdBudget]);
    setOpen(false);
    setNewBudget({
      category: "",
      allocated: 0,
      spent: 0,
    });

    toast({
      title: t('success'),
      description: t('budget_added_successfully'),
    });
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
                    id="allocated" 
                    name="allocated"
                    type="number"
                    value={newBudget.allocated || ""}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((budget) => {
          const percentage = calculatePercentage(budget.spent, budget.allocated);
          const isOverBudget = budget.spent > budget.allocated;
          
          // Find category to get proper name
          const categoryObj = expenseCategories.find(c => c.id === budget.category);
          const categoryName = categoryObj ? categoryObj.name : budget.category;

          return (
            <Card key={budget.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{t(categoryName)}</span>
                  <span className={isOverBudget ? "text-red-500" : ""}>
                    {percentage}%
                  </span>
                </CardTitle>
                <CardDescription>
                  {t('monthly_budget')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2 mb-4"
                  style={{ 
                    '--progress-color': isOverBudget ? '#f87171' : budget.color
                  } as any}
                />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('allocated')}</p>
                    <p className="font-bold">EGP {budget.allocated.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('spent')}</p>
                    <p className={`font-bold ${isOverBudget ? "text-red-500" : ""}`}>
                      EGP {budget.spent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('remaining')}</p>
                    <p className={`font-bold ${isOverBudget ? "text-red-500" : ""}`}>
                      EGP {budget.remaining.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;
