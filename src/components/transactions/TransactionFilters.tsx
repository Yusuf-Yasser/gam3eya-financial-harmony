import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X, ArrowUpDown } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AdvancedTransactionFilters, 
  FilterOptions 
} from "./AdvancedTransactionFilters";
import { useIsMobile } from "@/hooks/use-mobile";
import { SortConfig, SortDirection, SortKey } from "@/pages/Transactions";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  maxAmount: number;
  hasActiveFilters: boolean;
  sortConfig: SortConfig;
  onSortChange: (key: SortKey, direction?: SortDirection) => void;
}

const sortableKeys: { value: SortKey; labelKey: string }[] = [
  { value: "date", labelKey: "date" },
  { value: "description", labelKey: "description" },
  { value: "categoryName", labelKey: "category" },
  { value: "amount", labelKey: "amount" },
  { value: "type", labelKey: "type" },
];

export function TransactionFilters({ 
  searchTerm, 
  onSearchChange, 
  filterOptions,
  onFilterChange,
  categories,
  maxAmount,
  hasActiveFilters,
  sortConfig,
  onSortChange
}: TransactionFiltersProps) {
  const { t, language } = useLanguage();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSortKeyChange = (value: string) => {
    onSortChange(value as SortKey);
  };

  const handleSortDirectionChange = (value: string) => {
    onSortChange(sortConfig.key, value as SortDirection);
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute ${language === 'ar' ? 'right-2' : 'left-2'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
          <Input
            placeholder={t('search_transactions')}
            className={`${language === 'ar' ? 'pr-8' : 'pl-8'}`}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <SheetTrigger asChild>
            <Button 
              variant={hasActiveFilters ? "default" : "outline"} 
              className="sm:w-auto w-full relative"
            >
              <Filter className={`${language === 'ar' ? 'ml-2' : 'mr-2'} h-4 w-4`} /> 
              {t('filter')}
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 bg-primary-foreground text-primary rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  •
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side={language === 'ar' ? 'right' : 'left'} className="overflow-y-auto">
            <AdvancedTransactionFilters 
              filterOptions={filterOptions}
              onFilterChange={onFilterChange}
              onClose={() => setIsFiltersOpen(false)}
              categories={categories}
              maxAmount={maxAmount}
            />
          </SheetContent>
        </Sheet>
        
        {hasActiveFilters && !isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="items-center gap-1"
            onClick={() => {
              onFilterChange({
                dateRange: { from: undefined, to: undefined },
                categories: [],
                amountRange: { min: 0, max: maxAmount },
                types: []
              });
            }}
          >
            <X className={`${language === 'ar' ? 'ml-1' : 'mr-1'} h-4 w-4`} />
            {t('clear_filters')}
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t('sort_by')}:</span>
          <Select value={sortConfig.key} onValueChange={handleSortKeyChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder={t('select_sort_key')} />
            </SelectTrigger>
            <SelectContent>
              {sortableKeys.map(key => (
                <SelectItem key={key.value} value={key.value}>
                  {t(key.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">{t('order')}:</span>
          <Select value={sortConfig.direction} onValueChange={handleSortDirectionChange}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder={t('select_sort_direction')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">{t('ascending')}</SelectItem>
              <SelectItem value="desc">{t('descending')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
         {hasActiveFilters && isMobile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full items-center gap-1 mt-2 sm:mt-0"
            onClick={() => {
              onFilterChange({
                dateRange: { from: undefined, to: undefined },
                categories: [],
                amountRange: { min: 0, max: maxAmount },
                types: []
              });
            }}
          >
            <X className={`${language === 'ar' ? 'ml-1' : 'mr-1'} h-4 w-4`} />
            {t('clear_filters')}
          </Button>
        )}
      </div>
    </div>
  );
}
