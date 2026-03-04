import { useState, useEffect } from 'react';
import { Users, DollarSign, AlertTriangle, XCircle, TrendingUp, Search, Loader2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface AdminUser {
  id: string;
  nome: string;
  email: string;
  loja: string;
  status: 'ativo' | 'cancelado' | 'inadimplente';
  dataCadastro: string;
  dataRenovacao: string | null;
  ultimoPagamento: string | null;
}

const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('admin-users');
        if (error) throw error;
        setUsers(data.users || []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'ativo').length;
  const inadimplentes = users.filter(u => u.status === 'inadimplente').length;
  const cancelados = users.filter(u => u.status === 'cancelado').length;
  const mrr = activeUsers * 89;

  const filteredUsers = users.filter(u =>
    u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.loja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const kpis = [
    { label: 'Total de Usuários', value: totalUsers, icon: Users, color: 'text-primary' },
    { label: 'Assinaturas Ativas', value: activeUsers, icon: TrendingUp, color: 'text-cf-green' },
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
        <h1 className="text-2xl-apple md:text-3xl-apple font-display font-semibold text-foreground">Painel Administrativo</h1>
        <p className="text-sm-apple text-muted-foreground mt-1">Visão geral da plataforma Cash Flow</p>
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
          <DollarSign size={16} strokeWidth={1.5} className="text-cf-green" />
          <span className="label-uppercase">MRR — Receita Recorrente Mensal</span>
        </div>
        <p className="text-2xl-apple md:text-3xl-apple font-mono font-bold text-cf-green">{formatCurrency(mrr)}</p>
        <p className="text-xs-apple text-muted-foreground mt-1">{activeUsers} assinaturas ativas × {formatCurrency(89)}</p>
      </motion.div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg-apple font-display font-semibold text-foreground">Usuários</h2>
          <div className="relative">
            <Search size={16} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Buscar usuário..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full sm:w-[260px] pl-9 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm-apple text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" />
          </div>
        </div>

        <div className="hidden md:block glass-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 label-uppercase">Usuário</th>
                <th className="text-left px-4 py-3 label-uppercase">Loja</th>
                <th className="text-left px-4 py-3 label-uppercase">Status</th>
                <th className="text-left px-4 py-3 label-uppercase">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-b border-border/50 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm-apple font-medium text-foreground">{user.nome || user.email}</p>
                    <p className="text-xs-apple text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm-apple text-muted-foreground">{user.loja || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`status-pill ${user.status === 'ativo' ? 'status-pill-green' : user.status === 'inadimplente' ? 'status-pill-amber' : 'status-pill-red'}`}>
                      {user.status === 'ativo' ? 'Ativo' : user.status === 'inadimplente' ? 'Inadimplente' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm-apple text-muted-foreground">{formatDate(user.dataCadastro)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="glass-card p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm-apple font-medium text-foreground">{user.nome || user.email}</p>
                  <p className="text-xs-apple text-muted-foreground">{user.loja || '—'}</p>
                </div>
                <span className={`status-pill ${user.status === 'ativo' ? 'status-pill-green' : user.status === 'inadimplente' ? 'status-pill-amber' : 'status-pill-red'}`}>
                  {user.status === 'ativo' ? 'Ativo' : user.status === 'inadimplente' ? 'Inadimplente' : 'Cancelado'}
                </span>
              </div>
              <div className="text-xs-apple text-muted-foreground">
                <span>Cadastro: {formatDate(user.dataCadastro)}</span>
              </div>
            </div>
          ))}
        </div>
        {filteredUsers.length === 0 && !loading && (
          <p className="text-center text-muted-foreground text-sm py-8">Nenhum usuário encontrado</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
