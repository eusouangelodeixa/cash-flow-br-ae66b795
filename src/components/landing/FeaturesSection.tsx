import { BarChart3, Package, ArrowLeftRight, History, Smartphone, Mic } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const features = [
  {
    icon: BarChart3,
    title: 'Visibilidade financeira em tempo real',
    desc: 'KPIs de estoque, vendas e faturamento com filtros por dia, semana, mês e ano. Você sabe exatamente quanto tem e quanto ganhou.',
    span: 'md:col-span-2',
    iconColor: 'text-primary',
    chart: true,
  },
  {
    icon: Mic,
    title: 'Registre vendas com a voz',
    desc: 'Fechou uma venda? Envie um áudio. O sistema transcreve, interpreta e registra automaticamente. Zero digitação.',
    span: 'md:col-span-2',
    iconColor: 'text-cf-gold',
    badge: '✦ Exclusivo',
    gold: true,
  },
  {
    icon: Package,
    title: 'Controle total do estoque',
    desc: 'Cadastre aparelhos, filtre por modelo, cor e condição, e saiba exatamente o que tem disponível para venda.',
    span: 'md:col-span-1',
    iconColor: 'text-foreground',
  },
  {
    icon: ArrowLeftRight,
    title: 'Trocas organizadas, sem perder dinheiro',
    desc: 'Aparelhos recebidos em troca entram como "Em Revisão" automaticamente. Defina o preço e libere para venda com um clique.',
    span: 'md:col-span-1',
    iconColor: 'text-cf-gold',
    pulse: true,
  },
  {
    icon: History,
    title: 'Histórico financeiro completo',
    desc: 'Acompanhe cada venda, cada entrada e cada saída. Relatórios claros para você saber exatamente quanto lucrou.',
    span: 'md:col-span-1',
    iconColor: 'text-primary',
  },
  {
    icon: Smartphone,
    title: 'Feito para o celular',
    desc: 'Interface otimizada para mobile. Acesse de qualquer lugar, na palma da mão.',
    span: 'md:col-span-1',
    iconColor: 'text-foreground',
  },
];

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="funcionalidades" ref={ref} className="py-20 md:py-28 px-5 scroll-mt-20">
      <div className="max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="label-uppercase text-cf-gold tracking-[2px]">FUNCIONALIDADES</span>
          <h2 className="font-display font-bold text-2xl-apple md:text-3xl-apple text-foreground mt-3 mb-3">
            Tudo que você precisa, nada que não precisa.
          </h2>
          <p className="text-base-apple text-muted-foreground max-w-[480px] mx-auto">
            Cada módulo foi projetado para o dia a dia real de uma revenda de iPhone.
          </p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`glass-card p-6 relative overflow-hidden ${f.span} ${f.gold ? 'border-cf-gold/30' : ''}`}
              style={f.gold ? { borderColor: 'rgba(212,168,83,0.3)' } : undefined}
            >
              {f.badge && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-cf-gold/10 text-cf-gold text-[11px] font-medium mb-4">
                  {f.badge}
                </span>
              )}
              <f.icon size={24} strokeWidth={1.5} className={`${f.iconColor} mb-4`} />
              <h3 className="font-display font-semibold text-lg-apple text-foreground mb-2">{f.title}</h3>
              <p className="text-sm-apple text-muted-foreground leading-relaxed">{f.desc}</p>

              {f.pulse && (
                <div className="mt-4">
                  <span className="status-pill-amber animate-pulse-review text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-cf-gold inline-block" /> Em Revisão
                  </span>
                </div>
              )}

              {f.chart && (
                <div className="mt-4 flex items-end gap-1 h-10">
                  {[40, 65, 45, 80, 55, 70, 90, 60, 85, 75].map((h, j) => (
                    <div
                      key={j}
                      className="flex-1 rounded-sm bg-primary/30"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
