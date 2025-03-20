
import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  className?: string;
  isExpense?: boolean;
}

export function StatCard({ title, value, icon, trend, className, isExpense }: StatCardProps) {
  const getTrendColor = (trend: number, isExpense?: boolean) => {
    // For expenses, red means increase (bad) and green means decrease (good)
    if (isExpense) {
      return trend > 0 ? "text-red-500" : "text-green-500";
    }
    // For income and other stats, green means increase (good) and red means decrease (bad)
    return trend > 0 ? "text-green-500" : "text-red-500";
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend !== undefined && (
              <p className={cn(
                "text-xs font-medium",
                getTrendColor(trend, isExpense)
              )}>
                {trend > 0 ? "+" : ""}{trend}% from last month
              </p>
            )}
          </div>
          <div className="p-2 bg-masareef-light/50 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
