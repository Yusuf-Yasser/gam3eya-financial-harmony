
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/contexts/CategoryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

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
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategory.name.trim()) {
      addCategory({
        name: newCategory.name.trim(),
        type: newCategory.type,
      });
      setNewCategory({ name: '', type: type || 'expense' });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size="sm" className={className}>
          <Plus className="h-4 w-4 mr-1" />
          {t('add_category')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('add_new_category')}</DialogTitle>
          <DialogDescription>
            {t('create_category_description')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!type && (
              <div className="grid gap-2">
                <Label>{t('category_type')}</Label>
                <RadioGroup
                  value={newCategory.type}
                  onValueChange={(value) => setNewCategory({...newCategory, type: value as 'income' | 'expense'})}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">{t('expense')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">{t('income')}</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="categoryName">{t('category_name')}</Label>
              <Input
                id="categoryName"
                value={newCategory.name}
                onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                placeholder={t('enter_category_name')}
              />
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
