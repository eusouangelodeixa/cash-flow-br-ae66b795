import { useState } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const features = [
  'Dashboard com KPIs em tempo real',
  'Registro de vendas por áudio',
  'Controle completo de estoque',
  'Gestão de trocas com fluxo de revisão',
  'Histórico financeiro completo',
  'Acesso total via mobile',
  'Suporte dedicado',
];

const PricingSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message || 'Erro ao iniciar checkout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="preco"
      ref={ref}
      className="py-20 md:py-28 px-5 scroll-mt-20 relative"
    >
      {/* Gold gradient bg */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,168,83,0.08), transparent)' }}
      />

      <div className="max-w-[520px] mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-2xl-apple md:text-3xl-apple text-foreground mb-3">
            Um plano. Tudo incluído.
          </h2>
          <p className="text-base-apple text-muted-foreground">
            Sem surpresas, sem tiers, sem upsell. Você paga R$&nbsp;<span className="font-mono">89</span>/mês e tem acesso a tudo.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={isVisible ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="glass-card p-8 relative overflow-hidden"
          style={{ borderColor: 'rgba(212,168,83,0.3)' }}
        >
          {/* Badge */}
          <div className="absolute top-4 right-4">
            <span className="status-pill-green text-[11px]">Sem fidelidade</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <span className="text-cf-gold">✦</span>
            <span className="font-display font-semibold text-xl-apple text-foreground">Cash Flow</span>
          </div>

          <div className="mb-6">
            <span className="font-mono font-bold text-4xl-apple text-foreground">R$ 89</span>
            <span className="text-muted-foreground text-base-apple">/mês</span>
          </div>

          <ul className="space-y-3 mb-8">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm-apple text-muted-foreground">
                <Check size={16} strokeWidth={1.5} className="text-cf-green shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full bg-foreground text-background font-semibold text-lg-apple rounded-[24px] py-3.5 hover:scale-[1.02] active:scale-[0.97] transition-all disabled:opacity-60"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Processando...' : 'Começar agora →'}
          </button>

          <p className="text-center text-xs-apple text-muted-foreground mt-4">
            Cobrança via PIX, Cartão ou Boleto · Cancele quando quiser
          </p>
        </motion.div>

        <p className="text-center text-xs-apple text-muted-foreground mt-6">
          Pagamento processado com segurança via Stripe.
          <br />
          <span className="text-[#48484A]">Cartão de Crédito</span>
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
