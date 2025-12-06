import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getAssetAllocation, formatCurrency, getTotalPatrimony } from '@/lib/data';

export function AllocationChart() {
  const data = getAssetAllocation();
  const total = getTotalPatrimony();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{item.name}</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(item.value)}</p>
          <p className="text-xs text-muted-foreground">
            {((item.value / total) * 100).toFixed(1)}% du patrimoine
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-muted-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Diversification</h3>
        <p className="text-sm text-muted-foreground">Répartition des actifs</p>
      </div>

      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center -mt-8">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-foreground">{formatCurrency(total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
