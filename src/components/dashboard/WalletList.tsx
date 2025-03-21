
import { useLanguage } from "@/contexts/LanguageContext";
import { Wallet } from "@/types";
import { Card, CardContent } from "../ui/card";
import { Progress } from "../ui/progress";
import { Banknote, CreditCard, PiggyBank, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WalletListProps {
  wallets: Wallet[];
}

export function WalletList({ wallets }: WalletListProps) {
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
        return <Banknote className="h-5 w-5 text-gray-600" />;
    }
  };

  if (!wallets || wallets.length === 0) {
    return <div className="text-center p-4 text-muted-foreground">{t('no_wallets')}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {wallets.map((wallet) => (
        <Card key={wallet.id} className="overflow-hidden shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {getWalletIcon(wallet.type)}
                <h3 className="font-medium">{wallet.name}</h3>
              </div>
              <span className="text-sm text-muted-foreground">{t(wallet.type)}</span>
            </div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-xl font-bold">{formatCurrency(wallet.balance)}</span>
            </div>
            <Progress 
              value={100} 
              className="h-1.5" 
              style={{ backgroundColor: wallet.color ? `${wallet.color}40` : '#e5e7eb', '--progress-color': wallet.color } as any}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
