
import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Users, CalendarDays, ArrowDownCircle, ArrowUpCircle, Pencil, Trash, CreditCard, Coins } from "lucide-react";
import { Gam3eya } from "@/types";
import { isAfter, isBefore, parseISO, format, isToday } from "date-fns";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Gam3eyaCardProps {
  gam3eya: Gam3eya;
  onEdit: (gam3eya: Gam3eya) => void;
  onDelete: (gam3eya: Gam3eya) => void;
  onMakePayment: (gam3eya: Gam3eya) => void;
  onReceivePayout: (gam3eya: Gam3eya) => void;
}

export function Gam3eyaCard({ 
  gam3eya, 
  onEdit, 
  onDelete,
  onMakePayment,
  onReceivePayout
}: Gam3eyaCardProps) {
  const { t } = useLanguage();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const today = new Date();
  const nextPaymentDate = parseISO(gam3eya.nextPaymentDate);
  const isPaymentDue = isToday(nextPaymentDate) || isBefore(nextPaymentDate, today);
  
  // Check if it's my turn to receive money
  const isMyTurnToReceive = gam3eya.myTurn === gam3eya.currentCycle && !gam3eya.receivedPayout;
  
  // Check if payment for current cycle is needed
  const isPaidCurrentCycle = gam3eya.paidCycles?.includes(gam3eya.currentCycle) || false;
  const showPayButton = isPaymentDue && !isPaidCurrentCycle;

  return (
    <>
      <Card className="overflow-hidden h-full">
        <div className="h-2 bg-masareef-primary" />
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>{gam3eya.name}</span>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              {gam3eya.members}
            </div>
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 mr-1" />
            {format(parseISO(gam3eya.startDate), 'MMM dd, yyyy')} - {format(parseISO(gam3eya.endDate), 'MMM dd, yyyy')}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t('total_amount')}</p>
              <p className="text-xl font-bold">
                {formatCurrency(gam3eya.totalAmount)}
              </p>
            </div>
            <div className="flex justify-between items-center text-sm">
              <div>
                <p className="text-muted-foreground">{t('monthly_contribution')}</p>
                <p className="font-medium">{formatCurrency(gam3eya.contributionAmount)}</p>
              </div>
              <div className="text-right">
                <p className="text-muted-foreground">{t('current_cycle')}</p>
                <p className="font-medium">{gam3eya.currentCycle} / {gam3eya.totalCycles}</p>
              </div>
            </div>
            
            {gam3eya.myTurn && (
              <div className="text-sm">
                <p className="text-muted-foreground">{t('my_turn')}</p>
                <p className="font-medium">{t('cycle')} {gam3eya.myTurn}</p>
              </div>
            )}
            
            <div className="pt-2">
              {gam3eya.currentCycle > gam3eya.totalCycles / 2 ? (
                <div className="flex items-center text-green-600">
                  <ArrowDownCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">{t('halfway_complete')}</span>
                </div>
              ) : (
                <div className="flex items-center text-orange-600">
                  <ArrowUpCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">
                    {t('next_payment')}: {format(nextPaymentDate, 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {showPayButton && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onMakePayment(gam3eya)}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  {t('pay')}
                </Button>
              )}
              
              {isMyTurnToReceive && (
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => onReceivePayout(gam3eya)}
                >
                  <Coins className="h-4 w-4 mr-1" />
                  {t('receive')}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit(gam3eya)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete_gam3eya')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('delete_gam3eya_confirmation', { name: gam3eya.name })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700"
              onClick={() => onDelete(gam3eya)}
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
