import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Users, CalendarDays, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
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

const gam3eyat = [
  {
    id: 1,
    name: "Office Group",
    totalAmount: 50000,
    membersCount: 10,
    monthlyContribution: 5000,
    startDate: "2023-01-01",
    endDate: "2023-10-31",
    myTurn: 5,
    myTurnDate: "2023-05-01",
    received: true,
    active: true
  },
  {
    id: 2,
    name: "Family Circle",
    totalAmount: 36000,
    membersCount: 6,
    monthlyContribution: 6000,
    startDate: "2023-03-01",
    endDate: "2023-08-31",
    myTurn: 3,
    myTurnDate: "2023-05-01",
    received: true,
    active: true
  },
  {
    id: 3,
    name: "Friends Group",
    totalAmount: 24000,
    membersCount: 8,
    monthlyContribution: 3000,
    startDate: "2023-08-01",
    endDate: "2024-03-31",
    myTurn: 4,
    myTurnDate: "2023-11-01",
    received: false,
    active: true
  }
];

const Gam3eya = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [gam3eyaList, setGam3eyaList] = useState(gam3eyat);
  const [newGam3eya, setNewGam3eya] = useState({
    name: "",
    totalAmount: 0,
    membersCount: 0,
    monthlyContribution: 0,
    startDate: "",
    endDate: "",
    myTurn: 1,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGam3eya({
      ...newGam3eya,
      [name]: name === "name" ? value : Number(value) || value,
    });
  };

  const handleCreateGam3eya = () => {
    if (!newGam3eya.name || !newGam3eya.startDate || !newGam3eya.endDate) {
      toast({
        title: t('validation_error'),
        description: t('please_fill_all_required_fields'),
        variant: "destructive",
      });
      return;
    }

    const newId = Math.max(...gam3eyaList.map(g => g.id)) + 1;
    const myTurnDate = new Date(newGam3eya.startDate);
    myTurnDate.setMonth(myTurnDate.getMonth() + newGam3eya.myTurn - 1);

    const createdGam3eya = {
      id: newId,
      name: newGam3eya.name,
      totalAmount: newGam3eya.totalAmount,
      membersCount: newGam3eya.membersCount,
      monthlyContribution: newGam3eya.monthlyContribution,
      startDate: newGam3eya.startDate,
      endDate: newGam3eya.endDate,
      myTurn: newGam3eya.myTurn,
      myTurnDate: myTurnDate.toISOString().split('T')[0],
      received: false,
      active: true
    };

    setGam3eyaList([...gam3eyaList, createdGam3eya]);
    setOpen(false);
    setNewGam3eya({
      name: "",
      totalAmount: 0,
      membersCount: 0,
      monthlyContribution: 0,
      startDate: "",
      endDate: "",
      myTurn: 1,
    });

    toast({
      title: t('success'),
      description: t('gam3eya_created_successfully'),
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('gam3eya')}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t('create_gam3eya')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('create_new_gam3eya')}</DialogTitle>
              <DialogDescription>
                {t('fill_details_to_create_gam3eya')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">{t('gam3eya_name')}</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={newGam3eya.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="totalAmount">{t('total_amount')}</Label>
                  <Input 
                    id="totalAmount" 
                    name="totalAmount"
                    type="number"
                    value={newGam3eya.totalAmount || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="membersCount">{t('members_count')}</Label>
                  <Input 
                    id="membersCount" 
                    name="membersCount"
                    type="number"
                    value={newGam3eya.membersCount || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="monthlyContribution">{t('monthly_contribution')}</Label>
                <Input 
                  id="monthlyContribution" 
                  name="monthlyContribution"
                  type="number"
                  value={newGam3eya.monthlyContribution || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">{t('start_date')}</Label>
                  <Input 
                    id="startDate" 
                    name="startDate"
                    type="date"
                    value={newGam3eya.startDate}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">{t('end_date')}</Label>
                  <Input 
                    id="endDate" 
                    name="endDate"
                    type="date"
                    value={newGam3eya.endDate}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="myTurn">{t('my_turn')}</Label>
                <Input 
                  id="myTurn" 
                  name="myTurn"
                  type="number"
                  value={newGam3eya.myTurn || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateGam3eya}>{t('create')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gam3eyaList.map((gam3eya) => (
          <Card key={gam3eya.id} className={`overflow-hidden ${!gam3eya.active && 'opacity-60'}`}>
            <div className="h-2 bg-masareef-primary" />
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between items-center">
                <span>{gam3eya.name}</span>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="h-4 w-4 mr-1" />
                  {gam3eya.membersCount}
                </div>
              </CardTitle>
              <CardDescription className="flex items-center">
                <CalendarDays className="h-4 w-4 mr-1" />
                {new Date(gam3eya.startDate).toLocaleDateString()} - {new Date(gam3eya.endDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t('total_amount')}</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(gam3eya.totalAmount)}
                  </p>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <p className="text-muted-foreground">{t('monthly_contribution')}</p>
                    <p className="font-medium">{formatCurrency(gam3eya.monthlyContribution)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground">{t('my_turn')}</p>
                    <p className="font-medium">{t('month')} {gam3eya.myTurn}</p>
                  </div>
                </div>
                <div className="pt-2">
                  {gam3eya.received ? (
                    <div className="flex items-center text-green-600">
                      <ArrowDownCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">{t('amount_received')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600">
                      <ArrowUpCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {t('expected')}: {new Date(gam3eya.myTurnDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
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
            <Button onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> {t('create_gam3eya')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Gam3eya;
