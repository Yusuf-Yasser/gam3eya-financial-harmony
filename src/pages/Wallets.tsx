
import { useLanguage } from "@/contexts/LanguageContext";
import { wallets } from "@/data/dummyData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Wallet as WalletIcon, Banknote, PiggyBank, Users } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";

const Wallets = () => {
  const { t } = useLanguage();
  
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

  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('wallets')}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('add_wallet')}
        </Button>
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
          <Accordion type="single" collapsible className="w-full">
            {wallets.map((wallet) => (
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
                      EGP {wallet.balance.toLocaleString()}
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
                      <Button variant="outline" size="sm" className="flex-1 text-red-500">
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallets;
