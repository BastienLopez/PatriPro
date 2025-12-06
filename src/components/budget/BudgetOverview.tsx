import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  getTotalMonthlyIncome,
  getTotalMonthlyExpenses,
  getMonthlyCashflow,
  formatCurrency,
} from '@/lib/data';
import { cn } from '@/lib/utils';

export function BudgetOverview() {
  const income = getTotalMonthlyIncome();
  const expenses = getTotalMonthlyExpenses();
  const cashflow = getMonthlyCashflow();
  const isPositive = cashflow >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Entrées</p>
            <p className="text-2xl font-bold text-positive">{formatCurrency(income)}</p>
          </div>
          <div className="p-2 rounded-lg bg-positive/10">
            <ArrowUpRight className="text-positive" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Sorties</p>
            <p className="text-2xl font-bold text-negative">{formatCurrency(expenses)}</p>
          </div>
          <div className="p-2 rounded-lg bg-negative/10">
            <ArrowDownRight className="text-negative" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Solde mensuel</p>
            <p className={cn('text-2xl font-bold', isPositive ? 'text-positive' : 'text-negative')}>
              {isPositive ? '+' : ''}
              {formatCurrency(cashflow)}
            </p>
          </div>
          <div className={cn('p-2 rounded-lg', isPositive ? 'bg-positive/10' : 'bg-negative/10')}>
            {isPositive ? (
              <ArrowUpRight className="text-positive" size={24} />
            ) : (
              <ArrowDownRight className="text-negative" size={24} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
