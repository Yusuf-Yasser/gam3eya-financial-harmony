import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { X, RotateCcw, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category } from "@/types";
import { categoriesApi } from "@/services/api";

export interface FilterOptions {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  categories: string[];
  amountRange: {
    min: number;
    max: number;
  };
  types: string[];
}

interface AdvancedTransactionFiltersProps {
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClose: () => void;
  categories: string[];
  maxAmount: number;
}

const SectionLabel = ({ label, onClear }: { label: string; onClear?: () => void }) => (
  <div className="flex items-center justify-between">
    <Label>{label}</Label>
    {onClear && (
      <Button variant="ghost" size="icon" onClick={onClear} className="h-6 w-6">
        <RotateCcw className="h-3 w-3 text-muted-foreground" />
      </Button>
    )}
  </div>
);

export function AdvancedTransactionFilters({ 
  filterOptions, 
  onFilterChange, 
  onClose,
  categories,
  maxAmount 
}: AdvancedTransactionFiltersProps) {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(JSON.parse(JSON.stringify(filterOptions)));
  
  // State for storing full category objects
  const [categoryObjects, setCategoryObjects] = useState<Category[]>([]);
  
  // Fetch all categories with their types
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await categoriesApi.getAll();
        setCategoryObjects(fetchedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Separate categories by type
  const incomeCategories = useMemo(() => 
    categoryObjects.filter(cat => cat.type === 'income' || cat.type === 'both')
  , [categoryObjects]);
  
  const expenseCategories = useMemo(() => 
    categoryObjects.filter(cat => cat.type === 'expense' || cat.type === 'both')
  , [categoryObjects]);
  
  const handleDateRangeChange = (field: 'from' | 'to', value?: Date) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleCategoryChange = (category: string) => {
    if (!category) return;
    
    setLocalFilters(prev => {
      // If category is already selected, do nothing
      if (prev.categories.includes(category)) {
        return prev;
      }
      
      // Add the new category
      return {
        ...prev,
        categories: [...prev.categories, category]
      };
    });
  };
  
  const handleCategoryRemove = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }));
  };

  const handleTypeToggle = (type: string) => {
    setLocalFilters(prev => {
      const updatedTypes = prev.types.includes(type)
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type];
      
      return {
        ...prev,
        types: updatedTypes
      };
    });
  };

  const handleAmountRangeChange = (values: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      amountRange: {
        min: values[0],
        max: values[1]
      }
    }));
  };

  const resetDateRange = () => setLocalFilters(prev => ({ ...prev, dateRange: { from: undefined, to: undefined } }));
  const resetCategories = () => setLocalFilters(prev => ({ ...prev, categories: [] }));
  const resetTypes = () => setLocalFilters(prev => ({ ...prev, types: [] }));
  const resetAmountRange = () => setLocalFilters(prev => ({ ...prev, amountRange: { min: 0, max: maxAmount } }));

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleResetAllFilters = () => {
    const resetFilters: FilterOptions = {
      dateRange: { from: undefined, to: undefined },
      categories: [],
      amountRange: { min: 0, max: maxAmount },
      types: []
    };
    setLocalFilters(resetFilters);
  };

  return (
    <div className="space-y-6 p-4 max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between sticky top-0 bg-background py-2 z-10 border-b -mx-4 px-4">
        <h3 className="text-lg font-medium">{t('filter_transactions')}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-6 pb-16">
        {/* Date Range */}
        <div className="space-y-2">
          <SectionLabel label={t('date_range')} onClear={resetDateRange} />
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateRange.from ? (
                      format(localFilters.dateRange.from, "PPP")
                    ) : (
                      <span>{t('start_date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange.from}
                    onSelect={(date) => handleDateRangeChange('from', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !localFilters.dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {localFilters.dateRange.to ? (
                      format(localFilters.dateRange.to, "PPP")
                    ) : (
                      <span>{t('end_date')}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={localFilters.dateRange.to}
                    onSelect={(date) => handleDateRangeChange('to', date)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <SectionLabel label={t('categories')} onClear={resetCategories} />
          
          {/* Income Categories Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">{t('income_categories')}</Label>
            <Select
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('select_income_category')} />
              </SelectTrigger>
              <SelectContent>
                {incomeCategories.length > 0 ? (
                  incomeCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {t(category.name)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">{t('no_income_categories')}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Expense Categories Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">{t('expense_categories')}</Label>
            <Select
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t('select_expense_category')} />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.length > 0 ? (
                  expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {t(category.name)}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled value="none">{t('no_expense_categories')}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Selected Categories */}
          {localFilters.categories.length > 0 && (
            <div className="mt-2">
              <Label className="text-sm">{t('selected_categories')}:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {localFilters.categories.map(category => (
                  <div key={category} className="bg-secondary text-secondary-foreground rounded-md px-2 py-1 text-xs flex items-center">
                    {t(category)}
                    <Button variant="ghost" size="icon" onClick={() => handleCategoryRemove(category)} className="h-4 w-4 ml-1">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Transaction Types */}
        <div className="space-y-2">
          <SectionLabel label={t('transaction_type')} onClear={resetTypes} />
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-income"
                checked={localFilters.types.includes('income')}
                onCheckedChange={() => handleTypeToggle('income')}
              />
              <label
                htmlFor="type-income"
                className="text-sm cursor-pointer select-none"
              >
                {t('income')}
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-expense"
                checked={localFilters.types.includes('expense')}
                onCheckedChange={() => handleTypeToggle('expense')}
              />
              <label
                htmlFor="type-expense"
                className="text-sm cursor-pointer select-none"
              >
                {t('expenses')}
              </label>
            </div>
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <SectionLabel label={t('amount_range')} onClear={resetAmountRange} />
          <div className="flex items-center space-x-2">
            <Input 
              type="number" 
              value={localFilters.amountRange.min} 
              onChange={e => {
                const newMin = parseInt(e.target.value, 10);
                if (!isNaN(newMin)) {
                  handleAmountRangeChange([newMin, localFilters.amountRange.max]);
                }
              }} 
              className="w-1/2"
              placeholder={t('min_amount')}
              min="0"
            />
            <Input 
              type="number" 
              value={localFilters.amountRange.max === Infinity ? '' : localFilters.amountRange.max} 
              onChange={e => {
                const newMax = parseInt(e.target.value, 10);
                if (!isNaN(newMax)) {
                  handleAmountRangeChange([localFilters.amountRange.min, newMax]);
                } else if (e.target.value === '') { // Allow clearing max to revert to default (maxAmount)
                  handleAmountRangeChange([localFilters.amountRange.min, maxAmount]);
                }
              }} 
              className="w-1/2"
              placeholder={t('max_amount')}
              min="0"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end space-x-2 sticky bottom-0 bg-background py-3 border-t -mx-4 px-4">
        <Button variant="outline" onClick={handleResetAllFilters}>{t('reset_all_filters')}</Button>
        <Button onClick={handleApplyFilters}>{t('apply_filters')}</Button>
      </div>
    </div>
  );
}
