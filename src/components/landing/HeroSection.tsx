import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { Star, Box, DollarSign, ShoppingBag, TrendingUp, Package, LayoutDashboard, User, Settings, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import logoImg from '@/assets/logo-cashflow.png';

const easeOut = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: easeOut },
});

// Animated counter that rolls up
const RollNumber = ({ target, prefix = '', suffix = '', delay = 0, className = '' }: {
  target: number; prefix?: string; suffix?: string; delay?: number; className?: string;
}) => {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target]);

  const formatted = prefix + value.toLocaleString('pt-BR') + suffix;
  return <span className={className}>{formatted}</span>;
};

// Chart data matching the real system
const revenueChartData = [
  { date: '01/02', revenue: 18500, sales: 3 },
  { date: '03/02', revenue: 12800, sales: 2 },
  { date: '05/02', revenue: 24300, sales: 4 },
  { date: '07/02', revenue: 9200, sales: 1 },
  { date: '09/02', revenue: 31500, sales: 5 },
  { date: '11/02', revenue: 15700, sales: 2 },
  { date: '13/02', revenue: 28900, sales: 4 },
  { date: '15/02', revenue: 22100, sales: 3 },
  { date: '17/02', revenue: 35600, sales: 6 },
  { date: '19/02', revenue: 19400, sales: 3 },
  { date: '21/02', revenue: 27800, sales: 4 },
  { date: '23/02', revenue: 41200, sales: 7 },
  { date: '25/02', revenue: 33500, sales: 5 },
  { date: '27/02', revenue: 26700, sales: 4 },
  { date: '01/03', revenue: 38900, sales: 6 },
  { date: '03/03', revenue: 29100, sales: 4 },
];

// Mock sales matching real system data structure
const mockTableSales = [
  { date: '03/03/2026', modelo: 'iPhone 16 Pro Max', cap: '256GB', cor: 'Titânio Natural', cond: 'Novo Lacrado', preco: 9800, tipo: 'venda', status: 'concluida', cliente: 'Lucas M.' },
  { date: '01/03/2026', modelo: 'iPhone 15 Pro Max', cap: '256GB', cor: 'Titânio Preto', cond: 'Usado Grade A', preco: 7200, tipo: 'troca', status: 'concluida', cliente: 'Ana C.' },
  { date: '28/02/2026', modelo: 'iPhone 16 Pro', cap: '128GB', cor: 'Titânio Azul', cond: 'Novo Lacrado', preco: 8900, tipo: 'venda', status: 'concluida', cliente: 'Pedro S.' },
  { date: '27/02/2026', modelo: 'iPhone 15', cap: '128GB', cor: 'Azul', cond: 'Novo Lacrado', preco: 5100, tipo: 'venda', status: 'concluida', cliente: 'Maria S.' },
  { date: '25/02/2026', modelo: 'iPhone 14 Pro Max', cap: '256GB', cor: 'Roxo', cond: 'Usado Grade A', preco: 5600, tipo: 'venda', status: 'em_revisao', cliente: 'João O.' },
  { date: '24/02/2026', modelo: 'iPhone 13 Pro Max', cap: '256GB', cor: 'Verde', cond: 'Usado Grade A', preco: 4700, tipo: 'troca', status: 'concluida', cliente: 'Carla S.' },
];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [3, -3]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [-400, 400], [-3, 3]), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleCheckout = async () => {
    if (!user) { navigate('/auth'); return; }
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao iniciar checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-5 overflow-hidden">
      {/* Radial gradient bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(10,132,255,0.12), transparent)',
        }}
      />

      <div className="relative z-10 max-w-[720px] mx-auto text-center">
        {/* Badge */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cf-gold/30 bg-cf-gold/5 mb-8">
          <span className="text-cf-gold text-xs-apple">✦</span>
          <span className="text-xs-apple text-cf-gold font-medium tracking-wide">Para revendedores de iPhone</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.08)}
          className="font-display font-bold text-[36px] md:text-[64px] lg:text-[72px] leading-[1.05] tracking-[-1.5px] text-foreground mb-6"
        >
          Seu estoque. Suas vendas.{' '}
          <span
            className="inline-block"
            style={{
              background: 'linear-gradient(135deg, #F5F5F7 0%, #8E8E93 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Seu caixa.
          </span>
          <br />
          Tudo em um lugar.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          {...fadeUp(0.16)}
          className="text-muted-foreground text-base-apple md:text-[19px] leading-relaxed max-w-[560px] mx-auto mb-8"
        >
          O Cash Flow organiza seu estoque, registra suas vendas e mostra seu faturamento em tempo real — tudo pelo celular, sem planilha, sem complicação.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.24)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-lg-apple rounded-[24px] px-7 py-3.5 hover:scale-[1.02] active:scale-[0.97] transition-all hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] disabled:opacity-60"
          >
            {checkoutLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            {checkoutLoading ? 'Processando...' : 'Começar por R$\u00a089/mês'}
          </button>
          <button
            onClick={() => document.querySelector('#como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-muted-foreground text-base-apple hover:text-foreground transition-colors"
          >
            Ver como funciona ↓
          </button>
        </motion.div>

        {/* Social proof */}
        <motion.div {...fadeUp(0.32)} className="flex flex-col sm:flex-row items-center justify-center gap-3 text-sm-apple text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="flex -space-x-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-background bg-secondary flex items-center justify-center text-[10px] text-muted-foreground font-semibold">
                  {['R', 'M', 'F'][i]}
                </div>
              ))}
            </div>
            <span className="ml-2">Mais de 200 revendedores já usam</span>
          </div>
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="hsl(var(--cf-gold))" strokeWidth={0} className="text-cf-gold" />
            ))}
          </div>
          <span className="hidden sm:inline">·</span>
          <span>Sem fidelidade. Cancele quando quiser.</span>
        </motion.div>
      </div>

      {/* Realistic Dashboard Mockup */}
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: easeOut }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 mt-16 w-full max-w-[960px] mx-auto"
        style={{ perspective: 1200 }}
      >
        {/* Ambient glow behind mockup */}
        <div className="absolute -inset-8 rounded-3xl opacity-40 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 40%, rgba(10,132,255,0.15), transparent 70%)' }}
        />

        <motion.div
          className="rounded-2xl border border-white/[0.12] overflow-hidden relative"
          style={{
            rotateX,
            rotateY,
            boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-[#0d0d0d] rounded-md px-4 py-1 text-[10px] text-muted-foreground font-mono flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-cf-green/60" />
                app.cashflow.com.br/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="bg-[#0A0A0A] flex relative overflow-hidden">
            {/* Full Sidebar matching real system */}
            <div className="hidden md:flex w-[180px] min-w-[180px] bg-[#0A0A0A] border-r border-white/[0.08] flex-col">
              {/* Logo */}
              <div className="flex items-center gap-2.5 px-4 py-4">
                <img src={logoImg} alt="Cash Flow" className="w-5 h-5 brightness-0 invert" />
                <span className="text-[13px] font-semibold text-foreground tracking-tight">Cash Flow</span>
              </div>

              {/* Nav items */}
              <nav className="flex-1 px-2 py-1 space-y-0.5">
                {[
                  { icon: LayoutDashboard, label: 'Dashboard', active: true },
                  { icon: Package, label: 'Estoque', active: false },
                  { icon: User, label: 'Perfil', active: false },
                  { icon: Settings, label: 'Plano', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] relative ${
                      item.active
                        ? 'bg-white/[0.08] text-foreground'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {item.active && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-r" />
                    )}
                    <item.icon size={13} strokeWidth={1.5} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </nav>

              {/* User section */}
              <div className="px-3 py-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[9px] font-medium text-muted-foreground">
                    RM
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-medium text-foreground truncate">Ricardo M.</p>
                    <span className="text-[8px] text-cf-gold font-medium">Cash Flow ✦</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 p-4 md:p-5">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="flex items-center justify-between mb-4"
              >
                <div>
                  <p className="text-[15px] md:text-[17px] font-semibold text-foreground">Dashboard</p>
                </div>
                <div className="flex gap-1">
                  {['Hoje', 'Semana', 'Mês', 'Ano'].map((f, i) => (
                    <span key={f} className={`text-[9px] px-2.5 py-1 rounded-full font-medium ${i === 2 ? 'bg-foreground text-background' : 'text-muted-foreground'}`}>
                      {f}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* KPI Cards - exact match */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
                {[
                  { icon: Box, label: 'UNIDADES EM ESTOQUE', value: 47, prefix: '', color: 'text-foreground', iconColor: 'text-muted-foreground/40', sub: '+3 vs. semana anterior' },
                  { icon: DollarSign, label: 'EQUIVALENTE EM CAIXA', value: 298500, prefix: 'R$ ', color: 'text-cf-gold', iconColor: 'text-muted-foreground/40', sub: 'baseado no preço médio de venda' },
                  { icon: ShoppingBag, label: 'VENDAS NO PERÍODO', value: 23, prefix: '', color: 'text-foreground', iconColor: 'text-muted-foreground/40', sub: 'Ticket médio: R$ 6.817' },
                  { icon: TrendingUp, label: 'FATURAMENTO', value: 156800, prefix: 'R$ ', color: 'text-cf-green', iconColor: 'text-muted-foreground/40', sub: 'Total no período selecionado' },
                ].map((kpi, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.1, duration: 0.4, ease: easeOut }}
                    className="glass-card p-3 relative overflow-hidden"
                  >
                    <div className="absolute top-2.5 right-2.5">
                      <kpi.icon size={14} strokeWidth={1.5} className="text-muted-foreground opacity-40" />
                    </div>
                    <p className="text-[7px] md:text-[8px] text-muted-foreground uppercase tracking-wider mb-1.5">{kpi.label}</p>
                    <RollNumber
                      target={kpi.value}
                      prefix={kpi.prefix}
                      delay={1.0 + i * 0.15}
                      className={`font-mono font-semibold text-[13px] md:text-[16px] block mb-1 ${kpi.color}`}
                    />
                    <p className="text-[7px] text-muted-foreground truncate">{kpi.sub}</p>
                  </motion.div>
                ))}
              </div>

              {/* Charts row - real Recharts */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 mb-4">
                {/* Revenue AreaChart */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="md:col-span-8 glass-card p-3"
                >
                  <p className="text-[10px] font-semibold text-foreground mb-3">Faturamento</p>
                  <div className="h-[80px] md:h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueChartData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="heroRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="hsl(211, 100%, 50%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#48484A', fontSize: 7, fontFamily: 'SF Mono, ui-monospace, monospace' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#48484A', fontSize: 7, fontFamily: 'SF Mono, ui-monospace, monospace' }}
                          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                          width={28}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="hsl(211, 100%, 50%)"
                          strokeWidth={1.5}
                          fill="url(#heroRevenueGrad)"
                          animationDuration={1500}
                          animationBegin={1400}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Volume BarChart */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.6, duration: 0.5 }}
                  className="md:col-span-4 glass-card p-3"
                >
                  <p className="text-[10px] font-semibold text-foreground mb-3">Volume por período</p>
                  <div className="h-[80px] md:h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueChartData} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#48484A', fontSize: 7, fontFamily: 'SF Mono, ui-monospace, monospace' }}
                          interval="preserveStartEnd"
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#48484A', fontSize: 7, fontFamily: 'SF Mono, ui-monospace, monospace' }}
                          width={18}
                        />
                        <Bar
                          dataKey="sales"
                          fill="hsl(211, 100%, 50%)"
                          fillOpacity={0.7}
                          radius={[3, 3, 0, 0]}
                          animationDuration={1200}
                          animationBegin={1600}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>

              {/* Recent Sales Table - matching real system */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.8, duration: 0.4 }}
                className="glass-card p-3"
              >
                <p className="text-[10px] font-semibold text-foreground mb-3">Últimas Vendas</p>
                <div className="hidden md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left">
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2 pr-3">Data</th>
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2 pr-3">Modelo</th>
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2 pr-3">Cap.</th>
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2 pr-3">Cor</th>
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2 pr-3">Preço</th>
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2 pr-3">Tipo</th>
                        <th className="text-[7px] text-muted-foreground uppercase tracking-wider pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTableSales.map((sale, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 2.0 + i * 0.08, duration: 0.3, ease: easeOut }}
                          className="border-t border-white/[0.04]"
                        >
                          <td className="py-1.5 pr-3 font-mono text-[8px] text-muted-foreground">{sale.date}</td>
                          <td className="py-1.5 pr-3 text-[9px] text-foreground font-medium">{sale.modelo}</td>
                          <td className="py-1.5 pr-3 text-[8px] text-muted-foreground">{sale.cap}</td>
                          <td className="py-1.5 pr-3 text-[8px] text-muted-foreground">{sale.cor}</td>
                          <td className="py-1.5 pr-3 font-mono text-[9px] text-foreground">R$ {sale.preco.toLocaleString('pt-BR')}</td>
                          <td className="py-1.5 pr-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[6px] font-medium ${
                              sale.tipo === 'troca' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {sale.tipo === 'troca' ? 'Troca' : 'Venda'}
                            </span>
                          </td>
                          <td className="py-1.5">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[6px] font-medium ${
                              sale.status === 'concluida'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {sale.status === 'concluida' ? 'Concluída' : 'Em Revisão'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Mobile simplified view */}
                <div className="block md:hidden space-y-2">
                  {mockTableSales.slice(0, 4).map((sale, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 2.0 + i * 0.08, duration: 0.3, ease: easeOut }}
                      className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0"
                    >
                      <div>
                        <p className="text-[10px] text-foreground font-medium">{sale.modelo}</p>
                        <p className="text-[8px] text-muted-foreground">{sale.cap} · {sale.cor}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-[10px] text-foreground">R$ {sale.preco.toLocaleString('pt-BR')}</p>
                        <span className={`text-[7px] ${sale.status === 'concluida' ? 'text-green-400' : 'text-amber-400'}`}>
                          {sale.status === 'concluida' ? 'Concluída' : 'Em Revisão'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Pagination mock */}
                <div className="flex items-center justify-center gap-1 mt-2.5 pt-2 border-t border-white/[0.04]">
                  <span className="w-5 h-5 rounded text-[8px] flex items-center justify-center bg-foreground text-background font-medium">1</span>
                  <span className="w-5 h-5 rounded text-[8px] flex items-center justify-center text-muted-foreground">2</span>
                  <span className="w-5 h-5 rounded text-[8px] flex items-center justify-center text-muted-foreground">3</span>
                  <span className="text-[8px] text-muted-foreground">...</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
