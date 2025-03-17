
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Plus, Users, CalendarDays, ArrowDownCircle, ArrowUpCircle } from "lucide-react";

// Dummy data for gam3eya
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
    monthly

Contribution: 3000,
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('gam3eya')}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {t('create_gam3eya')}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gam3eyat.map((gam3eya) => (
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

      {gam3eyat.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">{t('no_gam3eya_yet')}</h3>
            <p className="text-muted-foreground mb-4">
              {t('start_by_creating_gam3eya')}
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> {t('create_gam3eya')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Gam3eya;
