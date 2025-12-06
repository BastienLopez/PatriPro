import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, calculateCharges } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Wallet, AlertTriangle } from 'lucide-react';

export function BusinessAnalytics() {
  const { invoices, companyProfile, businessSubscriptions } = useData();

  // Calculate paid invoices by month
  const paidInvoices = invoices.filter(inv => inv.status === 'PAID' && inv.paymentDate);
  const monthlyRevenue: Record<string, number> = {};
  
  paidInvoices.forEach(inv => {
    const month = inv.paymentDate!.substring(0, 7); // YYYY-MM
    monthlyRevenue[month] = (monthlyRevenue[month] || 0) + inv.total;
  });

  const revenueChartData = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => {
      const charges = calculateCharges(revenue, companyProfile);
      return {
        month: new Date(month + '-01').toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
        revenue,
        netProfit: charges.netIncome,
      };
    });

  // Top clients by revenue
  const clientRevenue: Record<string, number> = {};
  paidInvoices.forEach(inv => {
    const clientKey = inv.clientCompany || inv.clientName;
    clientRevenue[clientKey] = (clientRevenue[clientKey] || 0) + inv.total;
  });

  const topClients = Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  // Calculate totals
  const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalCharges = calculateCharges(totalRevenue, companyProfile);
  const monthlySubsCost = businessSubscriptions
    .filter(s => s.billingPeriod === 'MONTHLY')
    .reduce((sum, s) => sum + s.amount, 0);
  const yearlySubsCost = businessSubscriptions
    .filter(s => s.billingPeriod === 'YEARLY')
    .reduce((sum, s) => sum + s.amount, 0);
  const annualSubsCost = monthlySubsCost * 12 + yearlySubsCost;

  // Suggested amount to set aside for next quarter
  const avgQuarterlyRevenue = totalRevenue / Math.max(Object.keys(monthlyRevenue).length / 3, 1);
  const suggestedReserve = calculateCharges(avgQuarterlyRevenue, companyProfile).totalCharges;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-positive" />
              <p className="text-sm text-muted-foreground">CA total</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-positive" />
              <p className="text-sm text-muted-foreground">Bénéfice estimé</p>
            </div>
            <p className="text-2xl font-bold text-positive">{formatCurrency(totalCharges.netIncome - annualSubsCost)}</p>
            <p className="text-xs text-muted-foreground">Après charges & abonnements</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <p className="text-sm text-muted-foreground">Nombre de clients</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{Object.keys(clientRevenue).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-chart-4" />
              <p className="text-sm text-muted-foreground">À provisionner</p>
            </div>
            <p className="text-2xl font-bold text-chart-4">{formatCurrency(suggestedReserve)}</p>
            <p className="text-xs text-muted-foreground">Estimation trim. charges</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution CA & Bénéfice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" name="CA" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" name="Bénéfice" fill="hsl(var(--positive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Top clients par CA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <span className="font-bold">{formatCurrency(client.amount)}</span>
                </div>
              ))}
              {topClients.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Aucune facture payée pour le moment</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalCharges.totalCharges > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  💡 Avec un CA de <strong>{formatCurrency(totalRevenue)}</strong>, vous devez provisionner environ{' '}
                  <strong className="text-negative">{formatCurrency(totalCharges.totalCharges)}</strong> pour les charges
                  ({((totalCharges.totalCharges / totalRevenue) * 100).toFixed(1)}% du CA).
                </p>
              </div>
            )}
            {annualSubsCost > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">
                  📊 Vos abonnements professionnels représentent <strong>{formatCurrency(annualSubsCost)}</strong>/an.
                  {annualSubsCost > totalRevenue * 0.1 && (
                    <span className="text-chart-4"> C'est plus de 10% de votre CA, pensez à optimiser.</span>
                  )}
                </p>
              </div>
            )}
            {topClients.length > 0 && topClients[0].amount > totalRevenue * 0.5 && (
              <div className="p-4 bg-chart-4/10 rounded-lg border border-chart-4/20">
                <p className="text-sm text-chart-4">
                  ⚠️ Attention : <strong>{topClients[0].name}</strong> représente plus de 50% de votre CA. 
                  Diversifiez votre clientèle pour réduire les risques.
                </p>
              </div>
            )}
            {paidInvoices.length >= 3 && (
              <div className="p-4 bg-positive/10 rounded-lg border border-positive/20">
                <p className="text-sm text-positive">
                  ✅ Bon travail ! Vous avez encaissé {paidInvoices.length} factures pour un total de{' '}
                  <strong>{formatCurrency(totalRevenue)}</strong>.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
