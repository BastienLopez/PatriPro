import { TrendingUp, Percent, PiggyBank, CreditCard } from 'lucide-react';
import {
  getSavingsRate,
  getTotalLiabilities,
  getTotalPatrimony,
  formatCurrency,
  loans,
} from '@/lib/data';

export function KPICards() {
  const savingsRate = getSavingsRate();
  const totalPatrimony = getTotalPatrimony();
  const invested = totalPatrimony - 4484; // Cash & Livrets
  const investedPercent = (invested / totalPatrimony) * 100;
  const totalLiabilities = getTotalLiabilities();

  const kpis = [
    {
      icon: PiggyBank,
      label: 'Taux d\'épargne',
      value: `${savingsRate.toFixed(1)}%`,
      color: savingsRate > 0 ? 'text-positive' : 'text-negative',
    },
    {
      icon: TrendingUp,
      label: 'Performance YTD',
      value: '+12.4%',
      color: 'text-positive',
    },
    {
      icon: Percent,
      label: '% Investi',
      value: `${investedPercent.toFixed(1)}%`,
      color: 'text-primary',
    },
    {
      icon: CreditCard,
      label: 'Emprunts',
      value: `${loans.length} • ${formatCurrency(totalLiabilities)}`,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary">
              <kpi.icon className="text-muted-foreground" size={18} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className={`text-sm font-semibold ${kpi.color}`}>{kpi.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
