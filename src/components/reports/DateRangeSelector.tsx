
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  ChevronRight,
  CalendarRange
} from "lucide-react";
import { format } from "date-fns";

interface DateRangeSelectorProps {
  viewType: "monthly" | "yearly";
  setViewType: (type: "monthly" | "yearly") => void;
  currentDate: Date;
  onPrevious: () => void;
  onNext: () => void;
}

export function DateRangeSelector({ 
  viewType, 
  setViewType, 
  currentDate, 
  onPrevious, 
  onNext 
}: DateRangeSelectorProps) {
  const { t } = useLanguage();
  
  const displayText = viewType === "monthly" 
    ? format(currentDate, "MMMM yyyy")
    : format(currentDate, "yyyy");

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
      <Tabs value={viewType} onValueChange={(v) => setViewType(v as "monthly" | "yearly")}>
        <TabsList>
          <TabsTrigger value="monthly">{t('monthly')}</TabsTrigger>
          <TabsTrigger value="yearly">{t('yearly')}</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPrevious}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex items-center gap-2 px-2 min-w-[140px] justify-center">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{displayText}</span>
        </div>
        
        <Button variant="outline" size="icon" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
