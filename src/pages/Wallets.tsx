import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Wallet } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Wallet as WalletIcon, Banknote, PiggyBank, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { walletsApi } from "@/services/api";

const Wallets = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [walletList, setWalletList] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newWallet, setNewWallet] = useState({
    name: "",
    type: "",
    balance: 0,
    color: "#83C5BE",
  });

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const data = await walletsApi.getAll();
        setWalletList(data);
      } catch (error) {
        console.error("Failed to fetch wallets:", error);
        toast({
          title: t('error'),
          description: t('failed_to_fetch_wallets'),
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [toast, t]);

  const walletTypes = ["cash", "bank", "savings", "gam3eya", "custom"];
  const colorOptions = ["#83C5BE", "#E29578", "#006D77", "#FFDDD2", "#4ECDC4", "#FF6B6B"];
  
  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Banknote className="h-5 w-5 text-green-600" />;
      case 'bank':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5 text-amber-600" />;
      case 'gam3eya':
        return <Users className="h-5 w-5 text-purple-600" />;
      default:
        return <WalletIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewWallet({
      ...newWallet,
      [name]: name === "balance" ? Number(value) : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setNewWallet({
      ...newWallet,
      [name]: value,
    });
  };

  const handleAddWallet = async () => {
    if (!newWallet.name || !newWallet.type) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_all_required_fields'),
        variant: "destructive",
      });
      return;
    }

    try {
      const createdWallet = await walletsApi.create({
        name: newWallet.name,
        type: newWallet.type as 'cash' | 'bank' | 'savings' | 'gam3eya' | 'custom',
        balance: newWallet.balance,
        color: newWallet.color || colorOptions[Math.floor(Math.random() * colorOptions.length)],
      });

      setWalletList([...walletList, createdWallet]);
      setOpen(false);
      setNewWallet({
        name: "",
        type: "",
        balance: 0,
        color: "#83C5BE",
      });

      toast({
        title: t('success'),
        description: t('wallet_added_successfully'),
      });
    } catch (error) {
      console.error("Failed to add wallet:", error);
      toast({
        title: t('error'),
        description: t('failed_to_add_wallet'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteWallet = async (id: string) => {
    try {
      await walletsApi.delete(id);
      setWalletList(walletList.filter(w => w.id !== id));
      toast({
        title: t('success'),
        description: t('wallet_deleted_successfully'),
      });
    } catch (error) {
      console.error("Failed to delete wallet:", error);
      toast({
        title: t('error'),
        description: t('failed_to_delete_wallet'),
        variant: "destructive",
      });
    }
  };

  const totalBalance = walletList.reduce((sum, wallet) => sum + Number(wallet.balance), 0);
  if (loading) {
    return <div className="p-8 text-center">{t('loading_wallets')}...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('wallets')}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t('add_wallet')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('add_new_wallet')}</DialogTitle>
              <DialogDescription>
                {t('enter_wallet_details')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('wallet_name')}</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={newWallet.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">{t('wallet_type')}</Label>
                <Select 
                  onValueChange={(value) => handleSelectChange("type", value)}
                  value={newWallet.type}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_wallet_type')} />
                  </SelectTrigger>
                  <SelectContent>
                    {walletTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {t(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="balance">{t('initial_balance')}</Label>
                <Input 
                  id="balance" 
                  name="balance"
                  type="number"
                  value={newWallet.balance || ""}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">{t('wallet_color')}</Label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        newWallet.color === color ? 'border-black' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleSelectChange("color", color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddWallet}>{t('add_wallet')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-masareef-primary text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80">{t('total_balance')}</p>
              <h2 className="text-3xl font-bold mt-2">
                {formatCurrency(totalBalance)}
              </h2>
            </div>
            <WalletIcon className="h-12 w-12 opacity-80" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('my_wallets')}</CardTitle>
          <CardDescription>
            {t('manage_your_wallets')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {walletList.length === 0 ? (
            <div className="text-center p-6">
              <p className="text-muted-foreground">{t('no_wallets_yet')}</p>
            </div>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {walletList.map((wallet) => (
                <AccordionItem key={wallet.id} value={`wallet-${wallet.id}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center" 
                        style={{ backgroundColor: `${wallet.color}30` }}
                      >
                        {getWalletIcon(wallet.type)}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{wallet.name}</p>
                        <p className="text-sm text-muted-foreground">{t(wallet.type)}</p>
                      </div>
                    </div>
                    <div className="text-right mr-4">
                      <p className="font-bold">
                        {formatCurrency(wallet.balance)}
                      </p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="p-4 space-y-4 bg-gray-50 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('account_number')}</span>
                        <span className="font-medium">
                          {wallet.type === 'bank' ? '**** **** **** 4582' : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{t('last_updated')}</span>
                        <span className="font-medium">2023-07-15</span>
                      </div>
                      <div className="pt-2 flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          {t('edit')}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-red-500"
                          onClick={() => handleDeleteWallet(wallet.id)}
                        >
                          {t('delete')}
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallets;
