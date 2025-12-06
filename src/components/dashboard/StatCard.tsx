import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, changeLabel, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {change !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  'text-sm font-medium',
                  trend === 'up' && 'text-positive',
                  trend === 'down' && 'text-negative',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-muted-foreground">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="text-primary" size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
