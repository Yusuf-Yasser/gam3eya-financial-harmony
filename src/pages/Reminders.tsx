
import { useState } from "react";
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
import { BellRing, Calendar as CalendarIcon, Plus, Trash2, Check, X, AlertCircle, Bell, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { wallets } from "@/data/dummyData";

// Define reminder and scheduled payment types
interface Reminder {
  id: string;
  title: string;
  date: Date;
  completed: boolean;
  notes?: string;
}

interface ScheduledPayment {
  id: string;
  title: string;
  amount: number;
  date: Date;
  walletId: string;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: string;
  completed: boolean;
}

// Form validation schema for reminders
const reminderFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  date: z.date(),
  notes: z.string().optional(),
});

// Form validation schema for scheduled payments
const scheduledPaymentFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  amount: z.coerce.number().min(1, { message: "Amount must be greater than 0" }),
  date: z.date(),
  walletId: z.string().min(1, { message: "Wallet is required" }),
  recurring: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']),
  category: z.string().min(1, { message: "Category is required" }),
});

// List of categories (simplified for this example)
const categories = [
  'food', 'transport', 'housing', 'utilities', 'healthcare', 
  'personal', 'entertainment', 'education', 'debt', 'other'
];

const Reminders = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("reminders");
  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Pay rent', date: new Date(2025, 2, 30), completed: false },
    { id: '2', title: 'Review subscriptions', date: new Date(2025, 2, 25), completed: false },
  ]);
  const [scheduledPayments, setScheduledPayments] = useState<ScheduledPayment[]>([
    { 
      id: '1', 
      title: 'Netflix Subscription', 
      amount: 200, 
      date: new Date(2025, 2, 20), 
      walletId: 'w2', 
      recurring: 'monthly', 
      category: 'entertainment',
      completed: false
    },
    { 
      id: '2', 
      title: 'Gym Membership', 
      amount: 500, 
      date: new Date(2025, 2, 22), 
      walletId: 'w1', 
      recurring: 'monthly', 
      category: 'personal',
      completed: false
    },
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  
  // Form for scheduled payments
  const paymentForm = useForm<z.infer<typeof scheduledPaymentFormSchema>>({
    resolver: zodResolver(scheduledPaymentFormSchema),
    defaultValues: {
      title: "",
      amount: 0,
      date: new Date(),
      walletId: "",
      recurring: "none",
      category: "",
    },
  });
  
  // Form for reminders
  const reminderForm = useForm<z.infer<typeof reminderFormSchema>>({
    resolver: zodResolver(reminderFormSchema),
    defaultValues: {
      title: "",
      date: new Date(),
      notes: "",
    },
  });
  
  // Handle marking a reminder as complete
  const toggleReminderComplete = (id: string) => {
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
    
    toast({
      title: "Reminder updated",
      description: "The reminder status has been updated.",
    });
  };
  
  // Handle marking a scheduled payment as complete
  const togglePaymentComplete = (id: string) => {
    setScheduledPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === id ? { ...payment, completed: !payment.completed } : payment
      )
    );
    
    toast({
      title: "Payment updated",
      description: "The payment status has been updated.",
    });
  };
  
  // Handle deleting a reminder
  const deleteReminder = (id: string) => {
    setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
    
    toast({
      title: "Reminder deleted",
      description: "The reminder has been deleted.",
    });
  };
  
  // Handle deleting a scheduled payment
  const deletePayment = (id: string) => {
    setScheduledPayments(prevPayments => prevPayments.filter(payment => payment.id !== id));
    
    toast({
      title: "Scheduled payment deleted",
      description: "The scheduled payment has been deleted.",
    });
  };
  
  // Handle adding a new scheduled payment
  const onSubmitPayment = (data: z.infer<typeof scheduledPaymentFormSchema>) => {
    const newPayment: ScheduledPayment = {
      id: Date.now().toString(),
      title: data.title,
      amount: data.amount,
      date: data.date,
      walletId: data.walletId,
      recurring: data.recurring,
      category: data.category,
      completed: false,
    };
    
    setScheduledPayments(prev => [...prev, newPayment]);
    setDialogOpen(false);
    paymentForm.reset();
    
    toast({
      title: "Payment scheduled",
      description: "Your payment has been scheduled successfully.",
    });
  };
  
  // Handle adding a new reminder
  const onSubmitReminder = (data: z.infer<typeof reminderFormSchema>) => {
    const newReminder: Reminder = {
      id: Date.now().toString(),
      title: data.title,
      date: data.date,
      notes: data.notes,
      completed: false,
    };
    
    setReminders(prev => [...prev, newReminder]);
    setReminderDialogOpen(false);
    reminderForm.reset();
    
    toast({
      title: "Reminder created",
      description: "Your reminder has been created successfully.",
    });
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
                      <Button type="submit">{t('create_reminder')}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {reminders.length > 0 ? (
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
                          {format(reminder.date, "PPP")}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleReminderComplete(reminder.id)}
                          title={reminder.completed ? t('mark_incomplete') : t('mark_complete')}
                        >
                          {reminder.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReminder(reminder.id)}
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
                      name="category"
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
                                <SelectItem key={category} value={category}>
                                  {t(category)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit">{t('schedule_payment')}</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {scheduledPayments.length > 0 ? (
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
                          {format(payment.date, "PPP")}
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
                          onClick={() => togglePaymentComplete(payment.id)}
                          title={payment.completed ? t('mark_incomplete') : t('mark_complete')}
                        >
                          {payment.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deletePayment(payment.id)}
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
                        {t('category')}: {t(payment.category)}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {t('wallet')}: {wallets.find(w => w.id === payment.walletId)?.name}
                    </div>
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
