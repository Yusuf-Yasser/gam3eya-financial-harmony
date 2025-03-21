
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/contexts/CategoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// List of icons to choose from
const iconList = [
  'Home', 'ShoppingCart', 'Coffee', 'Utensils', 'Car', 'Bus', 
  'Train', 'Plane', 'CreditCard', 'Wallet', 'DollarSign', 'PiggyBank', 
  'Gift', 'Heart', 'Smartphone', 'Laptop', 'Tv', 'GameController', 
  'BookOpen', 'GraduationCap', 'Briefcase', 'Building', 'ShoppingBag', 
  'Shirt', 'Package', 'Truck', 'MedicalCross', 'Pill', 'Baby', 
  'Dog', 'Cat', 'Users', 'PartyPopper', 'Ticket', 'Music', 'Film', 
  'Bike', 'Gym', 'Dumbbell', 'Trophy', 'Target', 'Calendar', 'Wrench', 
  'Scissors', 'Coins', 'Receipt', 'Activity'
];

interface CategoryDialogProps {
  type?: 'income' | 'expense';
  variant?: 'default' | 'outline' | 'link';
  className?: string;
}

export function CategoryDialog({ type, variant = 'default', className }: CategoryDialogProps) {
  const { t } = useLanguage();
  const { addCategory } = useCategories();
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: type || 'expense',
    icon: 'CreditCard', // Default icon
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      addCategory({
        name: newCategory.name.trim(),
        type: newCategory.type,
        icon: newCategory.icon,
      });
      setNewCategory({ name: '', type: type || 'expense', icon: 'CreditCard' });
      setOpen(false);
    }
  };

  const selectIcon = (iconName: string) => {
    setNewCategory({...newCategory, icon: iconName});
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Plus className="h-4 w-4 mr-1" />
          {t('add_category')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('add_new_category')}</DialogTitle>
          <DialogDescription>
            {t('create_category_description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="categoryName">{t('category_name')}</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder={t('enter_category_name')}
              />
            </div>
            
            <div className="grid gap-2">
              <Label>{t('category_type')}</Label>
              <RadioGroup
                value={newCategory.type}
                onValueChange={(value) => setNewCategory({...newCategory, type: value as 'income' | 'expense' | 'both'})}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expense" id="expense" />
                  <Label htmlFor="expense">{t('expense')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="income" id="income" />
                  <Label htmlFor="income">{t('income')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">{t('both')}</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label>{t('category_icon')}</Label>
              <div className="border rounded-md p-2">
                <Tabs defaultValue="all">
                  <TabsList className="mb-2">
                    <TabsTrigger value="all">{t('all_icons')}</TabsTrigger>
                    <TabsTrigger value="selected">{t('selected_icon')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="all">
                    <ScrollArea className="h-[200px] rounded-md">
                      <div className="grid grid-cols-6 gap-2 p-2">
                        {iconList.map((iconName) => {
                          const IconComponent = (LucideIcons as any)[iconName];
                          return (
                            <Button
                              key={iconName}
                              type="button"
                              variant={newCategory.icon === iconName ? "default" : "outline"}
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => selectIcon(iconName)}
                            >
                              <IconComponent className="h-5 w-5" />
                            </Button>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                  <TabsContent value="selected">
                    <div className="flex justify-center items-center p-4">
                      {newCategory.icon && (
                        <div className="text-center">
                          {(() => {
                            const IconComponent = (LucideIcons as any)[newCategory.icon];
                            return (
                              <div className="flex flex-col items-center gap-2">
                                <IconComponent className="h-16 w-16" />
                                <p className="text-sm text-muted-foreground">{newCategory.icon}</p>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">{t('add_category')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
