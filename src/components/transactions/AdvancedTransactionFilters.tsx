
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { X } from "lucide-react";
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

export function AdvancedTransactionFilters({ 
  filterOptions, 
  onFilterChange, 
  onClose,
  categories,
  maxAmount 
}: AdvancedTransactionFiltersProps) {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState<FilterOptions>(filterOptions);
  
  const handleDateRangeChange = (field: 'from' | 'to', value?: Date) => {
    setLocalFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  const handleCategoryToggle = (category: string) => {
    setLocalFilters(prev => {
      const updatedCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      
      return {
        ...prev,
        categories: updatedCategories
      };
    });
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

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      dateRange: { from: undefined, to: undefined },
      categories: [],
      amountRange: { min: 0, max: maxAmount },
      types: []
    };
    
    setLocalFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{t('filter_transactions')}</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Date Range */}
        <div className="space-y-2">
          <Label>{t('date_range')}</Label>
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
        <div className="space-y-2">
          <Label>{t('categories')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox 
                  id={`category-${category}`}
                  checked={localFilters.categories.includes(category)}
                  onCheckedChange={() => handleCategoryToggle(category)}
                />
                <label
                  htmlFor={`category-${category}`}
                  className="text-sm cursor-pointer"
                >
                  {t(category)}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction Types */}
        <div className="space-y-2">
          <Label>{t('transaction_type')}</Label>
          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="type-income"
                checked={localFilters.types.includes('income')}
                onCheckedChange={() => handleTypeToggle('income')}
              />
              <label
                htmlFor="type-income"
                className="text-sm cursor-pointer"
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
                className="text-sm cursor-pointer"
              >
                {t('expenses')}
              </label>
            </div>
          </div>
        </div>

        {/* Amount Range */}
        <div className="space-y-2">
          <Label>{t('amount_range')}</Label>
          <div className="pt-6 px-2">
            <Slider
              defaultValue={[localFilters.amountRange.min, localFilters.amountRange.max]}
              min={0}
              max={maxAmount}
              step={100}
              onValueChange={handleAmountRangeChange}
              className="mb-6"
            />
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground">EGP </span>
                <span className="font-medium">{localFilters.amountRange.min}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">EGP </span>
                <span className="font-medium">{localFilters.amountRange.max}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleResetFilters}>
          {t('reset')}
        </Button>
        <Button onClick={handleApplyFilters}>
          {t('apply_filters')}
        </Button>
      </div>
    </div>
  );
}
