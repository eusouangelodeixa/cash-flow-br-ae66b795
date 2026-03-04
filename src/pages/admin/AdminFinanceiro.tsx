import { useState, useEffect } from 'react';
import { DollarSign, Users, AlertTriangle, XCircle, TrendingUp, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

type StatusFilter = 'todos' | 'pago' | 'pendente' | 'falhou';

interface BillingRecord {
  id: string;
  customerEmail: string;
  customerName: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente' | 'falhou';
  metodo: string;
}

const AdminFinanceiro = () => {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
  const [billing, setBilling] = useState<BillingRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('admin-users');
        if (error) throw error;
        setUsers(data.users || []);
        setBilling(data.billing || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeUsers = users.filter(u => u.status === 'ativo').length;
  const inadimplentes = users.filter(u => u.status === 'inadimplente').length;
  const cancelados = users.filter(u => u.status === 'cancelado').length;
  const mrr = activeUsers * 89;

  const totalArrecadado = billing
    .filter(b => b.status === 'pago')
    .reduce((sum, b) => sum + b.valor, 0);

  const filteredBillings = billing
    .filter(b => statusFilter === 'todos' || b.status === statusFilter)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  const statusFilters: { label: string; value: StatusFilter }[] = [
    { label: 'Todos', value: 'todos' },
    { label: 'Pagos', value: 'pago' },
    { label: 'Pendentes', value: 'pendente' },
    { label: 'Falhou', value: 'falhou' },
  ];

  const kpis = [
    { label: 'MRR', value: formatCurrency(mrr), icon: TrendingUp, color: 'text-cf-green' },
    { label: 'Ativas', value: activeUsers, icon: Users, color: 'text-primary' },
    { label: 'Inadimplentes', value: inadimplentes, icon: AlertTriangle, color: 'text-cf-gold' },
    { label: 'Cancelados', value: cancelados, icon: XCircle, color: 'text-cf-red' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-muted-foreground" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl-apple md:text-3xl-apple font-display font-semibold text-foreground">Financeiro</h1>
        <p className="text-sm-apple text-muted-foreground mt-1">Gestão de assinaturas, cobranças e receita</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="glass-card p-4 md:p-5">
            <div className="flex items-center gap-2 mb-2">
              <kpi.icon size={16} strokeWidth={1.5} className={kpi.color} />
              <span className="label-uppercase">{kpi.label}</span>
            </div>
            <p className={`text-xl-apple md:text-2xl-apple font-mono font-semibold ${kpi.color}`}>{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign size={16} strokeWidth={1.5} className="text-cf-gold" />
          <span className="label-uppercase">Total Arrecadado (histórico)</span>
        </div>
        <p className="text-2xl-apple md:text-3xl-apple font-mono font-bold text-cf-gold">{formatCurrency(totalArrecadado)}</p>
        <p className="text-xs-apple text-muted-foreground mt-1">{billing.filter(b => b.status === 'pago').length} cobranças pagas</p>
      </motion.div>

      <div className="glass-card p-5 md:p-6 space-y-4">
        <h3 className="text-lg-apple font-display font-semibold text-foreground">Assinaturas por Status</h3>
        <div className="space-y-3">
          {[
            { label: 'Ativas', count: activeUsers, total: users.length, color: 'bg-cf-green' },
            { label: 'Inadimplentes', count: inadimplentes, total: users.length, color: 'bg-cf-gold' },
            { label: 'Canceladas', count: cancelados, total: users.length, color: 'bg-cf-red' },
          ].map(item => (
            <div key={item.label} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm-apple">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-mono text-foreground">{item.count}</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div className={`h-full ${item.color} rounded-full transition-all duration-500`} style={{ width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg-apple font-display font-semibold text-foreground">Histórico de Cobranças</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {statusFilters.map(f => (
              <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`px-3 py-1.5 rounded-pill text-xs-apple font-medium whitespace-nowrap transition-colors ${statusFilter === f.value ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredBillings.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhuma cobrança encontrada</p>
        ) : (
          <>
            <div className="hidden md:block glass-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 label-uppercase">Usuário</th>
                    <th className="text-left px-4 py-3 label-uppercase">Data</th>
                    <th className="text-left px-4 py-3 label-uppercase">Método</th>
                    <th className="text-left px-4 py-3 label-uppercase">Status</th>
                    <th className="text-right px-4 py-3 label-uppercase">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBillings.map(b => (
                    <tr key={b.id} className="border-b border-border/50 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-4 py-3 text-sm-apple font-medium text-foreground">{b.customerName}</td>
                      <td className="px-4 py-3 text-sm-apple text-muted-foreground">{formatDate(b.data)}</td>
                      <td className="px-4 py-3 text-sm-apple text-muted-foreground">{b.metodo}</td>
                      <td className="px-4 py-3">
                        <span className={`status-pill ${b.status === 'pago' ? 'status-pill-green' : b.status === 'pendente' ? 'status-pill-amber' : 'status-pill-red'}`}>
                          {b.status === 'pago' ? 'Pago' : b.status === 'pendente' ? 'Pendente' : 'Falhou'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm-apple font-mono text-right text-foreground">{formatCurrency(b.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {filteredBillings.map(b => (
                <div key={b.id} className="glass-card p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm-apple font-medium text-foreground">{b.customerName}</p>
                      <p className="text-xs-apple text-muted-foreground">{formatDate(b.data)} · {b.metodo}</p>
                    </div>
                    <span className={`status-pill ${b.status === 'pago' ? 'status-pill-green' : b.status === 'pendente' ? 'status-pill-amber' : 'status-pill-red'}`}>
                      {b.status === 'pago' ? 'Pago' : b.status === 'pendente' ? 'Pendente' : 'Falhou'}
                    </span>
                  </div>
                  <p className="text-base-apple font-mono font-semibold text-foreground">{formatCurrency(b.valor)}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminFinanceiro;
