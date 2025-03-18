
import { useLanguage } from "@/contexts/LanguageContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";

interface TransactionFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onFilter?: () => void;
}

export function TransactionFilters({ searchTerm, onSearchChange, onFilter }: TransactionFiltersProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-2">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder={t('search_transactions')}
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" className="sm:w-auto w-full" onClick={onFilter}>
        <Filter className="mr-2 h-4 w-4" /> {t('filter')}
      </Button>
    </div>
  );
}
