
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { getCurrentMonth } from "@/lib/utils";

interface MonthNavigationProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

export function MonthNavigation({ currentDate, onDateChange }: MonthNavigationProps) {
  const { t } = useLanguage();
  const [calendarOpen, setCalendarOpen] = useState(false);
  
  const handlePreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onDateChange(newDate);
  };
  
  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onDateChange(newDate);
  };
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (date) {
      // Set day to 1 to focus on the month
      const newDate = new Date(date.getFullYear(), date.getMonth(), 1);
      onDateChange(newDate);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={handlePreviousMonth}
        aria-label={t('previous_month')}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="min-w-32 justify-start text-left font-normal"
          >
            <span>{format(currentDate, "MMMM yyyy")}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={currentDate}
            onSelect={handleCalendarSelect}
            initialFocus
            // Only show months view
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={2030}
            defaultMonth={currentDate}
          />
        </PopoverContent>
      </Popover>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleNextMonth}
        // Disable next month button if we're in current month
        disabled={
          currentDate.getMonth() === new Date().getMonth() && 
          currentDate.getFullYear() === new Date().getFullYear()
        }
        aria-label={t('next_month')}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
