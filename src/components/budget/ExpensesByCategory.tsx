import { getExpensesByCategory, formatCurrency, categoryLabels, categoryColors, ExpenseCategory } from '@/lib/data';
import { Progress } from '@/components/ui/progress';

export function ExpensesByCategory() {
  const categories = getExpensesByCategory();

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h3 className="text-lg font-semibold text-foreground mb-4">Dépenses par catégorie</h3>
      
      <div className="space-y-4">
        {categories.map((cat) => {
          const label = categoryLabels[cat.category as ExpenseCategory] || cat.category;
          const color = categoryColors[cat.category as ExpenseCategory] || 'hsl(0, 0%, 60%)';
          
          return (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-foreground">{label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(cat.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {cat.percent.toFixed(1)}%
                  </span>
                </div>
              </div>
              <Progress
                value={cat.percent}
                className="h-2"
                style={{ '--progress-color': color } as React.CSSProperties}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
