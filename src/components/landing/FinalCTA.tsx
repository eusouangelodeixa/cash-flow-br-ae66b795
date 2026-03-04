import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const FinalCTA = () => {
  const { ref, isVisible } = useScrollAnimation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) { navigate('/auth'); return; }
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
      ref={ref}
      className="py-24 md:py-32 px-5 relative"
      style={{ background: 'linear-gradient(180deg, #0A0A0A 0%, #0D0D10 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="max-w-[600px] mx-auto text-center"
      >
        <h2 className="font-display font-bold text-3xl-apple md:text-4xl-apple text-foreground mb-4">
          Sua revenda merece um sistema à altura.
        </h2>
        <p className="text-base-apple md:text-[19px] text-muted-foreground mb-8">
          Comece hoje. Configure em minutos. Veja a diferença no primeiro dia.
        </p>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-semibold text-[19px] rounded-[24px] px-10 py-4 hover:scale-[1.02] active:scale-[0.97] transition-all hover:shadow-[0_8px_32px_rgba(255,255,255,0.15)] disabled:opacity-60"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : null}
          {loading ? 'Processando...' : 'Começar por R$\u00a089/mês →'}
        </button>
        <p className="text-xs-apple text-[#48484A] mt-6 tracking-wide">
          Sem fidelidade · Cancele quando quiser · Suporte dedicado
        </p>
      </motion.div>
    </section>
  );
};

export default FinalCTA;
