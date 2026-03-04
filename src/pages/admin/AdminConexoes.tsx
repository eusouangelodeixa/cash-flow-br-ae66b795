import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle2, XCircle, RefreshCw, MessageSquare, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  secretKeys: string[];
  testFn: () => Promise<void>;
}

const AdminConexoes = () => {
  const [statuses, setStatuses] = useState<Record<string, 'verificando' | 'conectado' | 'erro' | 'pendente'>>({
    stripe: 'verificando',
    uazapi: 'verificando',
    openai: 'verificando',
  });
  const [lastChecks, setLastChecks] = useState<Record<string, string>>({});

  const testStripe = async () => {
    setStatuses(s => ({ ...s, stripe: 'verificando' }));
    try {
      const { error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setStatuses(s => ({ ...s, stripe: 'conectado' }));
      setLastChecks(c => ({ ...c, stripe: new Date().toISOString() }));
      toast.success('Stripe conectado com sucesso');
    } catch {
      setStatuses(s => ({ ...s, stripe: 'erro' }));
      setLastChecks(c => ({ ...c, stripe: new Date().toISOString() }));
      toast.error('Falha ao conectar com o Stripe');
    }
  };

  const testUazapi = async () => {
    setStatuses(s => ({ ...s, uazapi: 'verificando' }));
    try {
      const { error } = await supabase.functions.invoke('whatsapp-send', {
        body: { action: 'test' },
      });
      if (error) throw error;
      setStatuses(s => ({ ...s, uazapi: 'conectado' }));
      setLastChecks(c => ({ ...c, uazapi: new Date().toISOString() }));
      toast.success('Uazapi conectado com sucesso');
    } catch {
      setStatuses(s => ({ ...s, uazapi: 'erro' }));
      setLastChecks(c => ({ ...c, uazapi: new Date().toISOString() }));
      toast.error('Falha ao conectar com Uazapi');
    }
  };

  const testOpenai = async () => {
    setStatuses(s => ({ ...s, openai: 'verificando' }));
    try {
      const { error } = await supabase.functions.invoke('whatsapp-process-audio', {
        body: { action: 'test' },
      });
      if (error) throw error;
      setStatuses(s => ({ ...s, openai: 'conectado' }));
      setLastChecks(c => ({ ...c, openai: new Date().toISOString() }));
      toast.success('OpenAI conectado com sucesso');
    } catch {
      setStatuses(s => ({ ...s, openai: 'erro' }));
      setLastChecks(c => ({ ...c, openai: new Date().toISOString() }));
      toast.error('Falha ao conectar com OpenAI');
    }
  };

  const integrations: Integration[] = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Gateway de pagamento para assinaturas recorrentes via cartão de crédito.',
      icon: CreditCard,
      secretKeys: ['STRIPE_SECRET_KEY'],
      testFn: testStripe,
    },
    {
      id: 'uazapi',
      name: 'Uazapi',
      description: 'Integração WhatsApp Business para receber e enviar mensagens.',
      icon: MessageSquare,
      secretKeys: ['UAZAPI_URL', 'UAZAPI_TOKEN'],
      testFn: testUazapi,
    },
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'Transcrição de áudio via Whisper e interpretação de comandos via GPT para automação por voz.',
      icon: Brain,
      secretKeys: ['OPENAI_API_KEY'],
      testFn: testOpenai,
    },
  ];

  useEffect(() => {
    testStripe();
    testUazapi();
    testOpenai();
  }, []);

  const getStatusInfo = (status: string) => ({
    verificando: { icon: RefreshCw, label: 'Verificando...', pillClass: 'text-muted-foreground' },
    conectado: { icon: CheckCircle2, label: 'Conectado', pillClass: 'text-cf-green' },
    erro: { icon: XCircle, label: 'Erro', pillClass: 'text-cf-red' },
    pendente: { icon: XCircle, label: 'Pendente', pillClass: 'text-cf-gold' },
  }[status] || { icon: XCircle, label: 'Desconhecido', pillClass: 'text-muted-foreground' });

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl-apple md:text-3xl-apple font-display font-semibold text-foreground">Conexões</h1>
        <p className="text-sm-apple text-muted-foreground mt-1">Integrações ativas do sistema</p>
      </div>

      <div className="space-y-4">
        {integrations.map((integration, index) => {
          const status = statuses[integration.id] || 'pendente';
          const info = getStatusInfo(status);
          const StatusIcon = info.icon;

          return (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="glass-card p-5 md:p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <integration.icon size={20} strokeWidth={1.5} className="text-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base-apple font-display font-semibold text-foreground">{integration.name}</h3>
                    <p className="text-xs-apple text-muted-foreground">{integration.id === 'stripe' ? 'Pagamentos' : integration.id === 'uazapi' ? 'WhatsApp' : 'IA / Transcrição'}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 text-sm-apple font-medium ${info.pillClass}`}>
                  <StatusIcon size={14} className={status === 'verificando' ? 'animate-spin' : ''} />
                  {info.label}
                </span>
              </div>

              <p className="text-sm-apple text-muted-foreground">{integration.description}</p>

              {integration.secretKeys.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs-apple text-muted-foreground">
                    Secrets necessários: {integration.secretKeys.map(k => (
                      <code key={k} className="mx-1 px-1.5 py-0.5 bg-secondary rounded text-xs">{k}</code>
                    ))}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-border/50">
                {lastChecks[integration.id] && (
                  <p className="text-xs-apple text-muted-foreground">
                    Última verificação: {new Date(lastChecks[integration.id]).toLocaleString('pt-BR')}
                  </p>
                )}
                <button
                  onClick={integration.testFn}
                  disabled={status === 'verificando'}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-muted-foreground rounded-lg text-xs-apple font-medium hover:text-foreground transition-colors disabled:opacity-50 ml-auto"
                >
                  <RefreshCw size={14} />
                  Testar Conexão
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminConexoes;
