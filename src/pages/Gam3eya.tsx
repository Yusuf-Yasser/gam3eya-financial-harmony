
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { gam3eyaApi, transactionsApi } from "@/services/api";
import { Gam3eya as Gam3eyaType } from "@/types";
import { Gam3eyaDialog, Gam3eyaFormValues } from "@/components/gam3eya/Gam3eyaDialog";
import { Gam3eyaCard } from "@/components/gam3eya/Gam3eyaCard";
import { Gam3eyaPaymentDialog } from "@/components/gam3eya/Gam3eyaPaymentDialog";
import { format, addMonths } from "date-fns";

const Gam3eya = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [gam3eyaList, setGam3eyaList] = useState<Gam3eyaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGam3eya, setSelectedGam3eya] = useState<Gam3eyaType | null>(null);
  const [paymentType, setPaymentType] = useState<'payment' | 'payout'>('payment');

  // Fetch gam3eyas from API
  useEffect(() => {
    fetchGam3eyas();
  }, []);

  const fetchGam3eyas = async () => {
    try {
      setLoading(true);
      const data = await gam3eyaApi.getAll();
      setGam3eyaList(data);
    } catch (error) {
      console.error("Failed to fetch gam3eyas:", error);
      toast({
        title: t('error'),
        description: t('failed_to_fetch_gam3eyas'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGam3eya = async (formData: Gam3eyaFormValues) => {
    try {
      const createdGam3eya = await gam3eyaApi.create({
        ...formData,
        paidCycles: [],
        receivedPayout: false
      });

      setGam3eyaList([...gam3eyaList, createdGam3eya]);
      toast({
        title: t('success'),
        description: t('gam3eya_created_successfully'),
      });
    } catch (error) {
      console.error("Failed to create gam3eya:", error);
      toast({
        title: t('error'),
        description: t('failed_to_create_gam3eya'),
        variant: "destructive",
      });
    }
  };

  const handleUpdateGam3eya = async (formData: Gam3eyaFormValues) => {
    if (!selectedGam3eya) return;
    
    try {
      const updatedGam3eya = await gam3eyaApi.update({
        ...selectedGam3eya,
        ...formData
      });
      
      setGam3eyaList(gam3eyaList.map(g => 
        g.id === updatedGam3eya.id ? updatedGam3eya : g
      ));
      
      toast({
        title: t('success'),
        description: t('gam3eya_updated_successfully'),
      });
    } catch (error) {
      console.error("Failed to update gam3eya:", error);
      toast({
        title: t('error'),
        description: t('failed_to_update_gam3eya'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteGam3eya = async (gam3eya: Gam3eyaType) => {
    try {
      await gam3eyaApi.delete(gam3eya.id);
      setGam3eyaList(gam3eyaList.filter(g => g.id !== gam3eya.id));
      
      toast({
        title: t('success'),
        description: t('gam3eya_deleted_successfully'),
      });
    } catch (error) {
      console.error("Failed to delete gam3eya:", error);
      toast({
        title: t('error'),
        description: t('failed_to_delete_gam3eya'),
        variant: "destructive",
      });
    }
  };

  const handleEditGam3eya = (gam3eya: Gam3eyaType) => {
    setSelectedGam3eya(gam3eya);
    setEditDialogOpen(true);
  };

  const handleMakePayment = (gam3eya: Gam3eyaType) => {
    setSelectedGam3eya(gam3eya);
    setPaymentType('payment');
    setPaymentDialogOpen(true);
  };

  const handleReceivePayout = (gam3eya: Gam3eyaType) => {
    setSelectedGam3eya(gam3eya);
    setPaymentType('payout');
    setPaymentDialogOpen(true);
  };

  const processPayment = async (
    gam3eyaId: string, 
    walletId: string, 
    amount: number, 
    type: 'payment' | 'payout'
  ) => {
    try {
      if (!selectedGam3eya) {
        throw new Error("No selected gam3eya");
      }
      
      const today = new Date();
      
      // Create gam3eya payment record
      await gam3eyaApi.makePayment({
        gam3eyaId,
        walletId,
        amount,
        date: format(today, 'yyyy-MM-dd'),
        cycle: selectedGam3eya.currentCycle || 1,
        type
      });
      
      // Create a transaction record for the payment or payout
      const transactionType = type === 'payment' ? 'expense' : 'income';
      const description = type === 'payment' 
        ? `${t('gam3eya_payment')}: ${selectedGam3eya.name} - ${t('cycle')} ${selectedGam3eya.currentCycle}` 
        : `${t('gam3eya_payout')}: ${selectedGam3eya.name}`;
        
      await transactionsApi.create({
        amount: amount,
        description: description,
        date: format(today, 'yyyy-MM-dd'),
        category: 'gam3eya', // You may need to create a specific category for gam3eya
        type: transactionType,
        walletId: walletId
      });
      
      // Update the gam3eya in the local state
      let updatedGam3eya: Gam3eyaType;
      
      if (type === 'payment') {
        // Add the cycle to paidCycles
        const paidCycles = [...(selectedGam3eya.paidCycles || [])];
        if (!paidCycles.includes(selectedGam3eya.currentCycle)) {
          paidCycles.push(selectedGam3eya.currentCycle);
        }
        
        // Calculate next payment date - advance by one month
        const nextPaymentDate = addMonths(today, 1);
        
        updatedGam3eya = {
          ...selectedGam3eya,
          paidCycles,
          nextPaymentDate: format(nextPaymentDate, 'yyyy-MM-dd')
        };
      } else {
        // Mark as received
        updatedGam3eya = {
          ...selectedGam3eya,
          receivedPayout: true
        };
      }
      
      await gam3eyaApi.update(updatedGam3eya);
      
      // Update local state
      setGam3eyaList(gam3eyaList.map(g => 
        g.id === updatedGam3eya.id ? updatedGam3eya : g
      ));
      
      // Refetch all gam3eyas to get the updated data
      fetchGam3eyas();
    } catch (error) {
      console.error("Failed to process payment:", error);
      throw error;
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading gam3eyas...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('gam3eya')}</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> {t('create_gam3eya')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gam3eyaList.map((gam3eya) => (
          <Gam3eyaCard
            key={gam3eya.id}
            gam3eya={gam3eya}
            onEdit={handleEditGam3eya}
            onDelete={handleDeleteGam3eya}
            onMakePayment={handleMakePayment}
            onReceivePayout={handleReceivePayout}
          />
        ))}
      </div>

      {gam3eyaList.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('no_gam3eya_yet')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('start_by_creating_gam3eya')}
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('create_gam3eya')}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Gam3eya Dialog */}
      <Gam3eyaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSave={handleCreateGam3eya}
      />

      {/* Edit Gam3eya Dialog */}
      {selectedGam3eya && (
        <Gam3eyaDialog
          gam3eya={selectedGam3eya}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={handleUpdateGam3eya}
        />
      )}

      {/* Payment Dialog */}
      {selectedGam3eya && (
        <Gam3eyaPaymentDialog
          gam3eya={selectedGam3eya}
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          onPayment={processPayment}
          paymentType={paymentType}
        />
      )}
    </div>
  );
};

export default Gam3eya;
