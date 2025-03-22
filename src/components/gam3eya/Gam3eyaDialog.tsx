import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMonths, format, parseISO } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Gam3eya } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Gam3eyaDialogProps {
  gam3eya?: Gam3eya;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Gam3eyaFormValues) => void;
}

export type Gam3eyaFormValues = {
  name: string;
  totalAmount: number;
  contributionAmount: number;
  members: number;
  startDate: string;
  endDate: string;
  currentCycle: number;
  totalCycles: number;
  isAdmin: boolean;
  nextPaymentDate: string;
  myTurn: number;
};

export function Gam3eyaDialog({ gam3eya, open, onOpenChange, onSave }: Gam3eyaDialogProps) {
  const { t } = useLanguage();
  const [calculatedEndDate, setCalculatedEndDate] = useState<string>('');
  const [calculatedContribution, setCalculatedContribution] = useState<number>(0);

  const formSchema = z.object({
    name: z.string().min(1, { message: t('name_required') }),
    totalAmount: z.number().positive({ message: t('amount_must_be_positive') }),
    members: z.number().int().positive({ message: t('members_must_be_positive') }),
    contributionAmount: z.number().positive({ message: t('contribution_must_be_positive') }),
    startDate: z.string().min(1, { message: t('start_date_required') }),
    endDate: z.string().min(1, { message: t('end_date_required') }),
    currentCycle: z.number().int().positive().default(1),
    totalCycles: z.number().int().positive(),
    isAdmin: z.boolean().default(true),
    nextPaymentDate: z.string(),
    myTurn: z.number().int().positive()
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: gam3eya?.name || '',
      totalAmount: gam3eya?.totalAmount || 0,
      members: gam3eya?.members || 0,
      contributionAmount: gam3eya?.contributionAmount || 0,
      startDate: gam3eya?.startDate || format(new Date(), 'yyyy-MM-dd'),
      endDate: gam3eya?.endDate || '',
      currentCycle: gam3eya?.currentCycle || 1,
      totalCycles: gam3eya?.totalCycles || 0,
      isAdmin: gam3eya?.isAdmin ?? true,
      nextPaymentDate: gam3eya?.nextPaymentDate || '',
      myTurn: gam3eya?.myTurn || 1
    }
  });

  const watchTotalAmount = form.watch('totalAmount');
  const watchMembers = form.watch('members');
  const watchStartDate = form.watch('startDate');
  const watchMyTurn = form.watch('myTurn');

  // Calculate contribution amount when total amount or members change
  useEffect(() => {
    if (watchTotalAmount && watchMembers && watchMembers > 0) {
      const contribution = watchTotalAmount / watchMembers;
      setCalculatedContribution(contribution);
      form.setValue('contributionAmount', contribution);
    } else {
      setCalculatedContribution(0);
    }
  }, [watchTotalAmount, watchMembers, form]);

  // Calculate end date when members or start date change
  useEffect(() => {
    if (watchStartDate && watchMembers && watchMembers > 0) {
      try {
        const startDate = parseISO(watchStartDate);
        // End date is start date + (members - 1) months
        const endDate = addMonths(startDate, watchMembers - 1);
        const formattedEndDate = format(endDate, 'yyyy-MM-dd');
        setCalculatedEndDate(formattedEndDate);
        form.setValue('endDate', formattedEndDate);
        
        // Set total cycles equal to members
        form.setValue('totalCycles', watchMembers);
        
        // Calculate next payment date based on start date
        const nextPaymentDate = format(startDate, 'yyyy-MM-dd');
        form.setValue('nextPaymentDate', nextPaymentDate);
      } catch (error) {
        console.error("Date calculation error:", error);
      }
    }
  }, [watchStartDate, watchMembers, form]);

  // Validate that myTurn doesn't exceed members
  useEffect(() => {
    if (watchMyTurn > watchMembers) {
      form.setValue('myTurn', watchMembers);
    }
  }, [watchMyTurn, watchMembers, form]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    // Calculate my turn date
    if (data.startDate && data.myTurn) {
      const startDate = parseISO(data.startDate);
      const myTurnDate = addMonths(startDate, data.myTurn - 1);
      const formattedMyTurnDate = format(myTurnDate, 'yyyy-MM-dd');
      
      // If current cycle is before my turn, set next payment date to the start date
      // Otherwise, we've already passed my turn
      const nextPaymentDate = data.currentCycle < data.myTurn 
        ? data.startDate
        : formattedMyTurnDate;
      
      const formValues: Gam3eyaFormValues = {
        name: data.name,
        totalAmount: data.totalAmount,
        contributionAmount: data.contributionAmount,
        members: data.members,
        startDate: data.startDate,
        endDate: data.endDate,
        currentCycle: data.currentCycle,
        totalCycles: data.totalCycles,
        isAdmin: data.isAdmin,
        nextPaymentDate: nextPaymentDate,
        myTurn: data.myTurn
      };
      
      onSave(formValues);
    } else {
      const formValues: Gam3eyaFormValues = {
        name: data.name,
        totalAmount: data.totalAmount,
        contributionAmount: data.contributionAmount,
        members: data.members,
        startDate: data.startDate,
        endDate: data.endDate,
        currentCycle: data.currentCycle,
        totalCycles: data.totalCycles,
        isAdmin: data.isAdmin,
        nextPaymentDate: data.nextPaymentDate,
        myTurn: data.myTurn
      };
      
      onSave(formValues);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{gam3eya ? t('edit_gam3eya') : t('create_new_gam3eya')}</DialogTitle>
          <DialogDescription>
            {t('fill_details_to_create_gam3eya')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('gam3eya_name')}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('total_amount')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        step="0.01"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('members_count')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1" 
                        step="1"
                        {...field} 
                        onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contributionAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('monthly_contribution')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01"
                      {...field} 
                      value={calculatedContribution.toFixed(2)}
                      disabled 
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    {t('calculated_automatically')}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('start_date')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('end_date')}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={calculatedEndDate || field.value}
                        disabled 
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground">
                      {t('calculated_from_members')}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="myTurn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('my_turn')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      max={watchMembers}
                      step="1"
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <div className="text-xs text-muted-foreground">
                    {t('which_cycle_you_receive')}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">{gam3eya ? t('save_changes') : t('create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
