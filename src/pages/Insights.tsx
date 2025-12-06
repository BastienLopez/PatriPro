import { AppLayout } from '@/components/layout/AppLayout';
import { Lightbulb, AlertTriangle, TrendingUp, PieChart } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import {
  getTotalPatrimony,
  getHoldingValue,
  formatCurrency,
} from '@/lib/data';
import { cn } from '@/lib/utils';

const Insights = () => {
  const { holdings, expenses } = useData();
  
  const totalPatrimony = getTotalPatrimony();
  
  // Calculate concentration
  const holdingsWithValue = holdings.map(h => ({
    ...h,
    value: getHoldingValue(h),
  })).sort((a, b) => b.value - a.value);
  
  const topHolding = holdingsWithValue[0];
  const topHoldingPercent = topHolding ? (topHolding.value / totalPatrimony) * 100 : 0;
  
  const top5Value = holdingsWithValue.slice(0, 5).reduce((sum, h) => sum + h.value, 0);
  const top5Percent = totalPatrimony > 0 ? (top5Value / totalPatrimony) * 100 : 0;

  // Calculate expenses by category from DataContext
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const existing = acc.find(c => c.category === expense.category);
    if (existing) {
      existing.amount += expense.amount;
    } else {
      acc.push({ category: expense.category, amount: expense.amount });
    }
    return acc;
  }, [] as { category: string; amount: number }[]);

  const subscriptionsExpense = expensesByCategory.find(c => c.category === 'SUBSCRIPTIONS');
  const subscriptionsPercent = subscriptionsExpense && totalExpenses > 0 
    ? (subscriptionsExpense.amount / totalExpenses) * 100 
    : 0;

  const insights = [
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Concentration élevée',
      description: topHolding 
        ? `${topHoldingPercent.toFixed(1)}% de votre patrimoine est concentré sur ${topHolding.name}. Pensez à diversifier.`
        : 'Aucune position détectée.',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      type: 'info',
      icon: PieChart,
      title: 'Top 5 holdings',
      description: `Vos 5 plus grandes positions représentent ${top5Percent.toFixed(1)}% de votre patrimoine investi.`,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      type: 'success',
      icon: TrendingUp,
      title: 'Suivi des performances',
      description: 'Suivez l\'évolution de votre patrimoine depuis le Dashboard.',
      color: 'text-positive',
      bgColor: 'bg-positive/10',
    },
    {
      type: 'info',
      icon: Lightbulb,
      title: 'Abonnements',
      description: subscriptionsExpense 
        ? `Vos abonnements représentent ${subscriptionsPercent.toFixed(1)}% de vos dépenses (${formatCurrency(subscriptionsExpense.amount)}/mois).`
        : 'Aucun abonnement détecté.',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  return (
    <AppLayout title="Insights" subtitle="Analyses et recommandations personnalisées">
      <div className="space-y-6">
        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start gap-4">
                <div className={cn('p-3 rounded-lg', insight.bgColor)}>
                  <insight.icon className={insight.color} size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Portfolio Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Holdings */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Top 5 positions</h3>
            <div className="space-y-3">
              {holdingsWithValue.slice(0, 5).map((holding, index) => {
                const percent = totalPatrimony > 0 ? (holding.value / totalPatrimony) * 100 : 0;
                return (
                  <div key={holding.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{holding.name}</p>
                        <p className="text-xs text-muted-foreground">{holding.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(holding.value)}</p>
                      <p className="text-xs text-muted-foreground">{percent.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
              {holdingsWithValue.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucune position</p>
              )}
            </div>
          </div>

          {/* Asset Type Distribution */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-lg font-semibold text-foreground mb-4">Répartition par type</h3>
            <div className="space-y-3">
              {['ETF', 'STOCK', 'CRYPTO', 'FUND'].map((type) => {
                const typeHoldings = holdingsWithValue.filter(h => h.assetType === type);
                const typeValue = typeHoldings.reduce((sum, h) => sum + h.value, 0);
                const percent = totalPatrimony > 0 ? (typeValue / totalPatrimony) * 100 : 0;
                
                if (typeValue === 0) return null;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-secondary text-secondary-foreground">
                        {type}
                      </span>
                      <span className="text-sm text-muted-foreground">{typeHoldings.length} positions</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatCurrency(typeValue)}</p>
                      <p className="text-xs text-muted-foreground">{percent.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recommandations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-primary mt-2" />
              <div>
                <p className="font-medium text-foreground">Diversifiez votre portefeuille</p>
                <p className="text-sm text-muted-foreground">
                  Assurez-vous de répartir vos investissements sur différentes classes d'actifs et zones géographiques.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-positive mt-2" />
              <div>
                <p className="font-medium text-foreground">Investissement régulier</p>
                <p className="text-sm text-muted-foreground">
                  Continuez à investir régulièrement via DCA pour lisser les variations de marché.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
              <div>
                <p className="font-medium text-foreground">Fonds d'urgence</p>
                <p className="text-sm text-muted-foreground">
                  Gardez toujours 3 à 6 mois de dépenses en épargne de précaution accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Insights;