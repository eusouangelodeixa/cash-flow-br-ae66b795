import { useState, useMemo } from 'react';
import { useDevices, Device } from '@/hooks/useDevices';
import { useSales } from '@/hooks/useSales';
import { formatCurrency } from '@/lib/format';
import KPICard from '@/components/dashboard/KPICard';
import AnimatedNumber from '@/components/shared/AnimatedNumber';
import TimeFilterBar from '@/components/dashboard/TimeFilter';
import RevenueChart from '@/components/dashboard/RevenueChart';
import SalesVolumeChart from '@/components/dashboard/SalesVolumeChart';
import RecentSalesTable from '@/components/dashboard/RecentSalesTable';
import { Box, DollarSign, ShoppingBag, TrendingUp, Loader2 } from 'lucide-react';
import { isWithinInterval, startOfDay, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { useState as useTimeFilter } from 'react';

export type TimeFilter = 'hoje' | 'semana' | 'mes' | 'ano';

const Dashboard = () => {
  const { devices, isLoading: devicesLoading } = useDevices();
  const { sales, isLoading: salesLoading } = useSales();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('ano');

  const availableDevices = devices.filter(d => d.status === 'disponivel');
  const totalUnits = availableDevices.length;
  const totalValue = availableDevices.reduce((sum, d) => sum + (d.preco_venda || 0), 0);

  const filteredSales = useMemo(() => {
    const now = new Date();
    let start: Date;
    switch (timeFilter) {
      case 'hoje': start = startOfDay(now); break;
      case 'semana': start = startOfWeek(now, { weekStartsOn: 1 }); break;
      case 'mes': start = startOfMonth(now); break;
      case 'ano': start = startOfYear(now); break;
      default: start = startOfYear(now);
    }
    return sales.filter(s => {
      const saleDate = new Date(s.created_at);
      return s.status === 'concluida' && isWithinInterval(saleDate, { start, end: now });
    });
  }, [sales, timeFilter]);

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.preco_venda, 0);
  const avgTicket = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;

  if (devicesLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-lg md:text-xl-apple font-display font-bold text-foreground">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard label="UNIDADES EM ESTOQUE" subInfo={`${totalUnits} disponíveis`} icon={<Box size={20} strokeWidth={1.5} />} delay={0}>
          <AnimatedNumber value={totalUnits} className="text-2xl md:text-4xl-apple text-foreground" />
        </KPICard>
        <KPICard label="EQUIVALENTE EM CAIXA" subInfo="baseado no preço de venda" icon={<DollarSign size={20} strokeWidth={1.5} />} delay={80}>
          <AnimatedNumber value={totalValue} className="text-xl md:text-3xl-apple text-cf-gold" format={(n) => formatCurrency(n)} />
        </KPICard>
        <KPICard label="VENDAS NO PERÍODO" subInfo={`Ticket médio: ${formatCurrency(avgTicket)}`} icon={<ShoppingBag size={20} strokeWidth={1.5} />} delay={160}>
          <AnimatedNumber value={filteredSales.length} className="text-2xl md:text-4xl-apple text-foreground" />
        </KPICard>
        <KPICard label="FATURAMENTO" subInfo="Total no período selecionado" icon={<TrendingUp size={20} strokeWidth={1.5} />} delay={240}>
          <AnimatedNumber value={totalRevenue} className="text-xl md:text-3xl-apple text-cf-green" format={(n) => formatCurrency(n)} />
        </KPICard>
      </div>

      <TimeFilterBar timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
        <div className="lg:col-span-8">
          <RevenueChart sales={filteredSales} />
        </div>
        <div className="lg:col-span-4">
          <SalesVolumeChart sales={filteredSales} />
        </div>
      </div>

      <RecentSalesTable sales={sales} />
    </div>
  );
};

export default Dashboard;
