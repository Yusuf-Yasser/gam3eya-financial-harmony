
import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gam3eya, Wallet } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { walletsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { format, addMonths } from "date-fns";

interface Gam3eyaPaymentDialogProps {
  gam3eya: Gam3eya;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment: (gam3eyaId: string, walletId: string, amount: number, type: 'payment' | 'payout') => Promise<void>;
  paymentType: 'payment' | 'payout';
}

export function Gam3eyaPaymentDialog({ 
  gam3eya, 
  open, 
  onOpenChange, 
  onPayment,
  paymentType
}: Gam3eyaPaymentDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Get payment amount based on type
  const paymentAmount = paymentType === 'payment' 
    ? gam3eya.contributionAmount 
    : gam3eya.totalAmount; // For payout, use the total amount

  useEffect(() => {
    if (open) {
      fetchWallets();
    }
  }, [open]);

  const fetchWallets = async () => {
    try {
      setLoading(true);
      const data = await walletsApi.getAll();
      
      // If making a payment, filter wallets that have enough balance
      if (paymentType === 'payment') {
        const filteredWallets = data.filter(wallet => wallet.balance >= gam3eya.contributionAmount);
        setWallets(filteredWallets);
      } else {
        setWallets(data);
      }
      
      if (data.length > 0) {
        setSelectedWalletId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching wallets:", error);
      toast({
        title: t('error'),
        description: t('failed_to_fetch_wallets'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedWalletId) {
      toast({
        title: t('validation_error'),
        description: t('please_select_wallet'),
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingPayment(true);
      await onPayment(
        gam3eya.id, 
        selectedWalletId, 
        paymentAmount, // Use the calculated payment amount
        paymentType
      );
      
      onOpenChange(false);
      toast({
        title: t('success'),
        description: paymentType === 'payment' 
          ? t('payment_processed_successfully') 
          : t('payout_processed_successfully'),
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: t('error'),
        description: t('payment_processing_failed'),
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const selectedWallet = wallets.find(wallet => wallet.id === selectedWalletId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {paymentType === 'payment' 
              ? t('make_monthly_contribution') 
              : t('receive_gam3eya_payout')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">{gam3eya.name}</h3>
            <p className="text-sm text-muted-foreground">
              {paymentType === 'payment' 
                ? t('monthly_contribution_for_cycle', { cycle: gam3eya.currentCycle }) 
                : t('receiving_payout_for_gam3eya')}
            </p>
          </div>

          <div className="border rounded-md p-4 bg-muted/30">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{t('amount')}:</span>
              <span className="text-lg font-bold">{formatCurrency(paymentAmount)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium">{t('date')}:</span>
              <span>{format(new Date(), 'yyyy-MM-dd')}</span>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">{t('loading_wallets')}...</div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="wallet-select">
                  {paymentType === 'payment' 
                    ? t('select_wallet_to_pay_from') 
                    : t('select_wallet_to_receive_into')}
                </Label>
                
                {wallets.length === 0 ? (
                  <div className="text-sm text-destructive p-2 border border-destructive/20 rounded bg-destructive/10">
                    {paymentType === 'payment' 
                      ? t('no_wallets_with_sufficient_balance') 
                      : t('no_wallets_available')}
                  </div>
                ) : (
                  <Select
                    value={selectedWalletId}
                    onValueChange={setSelectedWalletId}
                    disabled={processingPayment}
                  >
                    <SelectTrigger id="wallet-select">
                      <SelectValue placeholder={t('select_wallet')} />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets.map((wallet) => (
                        <SelectItem key={wallet.id} value={wallet.id}>
                          {wallet.name} ({formatCurrency(wallet.balance)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedWallet && (
                <div className="text-sm">
                  {paymentType === 'payment' ? (
                    <p>
                      {t('after_payment_wallet_balance_will_be', {
                        balance: formatCurrency(selectedWallet.balance - paymentAmount)
                      })}
                    </p>
                  ) : (
                    <p>
                      {t('after_payout_wallet_balance_will_be', {
                        balance: formatCurrency(selectedWallet.balance + paymentAmount)
                      })}
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={processingPayment}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={handlePayment} 
            disabled={!selectedWalletId || processingPayment || loading || wallets.length === 0}
          >
            {processingPayment ? t('processing') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
