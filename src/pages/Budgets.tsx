
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { calculatePercentage } from "@/lib/utils";

// Dummy data for budgets
const budgets = [
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('budgets')}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('add_budget')}
        </Button>
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

          return (
            <Card key={budget.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>{t(budget.category)}</span>
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
