import { Handshake, Mic, Bot, CheckCircle2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { motion } from 'framer-motion';

const steps = [
  { icon: Handshake, title: 'Você fecha a venda', desc: 'Presencialmente ou pelo celular com seu cliente. Como você já faz hoje.', emoji: '🤝' },
  { icon: Mic, title: 'Envia um áudio', desc: 'Um áudio rápido explicando o que foi vendido: modelo, valor, se foi troca ou não.', emoji: '🎙️' },
  { icon: Bot, title: 'O sistema interpreta', desc: 'A IA transcreve o áudio, lê o texto e identifica todos os dados da venda automaticamente.', emoji: '🤖' },
  { icon: CheckCircle2, title: 'Venda registrada', desc: 'Seu dashboard atualiza em tempo real. Estoque, faturamento e histórico — tudo certinho.', emoji: '✅' },
];

const HowItWorksSection = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="como-funciona" ref={ref} className="py-20 md:py-28 px-5 scroll-mt-20">
      <div className="max-w-[900px] mx-auto">
        <div className="text-center mb-14">
          <span className="label-uppercase text-primary tracking-[2px]">COMO FUNCIONA</span>
          <h2 className="font-display font-bold text-2xl-apple md:text-3xl-apple text-foreground mt-3 mb-3">
            Da voz ao sistema em segundos
          </h2>
          <p className="text-base-apple text-muted-foreground">
            Sem app extra. Sem formulário. Só um áudio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-border" />

          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center mx-auto mb-4 relative z-10">
                <span className="text-lg">{s.emoji}</span>
              </div>
              <h3 className="font-display font-semibold text-base-apple text-foreground mb-2">{s.title}</h3>
              <p className="text-sm-apple text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
