import { useState, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useData } from '@/contexts/DataContext';
import { formatCurrency, categoryLabels, ExpenseCategory } from '@/lib/data';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Period = '1M' | '3M' | '1Y' | 'ALL';

const Cashflow = () => {
  const { incomes, expenses, accounts } = useData();
  const [period, setPeriod] = useState<Period>('1M');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);

  // Calculate totals based on frequency
  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, inc) => {
      if (inc.frequency === 'MONTHLY') return sum + inc.amount;
      if (inc.frequency === 'YEARLY') return sum + inc.amount / 12;
      return sum + inc.amount;
    }, 0);
  }, [incomes]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, exp) => {
      if (exp.frequency === 'MONTHLY') return sum + exp.amount;
      if (exp.frequency === 'YEARLY') return sum + exp.amount / 12;
      return sum + exp.amount;
    }, 0);
  }, [expenses]);

  const netCashflow = totalIncome - totalExpenses;
  const isPositive = netCashflow >= 0;
  const savingsRate = totalIncome > 0 ? ((netCashflow / totalIncome) * 100).toFixed(1) : '0';

  // Group expenses by category for Sankey
  const expensesByCategory = useMemo(() => {
    return expenses.reduce((acc, exp) => {
      const key = exp.category;
      if (!acc[key]) acc[key] = 0;
      if (exp.frequency === 'MONTHLY') {
        acc[key] += exp.amount;
      } else if (exp.frequency === 'YEARLY') {
        acc[key] += exp.amount / 12;
      } else {
        acc[key] += exp.amount;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1]);

  const topExpenseCategory = sortedCategories[0];

  // Color palette for categories
  const categoryColors: Record<ExpenseCategory, string> = {
    HOUSING: 'bg-rose-500',
    FOOD: 'bg-amber-500',
    SUBSCRIPTIONS: 'bg-violet-500',
    TRANSPORT: 'bg-blue-500',
    LEISURE: 'bg-emerald-500',
    HEALTH: 'bg-pink-500',
    UTILITIES: 'bg-cyan-500',
    BANKING: 'bg-slate-500',
    OTHER: 'bg-gray-500',
  };

  return (
    <AppLayout title="Cashflow" subtitle="Visualisez vos flux financiers">
      <div className="space-y-6">
        {/* Period Filters */}
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(['1M', '3M', '1Y', 'ALL'] as Period[]).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p === 'ALL' ? 'Tout' : p}
              </Button>
            ))}
          </div>
          <Select value={selectedAccounts.length > 0 ? selectedAccounts[0] : "all"} onValueChange={(v) => setSelectedAccounts(v === "all" ? [] : [v])}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Tous les comptes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les comptes</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards - Finary Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-positive/10">
                <ArrowUpRight className="text-positive" size={20} />
              </div>
              <span className="text-sm text-muted-foreground">Total entrées</span>
            </div>
            <p className="text-3xl font-bold text-positive">{formatCurrency(totalIncome)}</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-negative/10">
                <ArrowDownRight className="text-negative" size={20} />
              </div>
              <span className="text-sm text-muted-foreground">Total sorties</span>
            </div>
            <p className="text-3xl font-bold text-negative">{formatCurrency(totalExpenses)}</p>
          </div>

          <div className={cn(
            "bg-card border border-border rounded-xl p-5",
            isPositive ? "border-positive/30" : "border-negative/30"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn("p-2 rounded-lg", isPositive ? "bg-positive/10" : "bg-negative/10")}>
                <Wallet className={isPositive ? "text-positive" : "text-negative"} size={20} />
              </div>
              <span className="text-sm text-muted-foreground">Solde net</span>
            </div>
            <p className={cn("text-3xl font-bold", isPositive ? "text-positive" : "text-negative")}>
              {isPositive ? '+' : ''}{formatCurrency(netCashflow)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Taux d'épargne : {savingsRate}%
            </p>
          </div>
        </div>

        {/* Sankey-style visualization */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-6">Flux financiers du mois</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sources (Left) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-positive" />
                Sources de revenus
              </h4>
              {incomes.map((income) => {
                const monthlyAmount = income.frequency === 'YEARLY' ? income.amount / 12 : income.amount;
                const percent = ((monthlyAmount / totalIncome) * 100).toFixed(1);
                return (
                  <div key={income.id} className="relative group">
                    <div className="bg-positive/10 border border-positive/20 rounded-lg p-3 hover:bg-positive/15 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{income.label}</p>
                        <span className="text-xs text-muted-foreground">{percent}%</span>
                      </div>
                      <p className="text-lg font-bold text-positive">{formatCurrency(monthlyAmount)}</p>
                    </div>
                    {/* Flow line */}
                    <div className="hidden lg:block absolute right-0 top-1/2 w-8 h-0.5 bg-gradient-to-r from-positive/50 to-transparent transform translate-x-full" />
                  </div>
                );
              })}
            </div>

            {/* Center - Totals */}
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-positive/10 border border-positive/20 rounded-xl p-6 text-center w-full">
                <p className="text-sm text-muted-foreground mb-2">Revenus totaux</p>
                <p className="text-3xl font-bold text-positive">{formatCurrency(totalIncome)}</p>
              </div>
              
              <div className="w-0.5 h-8 bg-border" />
              
              <div className="bg-secondary/50 rounded-xl p-6 text-center w-full">
                <p className="text-sm text-muted-foreground mb-2">Dépenses totales</p>
                <p className="text-3xl font-bold text-negative">{formatCurrency(totalExpenses)}</p>
              </div>

              <div className="w-0.5 h-8 bg-border" />

              <div className={cn(
                "rounded-xl p-6 text-center w-full border-2",
                isPositive ? "bg-positive/5 border-positive/30" : "bg-negative/5 border-negative/30"
              )}>
                <p className="text-sm text-muted-foreground mb-2">Épargne nette</p>
                <p className={cn("text-3xl font-bold", isPositive ? "text-positive" : "text-negative")}>
                  {isPositive ? '+' : ''}{formatCurrency(netCashflow)}
                </p>
              </div>
            </div>

            {/* Destinations (Right) */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingDown size={16} className="text-negative" />
                Catégories de dépenses
              </h4>
              {sortedCategories.map(([category, amount]) => {
                const label = categoryLabels[category as ExpenseCategory] || category;
                const percent = ((amount / totalExpenses) * 100).toFixed(1);
                const colorClass = categoryColors[category as ExpenseCategory] || 'bg-gray-500';
                return (
                  <div key={category} className="relative group">
                    {/* Flow line */}
                    <div className="hidden lg:block absolute left-0 top-1/2 w-8 h-0.5 bg-gradient-to-l from-negative/50 to-transparent transform -translate-x-full" />
                    <div className="bg-negative/10 border border-negative/20 rounded-lg p-3 hover:bg-negative/15 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-2 h-2 rounded-full", colorClass)} />
                          <p className="text-sm font-medium text-foreground">{label}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{percent}%</span>
                      </div>
                      <p className="text-lg font-bold text-negative">{formatCurrency(amount)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Top dépense</p>
            <p className="text-lg font-semibold text-foreground">
              {topExpenseCategory ? categoryLabels[topExpenseCategory[0] as ExpenseCategory] : '-'}
            </p>
            <p className="text-sm text-muted-foreground">
              {topExpenseCategory ? formatCurrency(topExpenseCategory[1]) : '-'} • {topExpenseCategory ? ((topExpenseCategory[1] / totalExpenses) * 100).toFixed(1) : 0}% des dépenses
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Épargne potentielle</p>
            <p className={cn("text-lg font-semibold", isPositive ? "text-positive" : "text-negative")}>
              {formatCurrency(netCashflow)}
            </p>
            <p className="text-sm text-muted-foreground">{savingsRate}% du revenu</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Catégories de dépenses</p>
            <p className="text-lg font-semibold text-foreground">{sortedCategories.length}</p>
            <p className="text-sm text-muted-foreground">catégories actives</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Cashflow;
