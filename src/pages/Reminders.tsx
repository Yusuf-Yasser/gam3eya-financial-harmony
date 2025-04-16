import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BellRing, Calendar as CalendarIcon, Plus, Trash2, Check, X, AlertCircle, Bell, CalendarClock, Loader2 } from "lucide-react";
import { format, isAfter, isBefore, addDays, addWeeks, addMonths, addYears, isToday, isSameDay, parseISO } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import { Reminder, ScheduledPayment, Category, Transaction } from "@/types";
import { remindersApi, scheduledPaymentsApi, categoriesApi, walletsApi, transactionsApi } from "@/services/api";

const reminderFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  date: z.date(),
  notes: z.string().optional(),
});

const scheduledPaymentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  amount: z.coerce.number().min(1, { message: "Amount must be greater than 0" }),
  date: z.date(),
  walletId: z.string().min(1, { message: "Wallet is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
});

const Reminders = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reminders");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const processingPaymentIdsRef = useRef(new Set<string>());
  const queryClient = useQueryClient();
  
  const {
    data: reminders = [],
    isLoading: isLoadingReminders,
    isError: isRemindersError
  } = useQuery({
    queryKey: ["reminders"],
    queryFn: remindersApi.getAll
  });
  
  const {
    data: scheduledPayments = [],
    isLoading: isLoadingPayments,
    isError: isPaymentsError
  } = useQuery({
    queryKey: ["scheduledPayments"],
    queryFn: scheduledPaymentsApi.getAll
  });
  
  const {
    data: categories = [],
    isLoading: isLoadingCategories
  } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAll
  });
  
  const {
    data: wallets = [],
    isLoading: isLoadingWallets
  } = useQuery({
    queryKey: ["wallets"],
    queryFn: walletsApi.getAll
  });
  
  const paymentForm = useForm<z.infer<typeof scheduledPaymentFormSchema>>({
    resolver: zodResolver(scheduledPaymentFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date(),
      walletId: "",
      categoryId: "",
      recurring: "none",
    },
  });
  
  const reminderForm = useForm<z.infer<typeof reminderFormSchema>>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      notes: "",
    },
  });
  
  const createReminderMutation = useMutation({
    mutationFn: remindersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Reminder created",
        description: "Your reminder has been created successfully.",
      });
      setReminderDialogOpen(false);
      reminderForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create reminder. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const createPaymentMutation = useMutation({
    mutationFn: scheduledPaymentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledPayments"] });
      toast({
        title: "Payment scheduled",
        description: "Your payment has been scheduled successfully.",
      });
      setDialogOpen(false);
      paymentForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to schedule payment. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const toggleReminderMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => 
      remindersApi.toggleComplete(id, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Reminder updated",
        description: "The reminder status has been updated.",
      });
    },
  });
  
  const togglePaymentMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => 
      scheduledPaymentsApi.toggleComplete(id, completed),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['scheduledPayments'], (oldData: ScheduledPayment[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(payment => 
          payment.id === variables.id ? { ...payment, completed: variables.completed } : payment
        );
      });
      toast({
        title: "Payment updated",
        description: "The payment status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    }
  });
  
  const deleteReminderMutation = useMutation({
    mutationFn: remindersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reminders"] });
      toast({
        title: "Reminder deleted",
        description: "The reminder has been deleted.",
      });
    },
  });
  
  const deletePaymentMutation = useMutation({
    mutationFn: scheduledPaymentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scheduledPayments"] });
      toast({
        title: "Scheduled payment deleted",
        description: "The scheduled payment has been deleted.",
      });
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  const updatePaymentMutation = useMutation({
    mutationFn: scheduledPaymentsApi.update,
    onSuccess: (updatedPayment) => {
      queryClient.setQueryData(['scheduledPayments'], (oldData: ScheduledPayment[] | undefined) => {
        if (!oldData) return [];
        return oldData.map(payment => 
          payment.id === updatedPayment.id ? updatedPayment : payment
        );
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update scheduled payment.",
        variant: "destructive",
      });
    }
  });
  
  const toggleReminderComplete = (id: string, currentStatus: boolean) => {
    toggleReminderMutation.mutate({ id, completed: !currentStatus });
  };
  
  const togglePaymentComplete = (id: string, currentStatus: boolean) => {
    togglePaymentMutation.mutate({ id, completed: !currentStatus });
  };
  
  const deleteReminder = (id: string) => {
    deleteReminderMutation.mutate(id);
  };
  
  const deletePayment = (id: string) => {
    deletePaymentMutation.mutate(id);
  };
  
  const onSubmitReminder = (data: z.infer<typeof reminderFormSchema>) => {
    const newReminder: Omit<Reminder, 'id'> = {
      title: data.title,
      date: data.date.toISOString(),
      notes: data.notes,
      completed: false,
    };
    
    createReminderMutation.mutate(newReminder);
  };
  
  const onSubmitPayment = (data: z.infer<typeof scheduledPaymentFormSchema>) => {
    const newPayment: Omit<ScheduledPayment, 'id'> = {
      title: data.title,
      amount: data.amount,
      date: data.date.toISOString(),
      walletId: data.walletId,
      categoryId: data.categoryId,
      recurring: data.recurring,
      completed: false,
    };
    
    createPaymentMutation.mutate(newPayment);
  };
  
  useEffect(() => {
    if (scheduledPayments.length === 0 || isLoadingPayments) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    scheduledPayments.forEach(payment => {
      if (payment.completed || processingPaymentIdsRef.current.has(payment.id)) return;
      
      if (payment.recurring !== 'none' && payment.lastProcessed) {
        const lastProcessedDate = parseISO(payment.lastProcessed);
        if (isToday(lastProcessedDate)) return;
      }

      const paymentDate = new Date(payment.date);
      paymentDate.setHours(0, 0, 0, 0);

      if (isBefore(paymentDate, today) || isSameDay(paymentDate, today)) {
        const newTransaction: Omit<Transaction, 'id'> = {
          date: new Date().toISOString(),
          amount: payment.amount,
          description: `Auto-payment: ${payment.title}`,
          type: 'expense',
          categoryId: payment.categoryId,
          category: payment.categoryId,
          walletId: payment.walletId,
        };

        processingPaymentIdsRef.current.add(payment.id);

        createTransactionMutation.mutate(newTransaction, {
          onSuccess: (createdTransaction) => {
            let nextPaymentDate: Date | null = null;
            const currentDate = new Date(payment.date);
            
            if (payment.recurring === 'daily') {
              nextPaymentDate = addDays(currentDate, 1);
            } else if (payment.recurring === 'weekly') {
              nextPaymentDate = addWeeks(currentDate, 1);
            } else if (payment.recurring === 'monthly') {
              nextPaymentDate = addMonths(currentDate, 1);
            } else if (payment.recurring === 'yearly') {
              nextPaymentDate = addYears(currentDate, 1);
            }

            if (nextPaymentDate && payment.recurring !== 'none') {
              const updatedPayment: ScheduledPayment = {
                ...payment,
                date: nextPaymentDate.toISOString(),
                lastProcessed: new Date().toISOString(),
                completed: false,
              };
              
              updatePaymentMutation.mutate(updatedPayment, {
                onSuccess: () => {
                  toast({
                    title: "Recurring payment processed",
                    description: `Payment for ${payment.title} has been processed and scheduled for the next cycle.`,
                  });
                },
                onError: () => {
                  toast({
                    title: "Processing Error",
                    description: `Failed to update recurring payment ${payment.title} after processing.`,
                    variant: "destructive",
                  });
                }
              });
            } else {
              queryClient.setQueryData(['scheduledPayments'], (oldData: ScheduledPayment[] | undefined) => {
                if (!oldData) return [];
                return oldData.map(p => 
                  p.id === payment.id ? { ...p, completed: true } : p
                );
              });
              
              togglePaymentMutation.mutate({ id: payment.id, completed: true }, {
                onSuccess: () => {
                  toast({
                    title: "Payment processed automatically",
                    description: `Payment for ${payment.title} has been processed.`,
                  });
                },
                onError: () => {
                  toast({
                    title: "Processing Error",
                    description: `Failed to mark payment ${payment.title} as complete after processing.`,
                    variant: "destructive",
                  });
                }
              });
            }
          },
          onError: (error) => {
            toast({
              title: "Transaction Error",
              description: `Failed to create transaction for payment ${payment.title}. Error: ${error.message}`,
              variant: "destructive",
            });
          },
          onSettled: () => {
            processingPaymentIdsRef.current.delete(payment.id);
          }
        });
      }
    });
  }, [scheduledPayments, isLoadingPayments, queryClient, createTransactionMutation, updatePaymentMutation, togglePaymentMutation, toast]);
  
  const formatDateFromString = (dateString: string) => {
    return new Date(dateString);
  };
  
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  const getWalletName = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    return wallet ? wallet.name : 'Unknown';
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">{t('reminders_and_payments')}</h1>
      
      <Tabs defaultValue="reminders" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reminders">
            <Bell className="mr-2 h-4 w-4" />
            {t('reminders')}
          </TabsTrigger>
          <TabsTrigger value="scheduled_payments">
            <CalendarClock className="mr-2 h-4 w-4" />
            {t('scheduled_payments')}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="reminders" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('my_reminders')}</h2>
            <Dialog open={reminderDialogOpen} onOpenChange={setReminderDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> {t('add_reminder')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('create_new_reminder')}</DialogTitle>
                  <DialogDescription>
                    {t('add_details_for_your_reminder')}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...reminderForm}>
                  <form onSubmit={reminderForm.handleSubmit(onSubmitReminder)} className="space-y-4">
                    <FormField
                      control={reminderForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('title')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('enter_title')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={reminderForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('date')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{t('pick_a_date')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={reminderForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('notes')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('optional_notes')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={createReminderMutation.isPending}
                      >
                        {createReminderMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('creating')}
                          </>
                        ) : (
                          t('create_reminder')
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoadingReminders ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isRemindersError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="text-lg font-medium">{t('error_loading_reminders')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('try_refreshing_the_page')}
                </p>
              </CardContent>
            </Card>
          ) : reminders.length > 0 ? (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <Card key={reminder.id} className={cn(
                  "border-l-4",
                  reminder.completed ? "border-l-gray-400 opacity-60" : "border-l-amber-500"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className={cn(reminder.completed && "line-through")}>
                          {reminder.title}
                        </CardTitle>
                        <CardDescription>
                          <CalendarIcon className="inline-block mr-1 h-3 w-3" />
                          {format(formatDateFromString(reminder.date), "PPP")}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleReminderComplete(reminder.id, reminder.completed)}
                          disabled={toggleReminderMutation.isPending}
                          title={reminder.completed ? t('mark_incomplete') : t('mark_complete')}
                        >
                          {reminder.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReminder(reminder.id)}
                          disabled={deleteReminderMutation.isPending}
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {reminder.notes && (
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{reminder.notes}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <BellRing className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('no_reminders')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('no_reminders_description')}
                </p>
                <Button onClick={() => setReminderDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> {t('add_reminder')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="scheduled_payments" className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('my_scheduled_payments')}</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> {t('schedule_payment')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('schedule_a_payment')}</DialogTitle>
                  <DialogDescription>
                    {t('add_details_for_your_scheduled_payment')}
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)} className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('title')}</FormLabel>
                          <FormControl>
                            <Input placeholder={t('enter_title')} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('amount')}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="0.00" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.valueAsNumber)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>{t('date')}</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>{t('pick_a_date')}</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="walletId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('wallet')}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('select_wallet')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {wallets.map((wallet) => (
                                <SelectItem key={wallet.id} value={wallet.id}>
                                  {wallet.name} ({formatCurrency(wallet.balance)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="recurring"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('recurring')}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('select_recurrence')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">{t('one_time')}</SelectItem>
                              <SelectItem value="daily">{t('daily')}</SelectItem>
                              <SelectItem value="weekly">{t('weekly')}</SelectItem>
                              <SelectItem value="monthly">{t('monthly')}</SelectItem>
                              <SelectItem value="yearly">{t('yearly')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('category')}</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('select_category')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit"
                        disabled={createPaymentMutation.isPending}
                      >
                        {createPaymentMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('scheduling')}
                          </>
                        ) : (
                          t('schedule_payment')
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {isLoadingPayments ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : isPaymentsError ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-10 w-10 text-destructive mb-4" />
                <h3 className="text-lg font-medium">{t('error_loading_payments')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('try_refreshing_the_page')}
                </p>
              </CardContent>
            </Card>
          ) : scheduledPayments.length > 0 ? (
            <div className="space-y-4">
              {scheduledPayments.map((payment) => (
                <Card key={payment.id} className={cn(
                  "border-l-4",
                  payment.completed ? "border-l-gray-400 opacity-60" : "border-l-blue-500"
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className={cn(payment.completed && "line-through")}>
                          {payment.title}
                        </CardTitle>
                        <CardDescription>
                          <CalendarIcon className="inline-block mr-1 h-3 w-3" />
                          {format(formatDateFromString(payment.date), "PPP")}
                          {payment.recurring !== 'none' && (
                            <span className="ml-2 px-1.5 py-0.5 bg-muted rounded-sm text-xs">
                              {t(payment.recurring)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePaymentComplete(payment.id, payment.completed)}
                          disabled={togglePaymentMutation.isPending}
                          title={payment.completed ? t('mark_incomplete') : t('mark_complete')}
                        >
                          {payment.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePayment(payment.id)}
                          disabled={deletePaymentMutation.isPending}
                          title={t('delete')}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">
                        {t('amount')}: {formatCurrency(payment.amount)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t('category')}: {getCategoryName(payment.categoryId)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('wallet')}: {getWalletName(payment.walletId)}
                    </div>
                    {payment.lastProcessed && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {t('last_processed')}: {format(new Date(payment.lastProcessed), "PPP")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">{t('no_scheduled_payments')}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t('no_scheduled_payments_description')}
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> {t('schedule_payment')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reminders;
