import { AppLayout } from '@/components/layout/AppLayout';
import { HoldingsTable } from '@/components/portfolio/HoldingsTable';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, getHoldingValue } from '@/lib/data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LifeInsuranceTab } from '@/components/portfolio/LifeInsuranceTab';

const Portfolios = () => {
  const { holdings, lifeInsuranceHoldings } = useData();
  
  const peaHoldings = holdings.filter(h => h.accountId === '4');
  const ctoHoldings = holdings.filter(h => h.accountId === '5');
  const cryptoHoldings = holdings.filter(h => h.accountId === '6');

  const peaTotal = peaHoldings.reduce((sum, h) => sum + getHoldingValue(h), 0);
  const ctoTotal = ctoHoldings.reduce((sum, h) => sum + getHoldingValue(h), 0);
  const cryptoTotal = cryptoHoldings.reduce((sum, h) => sum + getHoldingValue(h), 0);
  const lifeInsuranceTotal = lifeInsuranceHoldings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  const allTotal = peaTotal + ctoTotal + cryptoTotal + lifeInsuranceTotal;

  const portfolioSummary = [
    { name: 'Total', value: allTotal },
    { name: 'PEA', value: peaTotal },
    { name: 'CTO', value: ctoTotal },
    { name: 'Crypto', value: cryptoTotal },
    { name: 'Assurance-vie', value: lifeInsuranceTotal },
  ];

  return (
    <AppLayout title="Portefeuilles" subtitle="Gérez vos investissements">
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {portfolioSummary.map((item) => (
            <div key={item.name} className="bg-card border border-border rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">{item.name}</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(item.value)}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-card border border-border">
            <TabsTrigger value="all">Vue globale</TabsTrigger>
            <TabsTrigger value="pea">PEA ({peaHoldings.length})</TabsTrigger>
            <TabsTrigger value="cto">CTO ({ctoHoldings.length})</TabsTrigger>
            <TabsTrigger value="crypto">Crypto ({cryptoHoldings.length})</TabsTrigger>
            <TabsTrigger value="lifeinsurance">Assurance-vie</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <HoldingsTable holdings={holdings} />
          </TabsContent>
          <TabsContent value="pea" className="mt-4">
            <HoldingsTable holdings={peaHoldings} />
          </TabsContent>
          <TabsContent value="cto" className="mt-4">
            <HoldingsTable holdings={ctoHoldings} />
          </TabsContent>
          <TabsContent value="crypto" className="mt-4">
            <HoldingsTable holdings={cryptoHoldings} />
          </TabsContent>
          <TabsContent value="lifeinsurance" className="mt-4">
            <LifeInsuranceTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Portfolios;
