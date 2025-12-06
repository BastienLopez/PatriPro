import { Loan, formatCurrency, formatNumber } from '@/lib/data';
import { Progress } from '@/components/ui/progress';

interface LoanCardProps {
  loan: Loan;
}

export function LoanCard({ loan }: LoanCardProps) {
  const totalPaid = loan.principal - loan.remainingPrincipal;
  const percentPaid = (totalPaid / loan.principal) * 100;
  const totalInterest = (loan.monthlyPayment * loan.termYears * 12) - loan.principal;
  const yearsRemaining = loan.remainingMonths / 12;

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{loan.name}</h3>
          <p className="text-sm text-muted-foreground">Taux: {loan.annualRate}% • {loan.termYears} ans</p>
        </div>
        <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
          En cours
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Montant emprunté</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(loan.principal)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Capital restant dû</p>
          <p className="text-lg font-semibold text-negative">{formatCurrency(loan.remainingPrincipal)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Mensualité</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(loan.monthlyPayment)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Durée restante</p>
          <p className="text-lg font-semibold text-foreground">{yearsRemaining.toFixed(1)} ans</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progression du remboursement</span>
          <span className="font-medium text-foreground">{percentPaid.toFixed(1)}%</span>
        </div>
        <Progress value={percentPaid} className="h-2" />
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Coût total des intérêts</span>
          <span className="font-medium text-foreground">{formatCurrency(totalInterest)}</span>
        </div>
      </div>
    </div>
  );
}
