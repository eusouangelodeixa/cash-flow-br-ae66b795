import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/format';
import { format } from 'date-fns';
import { Sale } from '@/hooks/useSales';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 md:px-4 md:py-3 shadow-elevation-2">
      <p className="text-[10px] md:text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-mono text-xs md:text-base-apple text-foreground">{formatCurrency(payload[0].value)}</p>
    </div>
  );
};

interface Props {
  sales: Sale[];
}

const RevenueChart = ({ sales }: Props) => {
  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    sales.forEach(s => {
      const date = format(new Date(s.created_at), 'dd/MM');
      grouped.set(date, (grouped.get(date) || 0) + s.preco_venda);
    });
    return Array.from(grouped.entries()).map(([date, revenue]) => ({ date, revenue }));
  }, [sales]);

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
      <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-4 md:mb-6">Faturamento</h3>
      <div className="h-[200px] md:h-[280px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhuma venda no período</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(240, 3%, 29%)', fontSize: 10, fontFamily: 'SF Mono, ui-monospace, monospace' }} interval="preserveStartEnd" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(240, 3%, 29%)', fontSize: 10, fontFamily: 'SF Mono, ui-monospace, monospace' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={35} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(211, 100%, 50%)" strokeWidth={2} fill="url(#revenueGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RevenueChart;
