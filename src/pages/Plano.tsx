import { useState, useEffect } from 'react';
import { useStore } from '@/hooks/useStore';
import { useAuth } from '@/contexts/AuthContext';
import { plans } from '@/data/user';
import { formatCurrency, formatDate } from '@/lib/format';
import { Check, Crown, X, AlertTriangle, Loader2, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

const Plano = () => {
  const { state } = useStore();
  const { user, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [showRenew, setShowRenew] = useState(false);
  const [cancelStep, setCancelStep] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const currentPlan = plans[0];

  // Handle return from checkout
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({ title: 'Assinatura ativada!', description: 'Bem-vindo ao Cash Flow!' });
      checkSubscription();
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao iniciar checkout.', variant: 'destructive' });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message || 'Erro ao abrir portal.', variant: 'destructive' });
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="max-w-[900px] mx-auto space-y-6 md:space-y-8">
      <h1 className="text-lg md:text-xl-apple font-display font-bold text-foreground">Gestão de Plano</h1>

      {/* Subscription status */}
      {subscription.subscribed && (
        <div className="glass-card p-4 border-l-4 border-l-[hsl(var(--cf-green))]">
          <div className="flex items-center gap-2">
            <Check size={16} className="text-cf-green" />
            <span className="text-sm font-medium text-cf-green">Assinatura ativa</span>
          </div>
          {subscription.subscriptionEnd && (
            <p className="text-xs text-muted-foreground mt-1">
              Renova em {formatDate(subscription.subscriptionEnd)}
            </p>
          )}
        </div>
      )}

      {/* Current plan card */}
      <div className="glass-card p-4 md:p-6 shadow-elevation-3 animate-fade-in">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <Crown size={20} strokeWidth={1.5} className="text-cf-gold" />
          <span className="text-base md:text-lg-apple font-display font-semibold text-cf-gold">{currentPlan.nome} ✦</span>
        </div>
        <div className="flex items-baseline gap-2 mb-3 md:mb-4">
          <span className="font-mono text-xl md:text-2xl-apple text-foreground">{formatCurrency(currentPlan.preco)}</span>
          <span className="text-xs md:text-sm-apple text-muted-foreground">{currentPlan.periodo}</span>
        </div>
        <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
          {currentPlan.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-xs md:text-sm-apple text-foreground">
              <Check size={14} strokeWidth={1.5} className="text-cf-green flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {subscription.subscribed ? (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 bg-secondary text-foreground rounded-lg text-xs md:text-sm-apple font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
            >
              {portalLoading ? <Loader2 size={16} className="animate-spin" /> : <ExternalLink size={16} />}
              Gerenciar Assinatura
            </button>
          ) : (
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="flex items-center justify-center gap-2 px-5 md:px-6 py-2.5 bg-gradient-to-r from-cf-gold to-[hsl(39,55%,48%)] text-background rounded-lg text-xs md:text-sm-apple font-semibold hover:opacity-90 active:scale-[0.97] transition-all"
            >
              {checkoutLoading ? <Loader2 size={16} className="animate-spin" /> : null}
              Assinar Agora
            </button>
          )}
        </div>
      </div>

      {/* Cancel Flow - only for subscribed users */}
      {subscription.subscribed && (
        <Dialog open={cancelStep > 0} onOpenChange={(open) => { if (!open) { setCancelStep(0); setCancelReason(''); setCancelConfirm(''); } }}>
          <DialogContent className="glass-card bg-card mx-4 md:mx-auto">
            {cancelStep === 1 && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <AlertTriangle size={18} strokeWidth={1.5} className="text-cf-red" />
                    Tem certeza?
                  </DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <p className="text-xs md:text-sm-apple text-muted-foreground mb-3">Ao cancelar, você perderá acesso a:</p>
                  <ul className="space-y-1.5">
                    {currentPlan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs md:text-sm-apple text-cf-red/80">
                        <X size={12} strokeWidth={1.5} className="flex-shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                  <button onClick={() => setCancelStep(0)} className="px-4 py-2 text-xs md:text-sm-apple text-foreground font-medium">Manter plano</button>
                  <button onClick={handleManageSubscription} className="px-4 py-2 text-xs md:text-sm-apple text-cf-red hover:opacity-80">Cancelar via portal</button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Plano;
