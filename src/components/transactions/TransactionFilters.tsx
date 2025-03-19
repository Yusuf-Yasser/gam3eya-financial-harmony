
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  AdvancedTransactionFilters, 
  FilterOptions 
} from "./AdvancedTransactionFilters";
import { useIsMobile } from "@/hooks/use-mobile";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterOptions: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
  maxAmount: number;
  hasActiveFilters: boolean;
}

export function TransactionFilters({ 
  searchTerm, 
  onSearchChange, 
  filterOptions,
  onFilterChange,
  categories,
  maxAmount,
  hasActiveFilters
}: TransactionFiltersProps) {
  const { t, language } = useLanguage();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-2">
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
      
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="sm:flex hidden items-center gap-1"
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
  );
}
