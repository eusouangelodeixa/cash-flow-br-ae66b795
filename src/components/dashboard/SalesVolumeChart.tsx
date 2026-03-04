import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Sale } from '@/hooks/useSales';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 md:px-4 md:py-3 shadow-elevation-2">
      <p className="text-[10px] md:text-xs text-muted-foreground mb-1">{label}</p>
      <p className="font-mono text-xs md:text-base-apple text-foreground">{payload[0].value} vendas</p>
    </div>
  );
};

interface Props {
  sales: Sale[];
}

const SalesVolumeChart = ({ sales }: Props) => {
  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    sales.forEach(s => {
      const date = format(new Date(s.created_at), 'dd/MM');
      grouped.set(date, (grouped.get(date) || 0) + 1);
    });
    return Array.from(grouped.entries()).map(([date, count]) => ({ date, sales: count }));
  }, [sales]);

  return (
    <div className="glass-card p-4 md:p-6 animate-fade-in" style={{ animationDelay: '280ms' }}>
      <h3 className="text-sm md:text-base-apple font-display font-semibold text-foreground mb-4 md:mb-6">Volume por período</h3>
      <div className="h-[200px] md:h-[280px]">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">Nenhuma venda no período</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(240, 3%, 29%)', fontSize: 10, fontFamily: 'SF Mono, ui-monospace, monospace' }} interval="preserveStartEnd" />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(240, 3%, 29%)', fontSize: 10, fontFamily: 'SF Mono, ui-monospace, monospace' }} width={25} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sales" fill="hsl(211, 100%, 50%)" fillOpacity={0.7} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default SalesVolumeChart;
